import React from 'react';
import clsx from 'clsx';
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const STYLES = {
  error: {
    wrap: 'bg-red-50 border-red-200 text-red-900',
    icon: 'text-red-500',
    Icon: ExclamationCircleIcon,
  },
  info: {
    wrap: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'text-blue-500',
    Icon: InformationCircleIcon,
  },
  success: {
    wrap: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: 'text-emerald-500',
    Icon: CheckCircleIcon,
  },
};

export default function Alert({ severity = 'info', children, className }) {
  const { wrap, icon, Icon } = STYLES[severity] || STYLES.info;
  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
        wrap,
        className,
      )}
    >
      <Icon className={clsx('h-5 w-5 flex-none', icon)} aria-hidden="true" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
