import React, { Fragment } from 'react';
import { Dialog as HDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Dialog({ open, onClose, title, description, children }) {
  return (
    <Transition show={open} as={Fragment}>
      <HDialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-95"
          >
            <HDialog.Panel className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title && (
                    <HDialog.Title className="text-lg font-semibold text-slate-900">
                      {title}
                    </HDialog.Title>
                  )}
                  {description && (
                    <HDialog.Description className="mt-1 text-sm text-slate-500">
                      {description}
                    </HDialog.Description>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">{children}</div>
            </HDialog.Panel>
          </Transition.Child>
        </div>
      </HDialog>
    </Transition>
  );
}
