'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Trash2, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { getAllComments, setCommentHidden, deleteComment } from '@/lib/comments';
import { getSpots, setSpotCommentsEnabled } from '@/lib/spots';
import { StarRatingDisplay } from '@/components/site/StarRating';
import { cn } from '@/lib/utils';
import type { Comment, Spot } from '@/types';

export default function CommentsAdminPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Comment | null>(null);

  async function load() {
    setLoading(true);
    const [c, s] = await Promise.all([getAllComments(), getSpots()]);
    setComments(c);
    setSpots(s);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const spotById = Object.fromEntries(spots.map((s) => [s.id, s]));

  async function toggleHidden(comment: Comment) {
    try {
      await setCommentHidden(comment.id, !comment.hidden);
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, hidden: !comment.hidden } : c))
      );
      toast.success(comment.hidden ? 'Comment shown' : 'Comment hidden');
    } catch {
      toast.error('Could not update that comment');
    }
  }

  async function toggleSpotLock(spot: Spot) {
    try {
      await setSpotCommentsEnabled(spot.id, !spot.commentsEnabled);
      setSpots((prev) =>
        prev.map((s) => (s.id === spot.id ? { ...s, commentsEnabled: !spot.commentsEnabled } : s))
      );
      toast.success(spot.commentsEnabled ? `Comments locked on "${spot.name}"` : `Comments unlocked on "${spot.name}"`);
    } catch {
      toast.error('Could not update that spot');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteComment(confirmDelete.id);
      setComments((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      toast.success('Comment deleted');
      setConfirmDelete(null);
    } catch {
      toast.error('Could not delete that comment');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white">
          Comments
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {comments.length} total · comments are auto-approved, no moderation queue
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          No comments yet.
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => {
            const spot = spotById[comment.spotId];
            return (
              <div
                key={comment.id}
                className={cn(
                  'rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900',
                  comment.hidden && 'opacity-60'
                )}
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {comment.authorName}
                    </p>
                    <StarRatingDisplay value={comment.rating} size="sm" />
                    {comment.hidden && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase text-neutral-400 dark:bg-neutral-800">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleHidden(comment)}
                      aria-label={comment.hidden ? 'Show comment' : 'Hide comment'}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                    >
                      {comment.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(comment)}
                      aria-label="Delete comment"
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {comment.text && (
                  <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-300">{comment.text}</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  {spot ? (
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/spots/${spot.id}/edit`} className="hover:text-river-600">
                        {spot.name}
                      </Link>
                      <button
                        onClick={() => toggleSpotLock(spot)}
                        className="flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-0.5 hover:border-river-300 dark:border-neutral-700"
                      >
                        {spot.commentsEnabled ? (
                          <>
                            <Unlock className="h-3 w-3" /> Comments open
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" /> Comments locked
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span>Spot deleted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-neutral-900">
            <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
              Delete this comment?
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">This can&apos;t be undone.</p>
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
