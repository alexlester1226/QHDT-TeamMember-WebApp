import React, { Fragment } from 'react';
import { Menu as HMenu, Transition } from '@headlessui/react';
import clsx from 'clsx';

export function Menu({ button, children }) {
  return (
    <HMenu as="div" className="relative inline-block text-left">
      <HMenu.Button as={Fragment}>{button}</HMenu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <HMenu.Items className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg focus:outline-none">
          {children}
        </HMenu.Items>
      </Transition>
    </HMenu>
  );
}

export function MenuItem({ onClick, children, icon: Icon }) {
  return (
    <HMenu.Item>
      {({ active }) => (
        <button
          type="button"
          onClick={onClick}
          className={clsx(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm',
            active ? 'bg-slate-100 text-slate-900' : 'text-slate-700',
          )}
        >
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
          {children}
        </button>
      )}
    </HMenu.Item>
  );
}
