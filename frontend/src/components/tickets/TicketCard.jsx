import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

const badgeBase =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

const categoryMap = {
  1: { label: "HR", color: "bg-indigo-50 text-indigo-700" },
  2: { label: "IT", color: "bg-emerald-50 text-emerald-700" },
  3: { label: "Facilities", color: "bg-amber-50 text-amber-700" },
  4: { label: "Others", color: "bg-slate-50 text-slate-700" },
};

const priorityMap = {
  1: { label: "High", color: "bg-red-50 text-red-700" },
  2: { label: "Medium", color: "bg-yellow-50 text-yellow-700" },
  3: { label: "Low", color: "bg-slate-50 text-slate-700" },
};

// ✅ FIX: Add all 4 status types
const statusMap = {
  1: { label: "Open", color: "bg-blue-50 text-blue-700" },
  2: { label: "In Progress", color: "bg-yellow-50 text-yellow-700" },
  3: { label: "Resolved", color: "bg-green-50 text-green-700" },
  4: { label: "Closed", color: "bg-slate-200 text-slate-700" },
};

const TicketCard = ({ ticket, actionLabel, onAction }) => {
  const navigate = useNavigate();

  // ✅ Handle both display strings and numeric values
  const getCategoryInfo = () => {
    if (ticket.category_display) {
      const displayToColor = {
        'HR': 'bg-indigo-50 text-indigo-700',
        'IT': 'bg-emerald-50 text-emerald-700',
        'Facilities': 'bg-amber-50 text-amber-700',
        'Others': 'bg-slate-50 text-slate-700'
      };
      return { label: ticket.category_display, color: displayToColor[ticket.category_display] || 'bg-slate-50 text-slate-700' };
    }
    return categoryMap[ticket.category] || categoryMap[4];
  };

  const getPriorityInfo = () => {
    if (ticket.priority_display) {
      const displayToColor = {
        'High': 'bg-red-50 text-red-700',
        'Medium': 'bg-yellow-50 text-yellow-700',
        'Low': 'bg-slate-50 text-slate-700'
      };
      return { label: ticket.priority_display, color: displayToColor[ticket.priority_display] || 'bg-slate-50 text-slate-700' };
    }
    return priorityMap[ticket.priority] || priorityMap[3];
  };

  const getStatusInfo = () => {
    if (ticket.status_display) {
      const displayToColor = {
        'Open': 'bg-blue-50 text-blue-700',
        'In Progress': 'bg-yellow-50 text-yellow-700',
        'Resolved': 'bg-green-50 text-green-700',
        'Closed': 'bg-slate-200 text-slate-700'
      };
      return { label: ticket.status_display, color: displayToColor[ticket.status_display] || 'bg-blue-50 text-blue-700' };
    }
    return statusMap[ticket.status] || statusMap[1];
  };

  const category = getCategoryInfo();
  const priority = getPriorityInfo();
  const status = getStatusInfo();

  const created = new Date(ticket.created_at).toLocaleString();

  const goToDetails = () => navigate(`/tickets/${ticket.id}`);

  return (
    <div
      className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
      onClick={goToDetails}
      role="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {ticket.subject}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {ticket.description}
          </p>
        </div>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={cn(badgeBase, category.color)}>
          {category.label}
        </span>
        <span className={cn(badgeBase, priority.color)}>
          Priority: {priority.label}
        </span>
        <span className={cn(badgeBase, status.color)}>{status.label}</span>
        <span className="ml-auto text-[11px] text-slate-400">
          Created: {created}
        </span>
      </div>
    </div>
  );
};

export default TicketCard;
