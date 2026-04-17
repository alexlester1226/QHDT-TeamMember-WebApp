import React from 'react';

export default function TeamHeader({ name, title, bio }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
      <h1 className="text-3xl font-semibold text-slate-900">{name}</h1>
      {title && (
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">{title}</p>
      )}
      {bio && (
        <div className="mt-1 inline-flex items-center gap-2 text-xs text-slate-500">
          <span>Invite code:</span>
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
            {bio}
          </code>
        </div>
      )}
    </div>
  );
}
