import React from 'react';

export default function Person({ firstName, lastName, type }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  return (
    <li className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
        {initials || '?'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {firstName} {lastName}
        </p>
        {type && <p className="text-xs text-slate-500">{type}</p>}
      </div>
    </li>
  );
}
