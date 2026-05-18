import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dataService.getUserResumes(user.uid).then(data => {
        setResumes(data || []);
        setLoading(false);
      });
    }
  }, [user]);

  const stats = [
    { label: 'Optimized', value: resumes.length, icon: FileText, color: 'text-neon-cyan' },
    { label: 'Avg. Score', value: resumes.length ? '84%' : '0%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Hours Saved', value: resumes.length * 2, icon: Clock, color: 'text-neon-blue' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#0d0d12]/50 p-6 flex flex-col gap-8 hidden lg:flex">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Main Menu</p>
          <button className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/upload')}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Upload New
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
        </div>
        <div className="mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-400/20 border border-white/10 text-center">
            <p className="text-[10px] text-cyan-300 font-bold mb-2 uppercase tracking-tight">AI Assistant Ready</p>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Optimizing resumes using Google Gemini 1.5 Pro</p>
            <Button variant="primary" size="sm" className="w-full text-[10px] py-1">Chat with AI</Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white">OPERATOR DASHBOARD</h1>
            <p className="text-slate-500 text-xs font-bold mt-1">
              Active Session: <span className="text-cyan-400">{user?.displayName || user?.email}</span>
            </p>
          </div>
          <Button variant="neon" onClick={() => navigate('/upload')}>
            <Plus className="w-5 h-5" /> New Optimization
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={stat.label} delay={i * 0.1} className="flex items-center gap-6 p-8 bg-[#121218]">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <stat.icon className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{stat.label}</div>
                <div className="text-3xl font-bold font-mono text-white">{stat.value}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Mission Log history</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : resumes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume, i) => (
                <Card 
                  key={resume.id} 
                  delay={i * 0.05} 
                  className="group cursor-pointer hover:border-cyan-500/20 transition-all p-8 flex flex-col h-full bg-[#121218]"
                  onClick={() => navigate(resume.status === 'uploaded' ? `/analysis/${resume.id}` : `/results/${resume.id}`)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-cyan-400/10 rounded-lg text-cyan-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase py-1 px-2 bg-cyan-400/10 rounded border border-cyan-400/20 tracking-tighter">
                      {resume.status}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1 truncate text-white">
                    {resume.jobTitle || 'Untailored Resume'}
                  </h3>
                  <p className="text-slate-500 text-xs mb-8">
                    Analyzed: {new Date(resume.uploadDate?.toDate()).toLocaleDateString()}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5 group-hover:border-white/10">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">View Analysis</span>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-20 flex flex-col items-center gap-6 bg-[#121218]">
              <div className="p-6 rounded-full bg-white/5">
                <FileText className="w-12 h-12 text-slate-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter">No Uplink Detected</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Initialize your first resume optimization to populate the mission log.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/upload')}>
                Start Initial Optimization
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};
