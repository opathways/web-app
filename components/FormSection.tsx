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
    <section className={`mb-8 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
        {children}
      </div>
    </section>
  );
}
