"use client";

import { ReactNode } from "react";

export default function FormSection({
  title,
  children,
  className = ""
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={["mb-6", className].join(" ")}>
      <h2 className="mb-3 text-base font-semibold text-gray-700">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
