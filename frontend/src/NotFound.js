import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
