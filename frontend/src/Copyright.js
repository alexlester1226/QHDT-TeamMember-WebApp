import React from 'react';

export default function Copyright() {
  return (
    <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
      &copy; {new Date().getFullYear()} Queens Hyperloop Design Team. All rights reserved.
    </footer>
  );
}
