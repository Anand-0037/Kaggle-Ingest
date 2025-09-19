
import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="hsl(var(--primary-foreground))"
      fontFamily="sans-serif"
    >
      KI
    </text>
  </svg>
);
