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
import { toast } from 'sonner';
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  reorderSubCategories,
} from '@/lib/sub-categories';
import { getCategories } from '@/lib/categories';
import { SubCategoryModal } from '@/components/admin/SubCategoryModal';
import { cn } from '@/lib/utils';
import type { Category, SubCategory } from '@/types';

function SortableRow({
  subCategory,
  categoryNames,
  onEdit,
  onDelete,
}: {
  subCategory: SubCategory;
  categoryNames: string[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subCategory.id,
  });

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
        aria-label={`Reorder ${subCategory.name}`}
        className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing dark:text-neutral-600"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 font-medium text-neutral-900 dark:text-white">
        {subCategory.name}
      </span>
      <div className="flex flex-wrap justify-end gap-1">
        {categoryNames.length === 0 ? (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
            Unassigned
          </span>
        ) : (
          categoryNames.map((n) => (
            <span
              key={n}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {n}
            </span>
          ))
        )}
      </div>
      <button
        onClick={onEdit}
        aria-label={`Edit ${subCategory.name}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Delete ${subCategory.name}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SubCategory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SubCategory | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    setLoading(true);
    const [subs, cats] = await Promise.all([getSubCategories(), getCategories()]);
    setSubCategories(subs);
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function categoryNamesFor(sc: SubCategory) {
    return sc.categoryIds
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter((n): n is string => Boolean(n));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = subCategories.findIndex((c) => c.id === active.id);
    const newIndex = subCategories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(subCategories, oldIndex, newIndex);
    setSubCategories(reordered);
    try {
      await reorderSubCategories(reordered.map((c) => c.id));
    } catch {
      toast.error('Could not save the new order');
      load();
    }
  }

  async function handleSave(input: { name: string; categoryIds: string[] }) {
    try {
      if (editing) {
        await updateSubCategory(editing.id, input);
        toast.success('Sub-category updated');
      } else {
        await createSubCategory(input);
        toast.success('Sub-category created');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error('Something went wrong saving that sub-category');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteSubCategory(confirmDelete.id);
      toast.success(`Deleted "${confirmDelete.name}"`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete that sub-category');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white">
            Sub-Categories
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Each one can belong to multiple categories. Drag to reorder.
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
          New sub-category
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : subCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          No sub-categories yet. Run{' '}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800">
            npm run seed
          </code>
          , or create one above.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={subCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {subCategories.map((sc) => (
                <SortableRow
                  key={sc.id}
                  subCategory={sc}
                  categoryNames={categoryNamesFor(sc)}
                  onEdit={() => {
                    setEditing(sc);
                    setModalOpen(true);
                  }}
                  onDelete={() => setConfirmDelete(sc)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {modalOpen && (
        <SubCategoryModal
          subCategory={editing}
          categories={categories}
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
