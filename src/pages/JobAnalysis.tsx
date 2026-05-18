import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { 
  Briefcase, 
  Search, 
  BrainCircuit, 
  ChevronRight,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const JobAnalysis: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [resume, setResume] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && resumeId) {
      dataService.getResume(user.uid, resumeId).then(setResume).catch(err => {
        setError('Failed to load resume details.');
        console.error(err);
      });
    }
  }, [user, resumeId]);

  const handleAnalyze = async () => {
    if (!jobDescription || !resume || !user || !resumeId) return;
    setAnalyzing(true);
    setError('');
    
    try {
      // 1. Send to server for AI Analysis
      const { data: analysis } = await axios.post('/api/analyze', {
        resumeText: resume.originalResume.text,
        jobDescription
      });

      // 2. Save Analysis Results to Firestore
      const scoreId = await dataService.saveScore(user.uid, {
        resumeId,
        jobDescription,
        originalScore: analysis.score,
        missingKeywords: analysis.missingKeywords,
        matchedKeywords: analysis.matchedKeywords,
        improvementTips: analysis.improvementTips
      });

      // 3. Update Resume status & job description
      const resumeRef = doc(db, `users/${user.uid}/resumes/${resumeId}`);
      await updateDoc(resumeRef, {
        status: 'analyzed',
        jobDescription: {
          text: jobDescription,
          scoreId: scoreId?.id
        }
      });

      navigate(`/results/${resumeId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Analysis protocol failed.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-neon-cyan/10 rounded-xl flex items-center justify-center text-neon-cyan border border-neon-cyan/20 ring-1 ring-neon-cyan/30">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase underline decoration-neon-cyan decoration-2 underline-offset-4">Job Protocol</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-bold mt-1">Initialize target description analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 neon-border overflow-hidden">
            <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Search className="w-3 h-3" /> Job Description Input
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              </div>
            </div>
            <textarea
              className="w-full h-[400px] bg-black p-6 outline-none focus:bg-zinc-950 transition-colors font-mono text-sm leading-relaxed text-gray-300 resize-none"
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            {error && (
              <div className="bg-red-500/10 border-t border-red-500/20 p-4 text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button 
              variant="neon" 
              size="lg" 
              className="min-w-[200px]"
              loading={analyzing}
              onClick={handleAnalyze}
              disabled={!jobDescription}
            >
              {analyzing ? (
                <>Analyzing Matrix...</>
              ) : (
                <>Run AI Analysis <Zap className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-neon-cyan/5 border-neon-cyan/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neon-cyan mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> AI Engine Strategy
            </h3>
            <ul className="space-y-4 text-xs">
              <li className="flex gap-3 text-gray-300">
                <ChevronRight className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <span>Keyword extraction using NLP patterns.</span>
              </li>
              <li className="flex gap-3 text-gray-300">
                <ChevronRight className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <span>Contextual experience weight calculation.</span>
              </li>
              <li className="flex gap-3 text-gray-300">
                <ChevronRight className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <span>Benchmarking against 1,000+ industry standards.</span>
              </li>
            </ul>
          </Card>

          <Card className="border-white/5 space-y-4">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Active Resume</div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded border border-white/10">
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">{resume?.originalResume?.fileName || 'Loading...'}</div>
                <div className="text-[10px] text-gray-600 font-mono">ID: {resumeId?.slice(0,8)}...</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
