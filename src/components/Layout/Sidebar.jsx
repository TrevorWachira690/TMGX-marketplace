import React from 'react';
import { Link } from 'react-router-dom';

const SIDEBAR_LINKS = [
  { name: 'Listings', path: '/' },
  { name: 'Dashboard', path: '/admin' },
  { name: 'Profile', path: '/profile' },
  { name: 'Categories', path: '/categories' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <nav className="space-y-2">
        {SIDEBAR_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
