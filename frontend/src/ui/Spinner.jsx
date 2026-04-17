import React from 'react';
import clsx from 'clsx';

export default function Spinner({ size = 'md', className }) {
  const dims = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-slate-300 border-t-blue-600',
        dims,
        className,
      )}
    />
  );
}
