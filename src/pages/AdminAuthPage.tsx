import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, ChevronLeft, AlertCircle } from 'lucide-react';

export const AdminAuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is actually an admin in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      
      if (adminDoc.exists()) {
        navigate('/dashboard'); // Normally an admin dashboard, but for now just dashboard
      } else {
        // Not an admin
        setError('Unauthorized: Administrative privileges required.');
        await auth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden bg-black">
      {/* Background glow - Red for Admin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-red-500/5 blur-[120px] -z-10 rounded-full" />
      
      <div className="w-full max-w-md space-y-4">
        <button 
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest mb-4"
        >
          <ChevronLeft className="w-3 h-3" /> Back to Operator Login
        </button>

        <Card className="p-8 sm:p-10 border-red-500/20 bg-zinc-950/50 backdrop-blur-xl">
          <div className="text-center space-y-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tighter text-white uppercase italic">Command Central</h2>
              <p className="text-red-500/60 text-[10px] tracking-[0.3em] font-black uppercase">Restricted Access // Admin Only</p>
            </div>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Mail className="w-3 h-3" /> Admin Identifier
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 outline-none focus:border-red-500/40 focus:bg-red-500/10 transition-all font-mono text-sm"
                placeholder="admin@resumyy.ai"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Secure Passcode
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 outline-none focus:border-red-500/40 focus:bg-red-500/10 transition-all font-mono text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold uppercase tracking-tighter">{error}</span>
              </motion.div>
            )}

            <Button 
              className="w-full py-6 bg-red-600 hover:bg-red-500 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.2)]" 
              type="submit"
              loading={loading}
            >
              <Lock className="w-4 h-4 mr-2" /> OVERRIDE & ACCESS
            </Button>
          </form>

          <p className="text-center text-slate-600 text-[10px] mt-10 uppercase tracking-widest font-bold">
            All attempts are logged and monitored.
          </p>
        </Card>
      </div>
    </div>
  );
};
