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
      <h3 className="mb-2 text-lg font-semibold text-gray-800">
        {title}
      </h3>

      {description && (
        <p className="mb-6 text-sm text-gray-600 leading-relaxed">{description}</p>
      )}

      <div className="space-y-6">{children}</div>
    </section>
  );
}
