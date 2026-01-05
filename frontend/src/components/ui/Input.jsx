import React from "react";
import { cn } from "../../utils/cn";

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200",
        className
      )}
      {...props}
    />
  );
};
