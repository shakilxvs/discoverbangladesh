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
  getDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  reorderDistricts,
} from '@/lib/districts';
import { DistrictModal } from '@/components/admin/DistrictModal';
import { cn } from '@/lib/utils';
import type { District } from '@/types';

function SortableRow({
  district,
  onEdit,
  onDelete,
}: {
  district: District;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: district.id,
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
        aria-label={`Reorder ${district.name}`}
        className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing dark:text-neutral-600"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 font-medium text-neutral-900 dark:text-white">{district.name}</span>
      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        {district.division}
      </span>
      <button
        onClick={onEdit}
        aria-label={`Edit ${district.name}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Delete ${district.name}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<District | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<District | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    setLoading(true);
    setDistricts(await getDistricts());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = search.trim()
    ? districts.filter((d) => d.name.toLowerCase().includes(search.trim().toLowerCase()))
    : districts;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || search.trim()) return;
    const oldIndex = districts.findIndex((d) => d.id === active.id);
    const newIndex = districts.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(districts, oldIndex, newIndex);
    setDistricts(reordered);
    try {
      await reorderDistricts(reordered.map((d) => d.id));
    } catch {
      toast.error('Could not save the new order');
      load();
    }
  }

  async function handleSave(input: { name: string; division: string }) {
    try {
      if (editing) {
        await updateDistrict(editing.id, input);
        toast.success('District updated');
      } else {
        await createDistrict(input);
        toast.success('District created');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error('Something went wrong saving that district');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteDistrict(confirmDelete.id);
      toast.success(`Deleted "${confirmDelete.name}"`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete that district');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white">
            Districts
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {districts.length} total · drag to reorder
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
          New district
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search districts…"
        className="mb-4 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white sm:max-w-xs"
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          {districts.length === 0 ? (
            <>
              No districts yet. Run{' '}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800">
                npm run seed
              </code>
              , or create one above.
            </>
          ) : (
            <>No districts match &ldquo;{search}&rdquo;.</>
          )}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((district) => (
                <SortableRow
                  key={district.id}
                  district={district}
                  onEdit={() => {
                    setEditing(district);
                    setModalOpen(true);
                  }}
                  onDelete={() => setConfirmDelete(district)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {modalOpen && (
        <DistrictModal
          district={editing}
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
              Spots already using this district keep the name as plain text — this only removes
              it from the picker. This can&apos;t be undone.
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
