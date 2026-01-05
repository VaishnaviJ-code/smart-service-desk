import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicketById, addComment, changeTicketStatus, assignTicketToMe } from "../services/ticketApi";
import { useAuth } from "../context/AuthContext";
import { Send, AlertCircle } from "lucide-react";


const badgeClasses = {
  priority: {
    High: "bg-red-50 text-red-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-emerald-50 text-emerald-700",
  },
  status: {
    Open: "bg-blue-50 text-blue-700",
    "In Progress": "bg-yellow-50 text-yellow-700",
    Resolved: "bg-green-50 text-green-700",
    Closed: "bg-slate-100 text-slate-700",
  },
};


const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false); // NEW: Track 404 state
  const { user } = useAuth();

  // Comment form state
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Status change
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  // Role-aware back path
  const backPath =
    user?.role === 3
      ? "/agent/dashboard"
      : user?.role === 1
      ? "/admin"
      : "/user/dashboard";

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError("");
      setNotFound(false); // Reset 404 state
      const data = await getTicketById(id);
      setTicket(data);
    } catch (err) {
      console.error("Ticket load error:", err.response?.data || err.message);
      
      // Check if it's a 404 error
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError("Unable to load ticket details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setCommentError("Please enter a comment");
      return;
    }

    try {
      setPosting(true);
      setCommentError("");
      await addComment(id, commentText);
      setCommentText("");
      await loadTicket();
    } catch (err) {
      console.error("Comment error:", err);
      setCommentError("Failed to post comment. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString();
  };

  const getPriorityLabel = (p) => {
    if (typeof p === "string") return p;
    if (p === 1) return "High";
    if (p === 2) return "Medium";
    if (p === 3) return "Low";
    return "Unknown";
  };

  const getStatusLabel = (s) => {
    if (typeof s === "string") return s;
    if (s === 1) return "Open";
    if (s === 2) return "In Progress";
    if (s === 3) return "Resolved";
    if (s === 4) return "Closed";
    return "Unknown";
  };

  const getCategoryLabel = (c) => {
    if (typeof c === "string") return c;
    if (c === 1) return "HR";
    if (c === 2) return "IT";
    if (c === 3) return "Facilities";
    if (c === 4) return "Others";
    return "Unknown";
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 space-y-3">
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-40 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  // 404 Not Found state - NEW
  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Ticket Not Found</h1>
          <p className="text-sm text-slate-600 mb-6">
            This ticket doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            <span className="text-lg leading-none">←</span>
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Generic error state
  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-sm text-primary-700 hover:underline"
        >
          <span className="text-lg leading-none">←</span>
          Back
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Unable to load ticket. Please try again."}
        </div>
      </div>
    );
  }

  const priorityLabel = getPriorityLabel(ticket.priority);
  const statusLabel = getStatusLabel(ticket.status);
  const categoryLabel = getCategoryLabel(ticket.category);

  const priorityClass =
    badgeClasses.priority[priorityLabel] || "bg-slate-100 text-slate-700";
  const statusClass =
    badgeClasses.status[statusLabel] || "bg-slate-100 text-slate-700";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition"
      >
        <span className="text-lg leading-none">←</span>
        <span>Back to dashboard</span>
      </button>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            #{ticket.id} · {ticket.subject}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-medium ${priorityClass}`}
            >
              Priority: {priorityLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-medium ${statusClass}`}
            >
              {statusLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              {categoryLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span>
            Created by:{" "}
            <span className="font-medium text-slate-700">
              {ticket.created_by_name || ticket.created_by?.full_name || "User"}
            </span>
          </span>
          <span>
            Assigned to:{" "}
            <span className="font-medium text-slate-700">
              {ticket.assigned_to_name ||
                ticket.assigned_to?.full_name ||
                "Unassigned"}
            </span>
          </span>
          <span>Created: {formatDateTime(ticket.created_at)}</span>
          <span>Last updated: {formatDateTime(ticket.updated_at)}</span>
        </div>
      </header>
      
      {/* Agent/Admin Actions - Only show if not closed */}
{(user?.role === 1 || user?.role === 3) && ticket.status !== 4 && (
  <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <label className="mb-3 block text-sm font-medium text-blue-900">
          {user?.role === 1 ? "Admin Actions" : "Ticket Actions"}
        </label>
        
        <div className="space-y-3">
          {/* Primary Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* AGENTS ONLY - Assign to Me - Show if: Open + Unassigned */}
            {user?.role === 3 && ticket.status === 1 && !ticket.assigned_to && (
              <button
                onClick={async () => {
                  try {
                    setChangingStatus(true);
                    setStatusError("");
                    
                    await assignTicketToMe(id);
                    await changeTicketStatus(id, 2);
                    await loadTicket();
                  } catch (err) {
                    console.error("Assign error:", err);
                    setStatusError("Failed to assign ticket.");
                  } finally {
                    setChangingStatus(false);
                  }
                }}
                disabled={changingStatus}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {changingStatus ? "Assigning..." : "Assign to Me"}
              </button>
            )}

            {/* ADMINS - Show reassign hint instead of button */}
            {user?.role === 1 && ticket.status === 1 && !ticket.assigned_to && (
              <div className="text-sm text-blue-800 bg-blue-100 rounded-lg px-3 py-2">
                💡 This ticket is unassigned. Use the Admin Dashboard to assign it to an agent, or use Advanced Options below to change status.
              </div>
            )}

            {/* AGENTS ONLY - Start Working - Show if: Open + Already Assigned */}
            {user?.role === 3 && ticket.status === 1 && ticket.assigned_to && (
              <button
                onClick={async () => {
                  try {
                    setChangingStatus(true);
                    setStatusError("");
                    
                    await changeTicketStatus(id, 2);
                    await loadTicket();
                  } catch (err) {
                    console.error("Start work error:", err);
                    setStatusError("Failed to start working.");
                  } finally {
                    setChangingStatus(false);
                  }
                }}
                disabled={changingStatus}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {changingStatus ? "Starting..." : "Start Working"}
              </button>
            )}

            {/* BOTH - Mark as Resolved - Show if: In Progress */}
            {ticket.status === 2 && (
              <button
                onClick={async () => {
                  try {
                    setChangingStatus(true);
                    setStatusError("");
                    
                    await changeTicketStatus(id, 3);
                    await loadTicket();
                  } catch (err) {
                    console.error("Resolve error:", err);
                    setStatusError("Failed to mark as resolved.");
                  } finally {
                    setChangingStatus(false);
                  }
                }}
                disabled={changingStatus}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition"
              >
                {changingStatus ? "Updating..." : "✓ Mark as Resolved"}
              </button>
            )}

            {/* BOTH - Close Ticket - Show if: Resolved */}
            {ticket.status === 3 && (
              <button
                onClick={async () => {
                  try {
                    setChangingStatus(true);
                    setStatusError("");
                    
                    await changeTicketStatus(id, 4);
                    await loadTicket();
                  } catch (err) {
                    console.error("Close error:", err);
                    setStatusError("Failed to close ticket.");
                  } finally {
                    setChangingStatus(false);
                  }
                }}
                disabled={changingStatus}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition"
              >
                {changingStatus ? "Closing..." : "Close Ticket"}
              </button>
            )}
          </div>

          {/* Advanced Override - Show for BOTH agents and admins */}
          <details className="text-xs">
            <summary className="cursor-pointer text-slate-500 hover:text-slate-700 underline decoration-dotted">
              advanced options
            </summary>
            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
              <label className="mb-2 block text-xs font-medium text-slate-700">
                Manual Status Override {user?.role === 1 && "(Admin)"}
              </label>
              <select
                value={ticket.status}
                onChange={async (e) => {
                  const newStatus = parseInt(e.target.value);
                  if (newStatus === ticket.status) return;
                  
                  try {
                    setChangingStatus(true);
                    setStatusError("");
                    await changeTicketStatus(id, newStatus);
                    await loadTicket();
                  } catch (err) {
                    console.error("Override error:", err);
                    setStatusError("Failed to update status.");
                  } finally {
                    setChangingStatus(false);
                  }
                }}
                disabled={changingStatus}
                className="w-full max-w-xs rounded border border-slate-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value={1}>Open</option>
                <option value={2}>In Progress</option>
                <option value={3}>Resolved</option>
                <option value={4}>Closed</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-400">
                ⚠️ Only use this to correct mistakes
              </p>
            </div>
          </details>

          {statusError && (
            <p className="text-xs text-red-700">{statusError}</p>
          )}
        </div>
      </div>
    </div>
  </section>
)}


      {/* Closed Ticket Notice */}
      {ticket.status === 4 && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-lg">🔒</span>
            <span>This ticket is closed and archived. No further actions allowed.</span>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">Description</h2>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap">
          {ticket.description}
        </div>
      </section>

      {/* Comments Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Comments ({ticket.comments?.length || 0})
        </h2>

        {/* Existing Comments */}
        {ticket.comments && ticket.comments.length > 0 ? (
          <div className="space-y-3">
            {ticket.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    {comment.user_name || comment.user?.full_name || "User"}
                  </span>
                  <span>{formatDateTime(comment.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap text-slate-800">
                  {comment.comment_text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs text-slate-500">
            No comments yet. Be the first to comment!
          </div>
        )}

        {/* Add Comment Form - Only show if ticket is not closed */}
        {ticket.status !== 4 ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
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

            {commentError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {commentError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={posting || !commentText.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="h-4 w-4" />
                {posting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 text-center">
            💬 This ticket is closed. Comments are disabled.
          </div>
        )}
      </section>
    </div>
  );
};

export default TicketDetail;
