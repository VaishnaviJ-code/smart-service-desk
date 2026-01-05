import React from "react";
import { cn } from "../../utils/cn";

export const Button = ({ className, variant = "primary", ...props }) => {
  const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600",
    ghost:
      "bg-transparent text-slate-800 hover:bg-slate-100 focus:ring-slate-300",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
};
