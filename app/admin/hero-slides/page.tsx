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
import { GripVertical, Pencil, Plus, Trash2, ImageIcon, Video, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  type HeroSlideInput,
} from '@/lib/hero-slides';
import { HeroSlideModal } from '@/components/admin/HeroSlideModal';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/types';

function Thumb({ slide }: { slide: HeroSlide }) {
  const [broken, setBroken] = useState(false);
  if (slide.type === 'video' || broken || !slide.mediaUrl) {
    return (
      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300 dark:bg-neutral-800">
        {slide.type === 'video' ? (
          <Video className="h-4 w-4" />
        ) : (
          <ImageOff className="h-4 w-4" />
        )}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.mediaUrl}
      alt=""
      onError={() => setBroken(true)}
      className="h-12 w-20 shrink-0 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
    />
  );
}

function SortableRow({
  slide,
  onEdit,
  onDelete,
}: {
  slide: HeroSlide;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
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
        aria-label={`Reorder ${slide.title}`}
        className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing dark:text-neutral-600"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Thumb slide={slide} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-medium text-neutral-900 dark:text-white">
          {slide.type === 'image' ? (
            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          ) : (
            <Video className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          )}
          {slide.title}
        </p>
        {slide.subtitle && (
          <p className="truncate text-xs text-neutral-400">{slide.subtitle}</p>
        )}
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
          slide.active
            ? 'bg-river-50 text-river-700 dark:bg-river-950 dark:text-river-300'
            : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
        )}
      >
        {slide.active ? 'Active' : 'Hidden'}
      </span>
      <button
        onClick={onEdit}
        aria-label={`Edit ${slide.title}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Delete ${slide.title}`}
        className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HeroSlide | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    setLoading(true);
    setSlides(await getHeroSlides());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(slides, oldIndex, newIndex);
    setSlides(reordered);
    try {
      await reorderHeroSlides(reordered.map((s) => s.id));
    } catch {
      toast.error('Could not save the new order');
      load();
    }
  }

  async function handleSave(input: HeroSlideInput) {
    try {
      if (editing) {
        await updateHeroSlide(editing.id, input);
        toast.success('Slide updated');
      } else {
        await createHeroSlide(input);
        toast.success('Slide created');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error('Something went wrong saving that slide');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteHeroSlide(confirmDelete.id);
      toast.success(`Deleted "${confirmDelete.title}"`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete that slide');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white">
            Hero Slides
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The image/video banner at the top of the homepage. Drag to reorder; only active
            slides show up publicly.
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
          New slide
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          No slides yet — the homepage falls back to a plain heading until you add one.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {slides.map((slide) => (
                <SortableRow
                  key={slide.id}
                  slide={slide}
                  onEdit={() => {
                    setEditing(slide);
                    setModalOpen(true);
                  }}
                  onDelete={() => setConfirmDelete(slide)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {modalOpen && (
        <HeroSlideModal
          slide={editing}
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
              Delete &ldquo;{confirmDelete.title}&rdquo;?
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
