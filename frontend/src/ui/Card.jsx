import React from 'react';
import clsx from 'clsx';

export default function Card({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag
      className={clsx(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
