import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X
} from 'lucide-react';
import axios from 'axios';

export const ResumeUpload: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Please upload a valid PDF document.');
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setError('');
    } else {
      setError('Invalid file type. PDF only.');
    }
  }, []);

  const handleUpload = async () => {
    if (!file || !user) return;
    setParsing(true);
    
    try {
      // 1. Convert to base64
      const reader = new FileReader();
      const base64Data: string = await new Promise((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      // 2. Parse on server
      const { data: parseResult } = await axios.post('/api/resume/parse', { base64Pdf: base64Data });

      if (!parseResult.text || parseResult.text.trim().length === 0) {
        throw new Error('Could not extract text from this PDF. Please ensure it is not a scanned image or protected.');
      }

      // 3. Save to Firestore
      const resumeDoc = await dataService.saveResume(user.uid, {
        originalResume: {
          text: parseResult.text,
          fileName: file.name
        },
        status: 'uploaded'
      });

      if (resumeDoc) {
        navigate(`/analysis/${resumeDoc.id}`);
      }
    } catch (err: any) {
      setError('Failed to process resume. Please try again.');
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter uppercase">UPLINK RESUME</h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase font-bold">Standard PDF protocol required</p>
      </div>

      <Card 
        className={`p-12 border-2 border-dashed transition-all ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-neon-cyan/50'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className={`p-6 rounded-full bg-white/5 ${file ? 'text-neon-cyan ring-1 ring-neon-cyan/50' : 'text-gray-500'}`}>
            {file ? <CheckCircle className="w-12 h-12" /> : <Upload className="w-12 h-12" />}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{file ? file.name : 'Drag & Drop your resume'}</h2>
            <p className="text-gray-500 text-sm">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supported format: PDF only. Max size: 10MB'}</p>
          </div>

          {!file ? (
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              <Button variant="outline" size="lg" type="button" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                <span>CHOOSE FILE</span>
              </Button>
            </label>
          ) : (
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setFile(null)}>
                <X className="w-4 h-4" /> Remove
              </Button>
              <Button variant="neon" size="lg" loading={parsing} onClick={handleUpload}>
                {parsing ? 'Parsing Data...' : 'Begin Analysis'}
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest mt-4">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-neon-cyan/10 flex items-center justify-center text-neon-cyan flex-shrink-0 font-bold font-mono">01</div>
          <div>
            <h4 className="font-bold text-sm uppercase mb-1">OCR EXTRACTION</h4>
            <p className="text-xs text-gray-500">We extract raw text data from your document for precise algorithm matching.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-neon-cyan/10 flex items-center justify-center text-neon-cyan flex-shrink-0 font-bold font-mono">02</div>
          <div>
            <h4 className="font-bold text-sm uppercase mb-1">STRUCTURE ANALYSIS</h4>
            <p className="text-xs text-gray-500">Industry-standard section identification to ensure ATS compatibility.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
