"use client";

import { Card as AmplifyCard, CardProps } from "@aws-amplify/ui-react";

/**
 * Design system aligned Card component:
 *   • White surface with proper elevation
 *   • Rounded corners per design system
 *   • Consistent padding and shadows
 *   • Follows OpenAI-style minimalist aesthetic
 */
export default function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <AmplifyCard
      className={[
        "bg-white rounded-lg shadow-card border border-gray-200/50",
        "p-6 transition-shadow duration-200 hover:shadow-lg",
        className
      ].join(" ")}
      {...rest}
    >
      {children}
    </AmplifyCard>
  );
}
