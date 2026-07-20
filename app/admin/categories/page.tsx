'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/categories';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const Icon = (Icons[category.icon as keyof typeof Icons] as Icons.LucideIcon) ?? Icons.MapPin;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${category.name}`}
        className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing dark:text-neutral-600"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-river-50 text-river-600 dark:bg-river-950 dark:text-river-400">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 font-medium text-neutral-900 dark:text-white">{category.name}</span>
      <span className="text-xs text-neutral-400">/{category.slug}</span>
      <button
        onClick={onEdit}
        aria-label={`Edit ${category.name}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Delete ${category.name}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    setLoading(true);
    setCategories(await getCategories());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    try {
      await reorderCategories(reordered.map((c) => c.id));
    } catch {
      toast.error('Could not save the new order');
      load();
    }
  }

  async function handleSave(input: { name: string; icon: string }) {
    try {
      if (editing) {
        await updateCategory(editing.id, input);
        toast.success('Category updated');
      } else {
        await createCategory(input);
        toast.success('Category created');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error('Something went wrong saving that category');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteCategory(confirmDelete.id);
      toast.success(`Deleted "${confirmDelete.name}"`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete that category');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Drag to reorder. This order controls how categories appear across the site.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700"
        >
          <Plus className="h-4 w-4" />
          New category
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          No categories yet. Run{' '}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800">
            npm run seed
          </code>
          , or create one above.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categories.map((category) => (
                <SortableRow
                  key={category.id}
                  category={category}
                  onEdit={() => {
                    setEditing(category);
                    setModalOpen(true);
                  }}
                  onDelete={() => setConfirmDelete(category)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {modalOpen && (
        <CategoryModal
          category={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-neutral-900">
            <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
              Delete &ldquo;{confirmDelete.name}&rdquo;?
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Any sub-categories assigned only to this category will be unassigned, not deleted.
              This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
