import { FormEvent, useEffect, useState } from 'react';
import Avatar from './Avatar';
import Spinner from './Spinner';
import { colorFromString } from '../utils/avatarColor';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { listCommentsRequest, createCommentRequest } from '../services/commentService';
import { Comment } from '../types';

interface TaskCommentsProps {
  taskId: string;
}

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

// Comment thread for TaskDetailModal's view mode — chronological (oldest
// first, matching the backend's ListService.Comment sort), author name+photo
// come pre-populated from the API same as Task.assignedTo.
function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    listCommentsRequest(taskId, { limit: 100 })
      .then((res) => {
        if (!cancelled) setComments(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Unable to load comments.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      const comment = await createCommentRequest(taskId, { text: text.trim() });
      setComments((prev) => [...prev, comment]);
      setText('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to post comment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">Comments</p>

      {isLoading ? (
        <div className="flex justify-center py-3">
          <Spinner size={18} />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 mb-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar
                name={comment.author?.name ?? 'Team member'}
                color={colorFromString(comment.author?.name ?? 'Team member')}
                imageUrl={comment.author?.photoUrl}
                size={26}
              />
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700">{comment.author?.name ?? 'Team member'}</span>
                  <span className="text-[11px] text-gray-400">{formatTimestamp(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-3">No comments yet.</p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Spinner size={14} />}
          Post
        </button>
      </form>
    </div>
  );
}

export default TaskComments;
