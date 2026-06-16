/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AdminAuthPage } from './pages/AdminAuthPage';
import { Dashboard } from './pages/Dashboard';
import { ResumeUpload } from './pages/ResumeUpload';
import { JobAnalysis } from './pages/JobAnalysis';
import { ResultsPage } from './pages/ResultsPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { DownloadPage } from './pages/DownloadPage';

export default function App() {
  React.useEffect(() => {
    // CRITICAL: Validate connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'system', 'connection'));
      } catch (error: any) {
        if (error?.message?.includes('offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-white selection:bg-neon-cyan selection:text-black">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin/auth" element={<AdminAuthPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/upload" element={
                <ProtectedRoute>
                  <ResumeUpload />
                </ProtectedRoute>
              } />
              
              <Route path="/analysis/:resumeId" element={
                <ProtectedRoute>
                  <JobAnalysis />
                </ProtectedRoute>
              } />
              
              <Route path="/results/:resumeId" element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/comparison/:resumeId" element={
                <ProtectedRoute>
                  <ComparisonPage />
                </ProtectedRoute>
              } />
              
              <Route path="/download/:resumeId" element={
                <ProtectedRoute>
                  <DownloadPage />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
