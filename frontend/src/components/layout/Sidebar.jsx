import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageCircleQuestion,
  MessageSquareText  // ✅ ADD THIS IMPORT
} from "lucide-react";
import { cn } from "../../utils/cn";

const Sidebar = ({ role }) => {
  const { pathname } = useLocation();

  const items = [];

  if (role === 2) {
    items.push({
      to: "/user/dashboard",
      label: "My Tickets",
      icon: LayoutDashboard
    });
  } else if (role === 3) {
    // ✅ AGENT GETS TWO ITEMS
    items.push(
      {
        to: "/agent/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard
      },
      {
        to: "/agent/quick-responses",
        label: "Quick Responses",
        icon: MessageSquareText
      }
    );
  } else if (role === 1) {
    // ✅ ADMIN GETS FOUR ITEMS
    items.push(
      {
        to: "/admin",
        label: "Admin Panel",
        icon: LayoutDashboard
      },
      {
        to: "/admin/users",
        label: "User Management",
        icon: Users
      },
      {
        to: "/admin/faq",
        label: "FAQ Management",
        icon: MessageCircleQuestion
      },
      {
        to: "/admin/kb",
        label: "Knowledge Base",
        icon: BookOpen
      },{
      to: "/admin/quick-responses",  // ✅ ADD THIS
      label: "Quick Responses",
      icon: MessageSquareText
    }
    );
  }

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-shrink-0 border-r border-slate-200 bg-white px-4 pt-6 md:flex md:flex-col overflow-y-auto">
      <div className="mb-8">
        <span className="text-lg font-semibold text-slate-900">
          Smart Service Desk
        </span>
        <p className="text-xs text-slate-500">Calm, internal support hub</p>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname === item.to || pathname.startsWith(item.to + "/")
                  ? "bg-primary-100 text-primary-700"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
