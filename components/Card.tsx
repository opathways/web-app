"use client";

import { ReactNode } from "react";

export default function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "bg-white rounded-lg shadow-subtle p-4",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}
