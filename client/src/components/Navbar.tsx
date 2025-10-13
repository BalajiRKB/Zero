import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Channel Zero</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-primary-600 transition-colors"
          >
            Dashboard
          </Link>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User size={16} />
              <span>{user?.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;