// app/components/Logo.tsx
'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  src?: string; // optional: force a specific asset (e.g., '/logo-emblema.png')
  alt?: string;
}

export default function Logo({ width = 64, height = 64, className = '', src, alt }: LogoProps) {
  // Prefer vector if available; gracefully fallback to PNG
  const [currentSrc, setCurrentSrc] = React.useState<string>(src ?? '/logo.svg');

  React.useEffect(() => {
    if (src) setCurrentSrc(src);
  }, [src]);

  return (
    <div className={className} style={{ width, height, position: 'relative' }}>
      <Image
        src={currentSrc}
        alt={alt ?? 'SoftScout Logo'}
        width={width}
        height={height}
        style={{ objectFit: 'contain' }}
        priority
        onError={() => {
          if (currentSrc !== '/logo.png') setCurrentSrc('/logo.png');
        }}
      />
    </div>
  );
}
