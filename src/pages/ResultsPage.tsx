import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { doc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const ResultsPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuth();
  const [resume, setResume] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && resumeId) {
      dataService.getResume(user.uid, resumeId).then(setResume).catch(err => {
        console.error(err);
        setError('Error synchronizing resume data.');
      });
      
      // Fetch latest score
      const scoresPath = `users/${user.uid}/scores`;
      const q = query(collection(db, scoresPath), where('resumeId', '==', resumeId));
      getDocs(q).then(snapshot => {
        if (!snapshot.empty) {
          const sorted = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setScore(sorted[0]);
        }
      }).catch(err => {
        console.error(err);
        setError('Error synchronizing analysis metrics.');
      });
    }
  }, [user, resumeId]);

  const handleOptimize = async () => {
    if (!resume || !score || !user || !resumeId) return;
    setOptimizing(true);
    setError('');
    
    try {
      const { data: optimization } = await axios.post('/api/optimize', {
        resumeText: resume.originalResume.text,
        jobDescription: resume.jobDescription.text,
        missingKeywords: score.missingKeywords
      });

      const resumeRef = doc(db, `users/${user.uid}/resumes/${resumeId}`);
      await updateDoc(resumeRef, {
        status: 'optimized',
        optimizedResume: {
          text: optimization.optimizedResumeText,
          summary: optimization.summary,
          skills: optimization.skills,
          experience: optimization.experience,
          score: optimization.newScore
        }
      });

      // Also update the score doc with the new optimized score
      const scoreRef = doc(db, `users/${user.uid}/scores/${score.id}`);
      await updateDoc(scoreRef, {
        optimizedScore: optimization.newScore,
        improvementPercentage: (optimization.newScore || 0) - (score.originalScore || 0)
      });

      navigate(`/comparison/${resumeId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Optimization sequence failed.');
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  if (!resume || !score) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono tracking-widest animate-pulse">SYNCHRONIZING RESULTS...</div>;

  const scoreColor = score.originalScore > 70 ? 'text-green-400' : score.originalScore > 40 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = score.originalScore > 70 ? 'bg-green-400' : score.originalScore > 40 ? 'bg-yellow-400' : 'bg-red-400';
  const isLowScore = score.originalScore < 60;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {isLowScore && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${resume?.optimizedResume ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${resume?.optimizedResume ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'} flex items-center justify-center`}>
              {resume?.optimizedResume ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tighter">
                {resume?.optimizedResume ? 'Optimization Successfully Applied' : 'Critical Score Warning'}
              </h3>
              <p className="text-slate-400 text-sm">
                {resume?.optimizedResume 
                  ? `Neural reconstruction complete. New score: ${resume.optimizedResume.score}%.` 
                  : `Your resume score (${score.originalScore}%) falls below the standard ATS threshold of 60%.`}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {resume?.optimizedResume ? (
              <Button variant="neon" size="lg" className="w-full md:w-auto px-10 shadow-[0_0_20px_rgba(34,211,238,0.2)]" onClick={() => navigate(`/download/${resumeId}`)}>
                DOWNLOAD AI RESUME
              </Button>
            ) : (
              <Button variant="neon" size="lg" className="w-full md:w-auto px-10 shadow-[0_0_20px_rgba(239,68,68,0.2)]" onClick={handleOptimize} loading={optimizing}>
                {optimizing ? 'RECONSTRUCTING...' : 'FORCE RECONSTRUCTION'}
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">ATS DIAGNOSTICS</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-bold mt-1">Status: Optimization Recommended</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={() => navigate('/dashboard')}>
            Exit Protocol
          </Button>
          <Button variant="neon" size="lg" className="flex-1 md:flex-none min-w-[240px]" loading={optimizing} onClick={handleOptimize}>
            {optimizing ? 'RECONSTRUCTING...' : <><Sparkles className="w-5 h-5 mr-1" /> CORE OPTIMIZATION</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score & Keywords */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-10 neon-border flex flex-col md:flex-row items-center gap-12">
            <div className="relative">
              <svg className="w-48 h-48 -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none" strokeWidth="12" />
                <motion.circle 
                  cx="96" cy="96" r="88" 
                  className={`fill-none ${scoreColor} drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]`}
                  strokeWidth="12"
                  strokeDasharray="552.9"
                  initial={{ strokeDashoffset: 552.9 }}
                  animate={{ strokeDashoffset: 552.9 * (1 - score.originalScore / 100) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-4xl font-black font-mono tracking-tighter">{score.originalScore}%</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Base Score</span>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-cyan" /> 
                  {score.originalScore > 70 ? 'Strong Compatibility' : score.originalScore > 40 ? 'Moderate Alignment' : 'Critical Discrepancy'}
                </h3>
                <p className="text-gray-400 text-sm">
                  Your current resume matches approximately <span className="text-white font-bold">{score.matchedKeywords.length} key components</span> from the job description.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Missing Elements</div>
                  <div className="text-2xl font-bold font-mono text-red-400">{score.missingKeywords.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Keywords Identified</div>
                  <div className="text-2xl font-bold font-mono text-neon-cyan">{score.matchedKeywords.length + score.missingKeywords.length}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Missing Keywords Layer */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Detected Keyword Gap
            </h3>
            <div className="flex flex-wrap gap-2">
              {score.missingKeywords.map((kw: string) => (
                <span key={kw} className="px-3 py-1.5 border border-red-500/20 bg-red-500/5 text-red-400 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  {kw}
                </span>
              ))}
              {score.missingKeywords.length === 0 && <span className="text-gray-500 text-sm">No missing keywords detected. Complete alignment.</span>}
            </div>
          </div>

          {/* Matched Keywords Layer */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Established Connectivity
            </h3>
            <div className="flex flex-wrap gap-2">
              {score.matchedKeywords.map((kw: string) => (
                <span key={kw} className="px-3 py-1.5 border border-green-500/20 bg-green-500/5 text-green-400 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="bg-zinc-950 border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Improvement Tips
            </h3>
            <div className="space-y-6">
              {score.improvementTips.map((tip: string, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-white/5 flex-shrink-0 flex items-center justify-center text-[10px] font-mono text-gray-500">{i+1}</div>
                  <p className="text-xs text-gray-400 leading-relaxed italic">"{tip}"</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-neon-cyan/5 border-neon-cyan/10 p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-neon-cyan uppercase">
                {resume.optimizedResume ? 'OPTIMIZATION READY' : 'AI RECONSTRUCTION'}
              </h3>
              <p className="text-xs text-gray-400">
                {resume.optimizedResume 
                  ? `Optimized version reached ${resume.optimizedResume.score}%. Baseline improved by ${Math.round(((resume.optimizedResume.score - score.originalScore) / (score.originalScore || 1)) * 100)}%.`
                  : 'Our neural engine will rebuild your resume to bridge the specified gaps while maintaining 100% integrity.'}
              </p>
            </div>
            
            {!resume.optimizedResume && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span>Optimize summary impact</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span>Refactor experience bullets</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span>Inject missing keywords</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="neon" 
                className="w-full" 
                onClick={handleOptimize} 
                loading={optimizing}
              >
                {resume.optimizedResume ? 'Re-Optimize Analysis' : 'Initialize Uplink'}
              </Button>
              
              {resume.optimizedResume && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate(`/comparison/${resumeId}`)}
                  >
                    View Full Comparison
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full bg-slate-800"
                    onClick={() => navigate(`/download/${resumeId}`)}
                  >
                    Download AI Resume PDF
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {resume.optimizedResume && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-8 pt-12 border-t border-white/5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Optimization Result Highlights</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> Integrity Verified
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-zinc-950 border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Neural Summary Injection</h4>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                {resume.optimizedResume.summary}
              </p>
            </Card>
            
            <Card className="p-8 bg-zinc-950 border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Top Impact Refactorings</h4>
              <div className="space-y-4">
                {resume.optimizedResume.experience[0]?.bullets.slice(0, 2).map((bullet: string, i: number) => (
                  <div key={i} className="flex gap-3 text-xs text-slate-400 leading-relaxed">
                    <span className="text-cyan-400 font-bold">›</span>
                    <span dangerouslySetInnerHTML={{ __html: bullet.replace(/([A-Z][a-z]+)/g, '<span class="text-slate-200">$1</span>') }} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button variant="neon" size="lg" className="px-12" onClick={() => navigate(`/download/${resumeId}`)}>
              Finalize & Download Neural Resume
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
