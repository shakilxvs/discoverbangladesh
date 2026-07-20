'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { createComment, summarizeRating, type NewComment } from '@/lib/comments';
import { StarRatingDisplay, StarRatingInput } from './StarRating';
import type { Comment } from '@/types';

export function CommentsSection({
  spotId,
  initialComments,
  commentsEnabled,
}: {
  spotId: string;
  initialComments: Comment[];
  commentsEnabled: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const visible = comments.filter((c) => !c.hidden);
  const summary = summarizeRating(comments);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || rating === 0) {
      toast.error('Add your name and a star rating.');
      return;
    }
    setSubmitting(true);
    const input: NewComment = { spotId, authorName: name.trim(), rating, text: text.trim() || undefined };
    try {
      await createComment(input);
      setComments((prev) => [
        { id: `local-${Date.now()}`, ...input, hidden: false, createdAt: Date.now() },
        ...prev,
      ]);
      setName('');
      setRating(0);
      setText('');
      toast.success('Thanks for the review!');
    } catch {
      toast.error('Could not post that — try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
          Reviews
        </h2>
        <StarRatingDisplay value={summary.average} count={summary.count} />
      </div>

      {commentsEnabled ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <StarRatingInput value={rating} onChange={setRating} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700 disabled:opacity-50"
          >
            {submitting ? 'Posting…' : 'Post review'}
          </button>
        </form>
      ) : (
        <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-400 dark:border-neutral-700">
          Comments are closed for this spot.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-neutral-400">No reviews yet — be the first.</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((c) => (
            <li key={c.id} className="border-b border-neutral-100 pb-4 last:border-0 dark:border-neutral-800">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{c.authorName}</p>
                <StarRatingDisplay value={c.rating} size="sm" />
              </div>
              {c.text && <p className="text-sm text-neutral-600 dark:text-neutral-300">{c.text}</p>}
              <p className="mt-1 text-xs text-neutral-400">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
