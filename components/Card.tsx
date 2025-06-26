"use client";

import { Card as AmplifyCard, CardProps } from "@aws-amplify/ui-react";

/**
 * Re-skinned Amplify Card that applies our design system tokens:
 *   • bg-white surface
 *   • rounded-lg corners (8px)
 *   • shadow-card (defined in tailwind.config.js)
 *   • p-6 default padding (24px following 8px grid)
 *   • border for subtle definition
 */
export default function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <AmplifyCard
      className={[
        "bg-white rounded-lg shadow-card border border-gray-200 p-6",
        className
      ].join(" ")}
      {...rest}
    >
      {children}
    </AmplifyCard>
  );
}
