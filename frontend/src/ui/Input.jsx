import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input(
  { label, helper, error, className, type = 'text', id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const hasError = Boolean(error);
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={clsx(
          'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2',
          hasError
            ? 'border-red-400 text-red-900 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-200',
        )}
        {...rest}
      />
      {(helper || error) && (
        <p
          className={clsx(
            'mt-1.5 text-xs',
            hasError ? 'text-red-600' : 'text-slate-500',
          )}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
});

export default Input;
