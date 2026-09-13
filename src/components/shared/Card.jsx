import React from 'react';
import { Link } from 'react-router-dom';

export default function Card({ 
  title, 
  image, 
  excerpt, 
  author, 
  date, 
  linkTo,
  children,
  className = ''
}) {
  return (
    <article className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {image && (
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {linkTo ? (
              <Link to={linkTo} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
        )}
        
        {excerpt && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}
        
        {(author || date) && (
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {author && <span>By {author}</span>}
            {date && <span>{date}</span>}
          </div>
        )}
        
        {children}
      </div>
    </article>
  );
}
