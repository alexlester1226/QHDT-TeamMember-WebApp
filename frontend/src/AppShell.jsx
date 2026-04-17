import React, { Fragment, useContext, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import UserContext from './UserContext';
import { Menu, MenuItem } from './ui/Menu';

function navItemsFor(userInfo) {
  const items = [
    { to: '/', label: 'Home', icon: HomeIcon, end: true },
    { to: '/timeline', label: 'Timeline', icon: CalendarDaysIcon },
  ];
  if (userInfo?.team) {
    items.splice(1, 0, {
      to: `/team/${userInfo.team}`,
      label: 'My Team',
      icon: UsersIcon,
    });
  }
  if (userInfo?.type === 'Admin') {
    items.push({ to: '/admin', label: 'Admin', icon: ShieldCheckIcon });
  }
  if (userInfo?.is_staff) {
    items.push({ to: '/admin/teams', label: 'All Teams', icon: BuildingLibraryIcon });
  }
  return items;
}

function NavList({ items, onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )
          }
        >
          <item.icon className="h-5 w-5" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-4 py-5">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
        Q
      </span>
      <span className="text-sm font-semibold text-slate-900">QHDT Members</span>
    </div>
  );
}

function AccountButton() {
  const { userInfo, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  if (!userInfo) return null;

  const initials = `${userInfo.first_name?.[0] || ''}${userInfo.last_name?.[0] || ''}`.toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    updateUser(null);
    navigate('/login');
  };

  return (
    <Menu
      button={
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            {initials || '?'}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-slate-900">
              {userInfo.first_name} {userInfo.last_name}
            </span>
            {userInfo.type && (
              <span className="block text-xs text-slate-500">{userInfo.type}</span>
            )}
          </span>
          <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>
      }
    >
      <MenuItem onClick={handleLogout} icon={ArrowRightOnRectangleIcon}>
        Sign out
      </MenuItem>
    </Menu>
  );
}

export default function AppShell({ children }) {
  const { userInfo } = useContext(UserContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const items = navItemsFor(userInfo);

  useEffect(() => {
    if (userInfo === null) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile drawer */}
      <Transition show={drawerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setDrawerOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-200 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-150 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 flex w-72 flex-col border-r border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  aria-label="Close navigation"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <NavList items={items} onNavigate={() => setDrawerOpen(false)} />
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Desktop layout */}
      <div className="md:grid md:grid-cols-[16rem_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white md:flex md:h-screen md:sticky md:top-0 md:flex-col">
          <Brand />
          <NavList items={items} />
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                aria-label="Open navigation"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <h1 className="text-sm font-semibold text-slate-900 md:text-base">
                QHDT Member Management
              </h1>
            </div>
            <AccountButton />
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
