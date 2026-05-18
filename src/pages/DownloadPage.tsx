import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { jsPDF } from 'jspdf';
import { 
  Download, 
  CheckCircle, 
  FileText,
  Layout, 
  Share2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const DownloadPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuth();
  const [resume, setResume] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && resumeId) {
      dataService.getResume(user.uid, resumeId).then(setResume);
    }
  }, [user, resumeId]);

  const generatePDF = () => {
    if (!resume || !resume.optimizedResume) return;
    setExporting(true);
    
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(user?.displayName || 'User Name', margin, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(user?.email || 'email@example.com', margin, y);
      y += 15;

      // Summary
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += 6;
      doc.line(margin, y, 190, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(resume.optimizedResume.summary, 170);
      doc.text(summaryLines, margin, y);
      y += (summaryLines.length * 5) + 10;

      // Skills
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TECHNICAL SKILLS', margin, y);
      y += 6;
      doc.line(margin, y, 190, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsText = resume.optimizedResume.skills.join(' | ');
      const skillLines = doc.splitTextToSize(skillsText, 170);
      doc.text(skillLines, margin, y);
      y += (skillLines.length * 5) + 10;

      // Experience
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL EXPERIENCE', margin, y);
      y += 6;
      doc.line(margin, y, 190, y);
      y += 10;

      resume.optimizedResume.experience.forEach((exp: any) => {
        if (y > 270) { doc.addPage(); y = 20; }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.title, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(exp.company, 190 - doc.getTextWidth(exp.company), y);
        y += 7;

        doc.setFontSize(9);
        exp.bullets.forEach((bullet: string) => {
          if (y > 280) { doc.addPage(); y = 20; }
          const bulletLines = doc.splitTextToSize(`• ${bullet}`, 165);
          doc.text(bulletLines, margin + 5, y);
          y += (bulletLines.length * 4) + 2;
        });
        y += 5;
      });

      doc.save(`RESUMYY_Optimized_${resume.jobTitle || 'Resume'}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (!resume) return <div className="min-h-screen flex items-center justify-center text-cyan-400 font-mono">FINISHING EXPORT WRAPPER...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 mb-4">
          <CheckCircle className="w-10 h-10 text-neon-cyan" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter">MISSION COMPLETE</h1>
        <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">Your ATS-Optimized Resume is ready for deployment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col items-center justify-center p-12 space-y-8 bg-zinc-950 neon-border group">
          <div className="w-24 h-32 border border-white/20 rounded flex items-center justify-center bg-white/5 relative group-hover:border-neon-cyan/50 transition-all">
            <FileText className="w-10 h-10 text-gray-600 group-hover:text-neon-cyan transition-colors" />
            <div className="absolute -bottom-2 -right-2 bg-neon-cyan text-black p-1 rounded-sm">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">ATS-FRIENDLY PDF</h3>
            <p className="text-gray-500 text-xs">Standard formatting optimized for parsing machines and human recruiters.</p>
          </div>
          <Button variant="neon" size="lg" className="w-full h-14" onClick={generatePDF} loading={exporting}>
            DOWNLOAD RESUME
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/5 p-8 flex items-center gap-6 group cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">
              <Layout className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white">Change Template</h4>
              <p className="text-xs text-gray-500">Select from 5+ professional layouts (Coming Soon)</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </Card>

          <Card className="border-white/5 p-8 flex items-center gap-6 group cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white">Share Link</h4>
              <p className="text-xs text-gray-500">Generate a secure view-only link for networking</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </Card>

          <Card className="border-white/5 p-8 flex items-center gap-6 group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/dashboard')}>
            <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-400">
              <ExternalLink className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white">Back to Base</h4>
              <p className="text-xs text-gray-500">Return to dashboard for next mission</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </Card>
        </div>
      </div>
    </div>
  );
};
