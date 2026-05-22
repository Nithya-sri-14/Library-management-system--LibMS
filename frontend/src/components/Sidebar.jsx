import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiBook, FiUsers, FiUserCheck, FiRepeat, FiBarChart2,
  FiBell, FiSettings, FiChevronLeft, FiChevronRight, FiMenu, FiX, FiBookOpen,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid, roles: ['admin', 'librarian', 'borrower'] },
  { path: '/books', label: 'Books', icon: FiBook, roles: ['admin', 'librarian', 'borrower'] },
  { path: '/authors', label: 'Authors', icon: FiBookOpen, roles: ['admin', 'librarian'] },
  { path: '/borrowers', label: 'Borrowers', icon: FiUsers, roles: ['admin', 'librarian'] },
  { path: '/transactions', label: 'Transactions', icon: FiRepeat, roles: ['admin', 'librarian'] },
  { path: '/reports', label: 'Reports', icon: FiBarChart2, roles: ['admin', 'librarian'] },
  { path: '/notifications', label: 'Notifications', icon: FiBell, roles: ['admin', 'librarian', 'borrower'] },
  { path: '/settings', label: 'Settings', icon: FiSettings, roles: ['admin', 'librarian', 'borrower'] },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user } = useAuth();
  const [hovering, setHovering] = useState(false);
  const isExpanded = collapsed ? (hovering ? true : false) : true;

  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role));

  const sidebarContent = (
    <div
      className="h-full flex flex-col bg-primary-dark text-white"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
            <FiBook size={16} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold whitespace-nowrap overflow-hidden"
              >
                LibraryMS
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:block"
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className={`p-3 border-t border-white/10 ${isExpanded ? '' : 'text-center'}`}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="relative w-[260px] h-full"
            >
              {sidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
