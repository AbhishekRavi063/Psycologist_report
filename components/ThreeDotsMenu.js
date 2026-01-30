
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Children } from 'react';

export default function ThreeDotsMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current && typeof window !== 'undefined') {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 192;
      const padding = 8;
      const left = Math.max(
        padding,
        Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - padding)
      );
      setMenuPosition({
        top: rect.bottom + 8,
        left,
      });
    }
  };

  const toggleMenu = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (
      trigger && !trigger.contains(event.target) &&
      menu && !menu.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isDangerItem = (child) => {
    const className = child?.props?.className ?? '';
    return typeof className === 'string' && (className.includes('red') || className.includes('danger'));
  };

  const menuContent = isOpen && (
    <div
      ref={menuRef}
      className="fixed z-[100] w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
      role="menu"
      aria-orientation="vertical"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
      }}
    >
      <div className="py-1" role="none" onClick={() => setIsOpen(false)}>
        {Children.map(children, (child, index) => {
          const danger = isDangerItem(child);
          return (
            <div
              key={child?.key ?? index}
              className={`border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                danger ? 'hover:bg-red-50' : 'hover:bg-gray-100'
              }`}
            >
              <div className="[&>button]:block [&>button]:w-full [&>button]:text-left [&>button]:px-4 [&>button]:py-2 [&>button]:text-sm [&>button]:border-0 [&>button]:bg-transparent [&>button]:cursor-pointer [&>a]:block [&>a]:w-full [&>a]:text-left [&>a]:px-4 [&>a]:py-2 [&>a]:text-sm [&>a]:no-underline [&>a]:text-gray-700 [&>button]:text-gray-700">
                {child}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative inline-block text-left" ref={triggerRef}>
      <div>
        <button
          type="button"
          className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={toggleMenu}
        >
          <span className="sr-only">Open options</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {typeof document !== 'undefined' && menuContent && createPortal(menuContent, document.body)}
    </div>
  );
}
