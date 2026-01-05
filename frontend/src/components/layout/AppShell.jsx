import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import { Button } from "../ui/Button";

const AppShell = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {user && <Sidebar role={user.role} />}

      <div className="flex flex-1 flex-col ml-0 md:ml-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Smart Service Desk
            </h1>
            <p className="text-xs text-slate-500">
              Calm, modern internal support interface
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <span className="text-sm font-medium text-slate-900">
                    {user.full_name || user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                  </span>
                  <span className="text-xs text-slate-500">
                    {user.role === 1 ? 'Admin' : user.role === 3 ? 'Agent' : 'User'}
                  </span>
                </div>
                <Button
                  variant="primary"
                  className="flex items-center gap-2 px-3 py-2 text-sm"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
