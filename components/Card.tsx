"use client";

import { Card as AmplifyCard, CardProps } from "@aws-amplify/ui-react";

/**
 * Re-skinned Amplify Card that applies our Tailwind tokens:
 *   • bg-white surface
 *   • rounded-lg corners
 *   • shadow-subtle (defined in tailwind.config.js)
 *   • p-4 default padding
 */
export default function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <AmplifyCard
      className={[
        "bg-white rounded-lg shadow-subtle p-4",
        className
      ].join(" ")}
      {...rest}
    >
      {children}
    </AmplifyCard>
  );
}
