import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { addComment } from '../../services/ticketApi';

const CommentSection = ({ ticket, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setPosting(true);
      setError('');
      await addComment(ticket.id, commentText);
      setCommentText('');
      // Trigger parent to reload ticket data
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Comment error:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const comments = ticket.comments || [];

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-slate-600" />
        <h3 className="text-base font-semibold text-slate-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 flex-shrink-0">
                  <User className="h-4 w-4 text-primary-700" />
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      {comment.user?.full_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {comment.comment_text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Add a comment
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type your comment here..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={posting}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={posting || !commentText.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="h-4 w-4" />
            {posting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
