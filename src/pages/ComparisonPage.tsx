import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  FileText,
  Zap,
  ArrowRight,
  Maximize2,
  Sparkles
} from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuth();
  const [resume, setResume] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && resumeId) {
      dataService.getResume(user.uid, resumeId).then(setResume);
    }
  }, [user, resumeId]);

  if (!resume || !resume.optimizedResume) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono tracking-widest animate-pulse">GENERATING COMPARISON MATRIX...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">Optimization Matrix</h1>
          <p className="text-slate-500 text-sm font-medium italic">Status: <span className="text-cyan-400">Target Score Reached ({resume.optimizedResume.score}%)</span></p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={() => navigate(`/results/${resumeId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Inspect Score
          </Button>
          <Button variant="neon" size="lg" className="px-8 shadow-[0_0_30px_rgba(34,211,238,0.2)]" onClick={() => navigate(`/download/${resumeId}`)}>
            Download PDF <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Comparison Columns */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[600px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] px-2 font-bold uppercase tracking-widest text-slate-500">
              <span>Original Source</span>
              <span className="text-red-400">Score: {resume.originalResume.score || 0}%</span>
            </div>
            <Card className="flex-1 bg-black/40 border-white/5 p-8 overflow-y-auto opacity-60 grayscale hover:grayscale-0 transition-all">
              <pre className="whitespace-pre-wrap text-[10px] leading-relaxed font-mono text-slate-500">
                {resume.originalResume.text}
              </pre>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent h-24 bottom-0 pointer-events-none"></div>
            </Card>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] px-2 font-bold uppercase tracking-widest text-cyan-400">
              <span>Neural Reconstruction</span>
              <span className="text-green-400">Score: {resume.optimizedResume.score}%</span>
            </div>
            <Card className="flex-1 bg-white/[0.03] border-cyan-500/20 p-8 overflow-y-auto shadow-[inset_0_0_40px_rgba(34,211,238,0.05)] relative">
              <div className="space-y-8 text-xs">
                <div className="space-y-4">
                  <h4 className="text-center text-xl font-bold tracking-tight text-white mb-1 uppercase">{user?.displayName || 'OPERATOR'}</h4>
                  <div className="flex justify-center gap-4 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    <span>{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 border-b border-cyan-500/20 pb-1">Professional Impact</h5>
                  <p className="text-slate-300 italic leading-relaxed">
                    {resume.optimizedResume.summary}
                  </p>
                </div>

                <div className="space-y-6">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 border-b border-cyan-500/20 pb-1">Core Experience</h5>
                  {resume.optimizedResume.experience.map((exp: any, i: number) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between font-bold text-white text-[11px]">
                        <span>{exp.title}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{exp.company}</span>
                      </div>
                      <ul className="space-y-2">
                        {exp.bullets.map((bullet: string, j: number) => (
                          <li key={j} className="text-[10px] text-slate-400 flex gap-3 leading-relaxed">
                            <span className="text-cyan-400 font-bold leading-none mt-1">›</span>
                            <span dangerouslySetInnerHTML={{ __html: bullet.replace(/([A-Z][a-z]+)/g, '<span class="text-slate-300">$1</span>') }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ATS Score & Insights */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <Card className="p-10 flex flex-col items-center justify-center bg-[#121218] relative overflow-hidden text-center">
            <div className="w-32 h-32 rounded-full border-[10px] border-slate-800 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="64" cy="64" r="54" className="stroke-cyan-400 fill-none" strokeWidth="10" strokeDasharray="339.3" strokeDashoffset={339.3 * (1 - (resume.optimizedResume.score / 100))} strokeLinecap="round" />
               </svg>
               <span className="text-4xl font-black text-white font-mono tracking-tighter">{resume.optimizedResume.score}<span className="text-sm text-cyan-400">%</span></span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-6">{resume.optimizedResume.score > 80 ? 'Strong Match' : 'Match Improved'}</p>
            <p className="text-[10px] text-green-400 mt-2 font-mono uppercase">+{Math.round(((resume.optimizedResume.score - (resume.originalResume.score || 0)) / (resume.originalResume.score || 1)) * 100)}% Baseline Improvement</p>
          </Card>

          <Card className="flex-1 p-8 bg-[#121218] border-white/5 space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 border-l-2 border-cyan-400 pl-3">Neural Injections</p>
            <div className="space-y-3">
              {resume.optimizedResume.skills.slice(0, 5).map((skill: string) => (
                <div key={skill} className="flex items-center justify-between p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none">{skill}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] text-green-500 font-bold tracking-tighter">ADDED</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-cyan-400/10 to-transparent border border-cyan-400/10 relative">
              <Sparkles className="absolute top-2 right-2 w-4 h-4 text-cyan-400/30" />
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                "AI Observation: Your reconstruction now ranks in the top 5% for technical keyword density for this role."
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
