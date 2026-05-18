import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { FileText, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0d0d12]/80 backdrop-blur-md border-b border-white/10 px-8 h-16 flex items-center justify-center">
      <div className="max-w-7xl w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">RESUMYY<span className="text-cyan-400 italic">.AI</span></span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              <Link to="/dashboard" className="transition-colors hover:text-white flex items-center gap-2 text-cyan-400">
                Dashboard
              </Link>
              <Link to="/upload" className="transition-colors hover:text-white flex items-center gap-2 text-slate-400">
                Optimize
              </Link>
              <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Operator</p>
                  <p className="text-sm text-white truncate max-w-[150px]">{user.displayName || user.email?.split('@')[0]}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2 bg-cyan-500 text-black rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
