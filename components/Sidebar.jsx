import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  TrendingUp,
  Shield,
  Lock,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', badge: null },
    { label: 'Contracts', icon: Shield, href: '/contracts', badge: null },
    { label: 'Analytics', icon: TrendingUp, href: '/analytics', badge: null },
  ];

  const bottomItems = [
    { label: 'Guardian Admin', icon: Lock, href: '/admin', badge: 'ADMIN' },
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 lg:static lg:translate-x-0 z-30 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={onClose}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="mt-12 pt-6 border-t border-gray-700">
            <nav className="space-y-2">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-red-600/20 text-red-400 border-l-4 border-red-400'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={onClose}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-600/30 text-red-400 text-xs font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-4 h-4" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
