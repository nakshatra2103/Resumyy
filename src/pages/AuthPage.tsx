import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          userId: userCredential.user.uid,
          name,
          email,
          createdAt: new Date().toISOString()
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', result.user.uid), {
        userId: result.user.uid,
        name: result.user.displayName || 'User',
        email: result.user.email,
        createdAt: new Date().toISOString()
      }, { merge: true });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Auth failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-neon-cyan/5 blur-[100px] -z-10 rounded-full" />
      
      <Card className="w-full max-w-md p-8 sm:p-10 neon-border">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tighter">
            {isLogin ? 'ACCESS GRANTED' : 'INITIALIZE PROFILE'}
          </h2>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-bold">
            {isLogin ? 'Welcome back, Operator' : 'Join the elite engineering circle'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all"
                  placeholder="John Connor"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all font-mono"
              placeholder="operator@resumyy.ai"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all font-mono"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs font-bold text-center mt-2">{error}</p>}

          <Button 
            variant="neon" 
            className="w-full mt-6 py-6" 
            type="submit"
            loading={loading}
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isLogin ? 'AUTHENTICATE' : 'INITIALIZE'}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-black/80 px-2 text-gray-500">OR SECURE LOGIN</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full py-6 bg-white/5"
          onClick={signInWithGoogle}
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-2" alt="Google" />
          Continue with Google
        </Button>

        <p className="text-center text-gray-500 text-xs mt-8">
          {isLogin ? "Don't have an access code?" : "Already verified?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-neon-cyan font-bold hover:underline"
          >
            {isLogin ? 'CREATE ACCOUNT' : 'LOGIN HERE'}
          </button>
        </p>
      </Card>
    </div>
  );
};
