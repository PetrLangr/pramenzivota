'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: 'fa-chart-line'
  },
  {
    name: 'Služby',
    href: '/admin/services',
    icon: 'fa-heart'
  },
  {
    name: 'Zaměstnanci',
    href: '/admin/employees',
    icon: 'fa-users'
  },
  {
    name: 'Rezervace',
    href: '/admin/appointments',
    icon: 'fa-calendar'
  },
  {
    name: 'Zákazníci',
    href: '/admin/customers',
    icon: 'fa-user-friends'
  },
  {
    name: 'Nastavení',
    href: '/admin/settings',
    icon: 'fa-cog'
  }
];

export default function AdminNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/pramen_zivota_logo_header.png"
                  alt="Pramen života s.r.o."
                />
                <span className="ml-3 text-xl font-semibold text-gray-900">
                  Administrace
                </span>
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`fas ${item.icon} mr-2`}></i>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right side */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              type="button"
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">View notifications</span>
              <i className="fas fa-bell h-6 w-6"></i>
            </button>
            
            <div className="ml-3 relative">
              <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </button>
            </div>
            
            {/* Back to site */}
            <Link
              href="/"
              className="ml-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              <i className="fas fa-external-link-alt mr-1"></i>
              Zpět na web
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}