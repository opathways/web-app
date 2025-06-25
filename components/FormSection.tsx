"use client";

import { Heading, View } from "@aws-amplify/ui-react";
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
      <Heading level={5} className="mb-2 text-gray-800">
        {title}
      </Heading>

      {description && (
        <p className="mb-4 text-sm text-gray-600">{description}</p>
      )}

      <View className="space-y-4">{children}</View>
    </section>
  );
}
