import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { ShieldCheck, Lock, BrainCircuit, FileText, AlertCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans text-slate-900 dark:text-slate-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Terms of Service & Privacy Protocol</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transparency is our core value. Please read how we handle your data and how our AI system assists in governance.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* SECTION 1: DATA PRIVACY (The most important part) */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">1. Data Privacy & Sovereignty</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              We take your privacy seriously. Unlike commercial platforms, this Grievance Redressal System is built for public service, not profit.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">
                  <strong>No Third-Party Sharing:</strong> We do not sell, trade, or transfer your personally identifiable information (PII) to outside parties, advertisers, or marketing agencies.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">
                  <strong>Purpose-Limited Use:</strong> Your data (name, location, complaint details) is used <em>solely</em> for the purpose of resolving your grievance and contacting you regarding its status.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">
                  <strong>Local Processing:</strong> All sensitive data is processed within our secure government/organizational servers.
                </span>
              </li>
            </ul>
          </div>

          {/* SECTION 2: AI DISCLAIMER */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">2. How Our AI Works</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              This platform utilizes an <strong>Artificial Intelligence (AI) model</strong> to automatically categorize complaints and assign priority levels (Low, Medium, High, Critical).
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm uppercase mb-1">Important Disclaimer</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The AI is an assistance tool, not the final authority. All AI decisions are subject to <strong>Human-in-the-Loop (HITL)</strong> review. Department officers have the right to override AI classifications if they are incorrect.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: USER CONDUCT */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              By using this platform, you agree to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300 ml-2">
              <li>Provide accurate and truthful information regarding grievances.</li>
              <li>Avoid submitting duplicate complaints for the same issue (our system may auto-reject duplicates).</li>
              <li>Refrain from using abusive language or uploading inappropriate content in evidence attachments.</li>
            </ul>
          </div>

          {/* Footer of Card */}
          <div className="p-8 bg-slate-50 dark:bg-slate-900/50 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Last Updated: January 2026 | For questions, contact <a href="#" className="text-indigo-600 hover:underline">aaditya06pandey@gmail.com</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;