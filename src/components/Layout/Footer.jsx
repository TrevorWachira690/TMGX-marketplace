import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
      <div className="max-w-4xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} TBM-DeepIn. All rights reserved.</p>
        <p className="mt-1">A community marketplace platform built with React & Node.js</p>
      </div>
    </footer>
  );
}
