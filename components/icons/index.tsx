"use client";

import * as React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const PlusIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M8 3.5V12.5M3.5 8H12.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M10.5 3.5L12.5 5.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M11 7C12.1046 7 13 6.10457 13 5C13 3.89543 12.1046 3 11 3C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M11 9H15V13H11V9Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M1 9H7V13H1V9Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M9 1H3C2.44772 1 2 1.44772 2 2V14C2 14.5523 2.44772 15 3 15H13C13.5523 15 14 14.5523 14 14V6L9 1Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M9 1V6H14" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const BuildingIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M2 15H14V3H2V15Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M6 15V11H10V15" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M4 7H6" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M10 7H12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M4 9H6" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M10 9H12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M8 1L15 14H1L8 1Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M8 6V9" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <circle 
      cx="8" 
      cy="12" 
      r="0.5" 
      fill="currentColor"
    />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M13.5 4.5L6 12L2.5 8.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 4L4 12M4 4L12 12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const LocationIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M8 1C5.79086 1 4 2.79086 4 5C4 8 8 15 8 15C8 15 12 8 12 5C12 2.79086 10.2091 1 8 1Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <circle 
      cx="8" 
      cy="5" 
      r="1.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const MailIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M2 3H14V13H2V3Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M2 3L8 8L14 3" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle 
      cx="8" 
      cy="8" 
      r="7" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M1 8H15" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
    <path 
      d="M8 1C9.5 3 10 5.5 10 8C10 10.5 9.5 13 8 15C6.5 13 6 10.5 6 8C6 5.5 6.5 3 8 1Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="butt" 
      strokeLinejoin="miter"
    />
  </svg>
);
