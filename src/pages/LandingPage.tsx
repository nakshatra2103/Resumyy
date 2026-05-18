import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Target, 
  ArrowRight, 
  Cpu, 
  Sparkles,
  Search
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            <Sparkles className="w-3 h-3" />
            AI-Engine Connected • v2.4.0
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-7xl md:text-9xl font-bold tracking-tighter text-white leading-[0.9]"
          >
            RECODE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">CAREER MATRIX</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
          >
            The premium AI-driven optimization engine that transforms resumes 
            into machine-readable assets with over <span className="text-white font-medium">94% ATS accuracy.</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          >
            <Button 
              variant="neon" 
              size="lg" 
              className="w-full sm:w-auto px-10 h-14"
              onClick={() => navigate('/upload')}
            >
              Initialize Uplink <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-10 h-14"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-[#0d0d12]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">Neural Features</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">Industry-leading tech stack built on Gemini 1.5 Pro infrastructure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group p-10 hover:border-cyan-500/20 transition-all bg-black/40">
              <Zap className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3 text-white">Rapid Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Extract raw markdown data from PDFs for precise structural matching against job protocols.</p>
            </Card>
            
            <Card className="group p-10 hover:border-cyan-500/20 transition-all bg-black/40" delay={0.1}>
              <Cpu className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3 text-white">Gemini Optimization</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Contextual re-engineering of experience metrics to highlight maximum business impact.</p>
            </Card>
            
            <Card className="group p-10 hover:border-cyan-500/20 transition-all bg-black/40" delay={0.2}>
              <ShieldCheck className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3 text-white">Data Integrity</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Binary-safe processing ensures your professional experience remains authentic and verified.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 border-t border-white/5 bg-[#0d0d12] flex items-center justify-center px-8 text-[10px] text-slate-500 mt-auto">
        <div className="max-w-7xl w-full flex items-center justify-between">
          <div className="flex gap-4">
            <span>Version 2.4.0 (Beta)</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> AI Engine Connected</span>
          </div>
          <p className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <span>&copy; 2026 RESUMYY AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
