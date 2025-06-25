"use client";

import { ReactNode } from "react";

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function FormSection({
  title,
  description,
  children,
  className = ""
}: FormSectionProps) {
  return (
    <section className={["mb-8", className].join(" ")}>
      <h5 className="mb-2 text-gray-800 text-lg font-semibold">
        {title}
      </h5>

      {description && (
        <p className="mb-4 text-sm text-gray-600">{description}</p>
      )}

      <div className="space-y-4">{children}</div>
    </section>
  );
}
