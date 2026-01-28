import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, FileText, AlertTriangle, CheckCircle, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import AILoader from "../../components/common/AILoader"; 
import api from "../../services/api";

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    location: "",
    zone: "" 
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); 
  
  // Modal States
  const [showStrictWarning, setShowStrictWarning] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Data for Duplicate Warning
  const [duplicateData, setDuplicateData] = useState({ message: "", score: 0 });

  // 1. First Button Click: Validates and shows Strict Policy Warning
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.zone) {
      toast.error("Please fill all fields including Zone");
      return;
    }
    setShowStrictWarning(true);
  };

  // 2. Main Submission Logic (Handles both normal and force submit)
  const submitToAPI = async (force = false) => {
    setShowStrictWarning(false); // Close strict warning if open
    setShowDuplicateModal(false); // Close duplicate warning if open
    setLoading(true);

    try {
      // Add forceSubmit flag if needed
      const payload = { ...formData, forceSubmit: force };
      
      const res = await api.post('/complaints', payload);

      // --- DUPLICATE CHECK ---
      if (res.data.isDuplicateWarn) {
        setDuplicateData({
          message: res.data.message,
          score: res.data.similarityScore
        });
        setLoading(false);
        setShowDuplicateModal(true); // Open the second modal
        return; 
      }

      // --- SUCCESS ---
      setTimeout(() => {
        setResult(res.data.data); 
        setLoading(false);
        toast.success("Complaint Classified & Submitted!");
      }, 1500); 

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans relative">
      <Navbar />

      {/* --- MODAL 1: STRICT POLICY WARNING --- */}
      <AnimatePresence>
        {showStrictWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-red-500/50 overflow-hidden"
                >
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 text-center border-b border-red-100 dark:border-red-900/50">
                        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">Strict Policy Warning</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">
                            Once submitted, you <span className="font-bold text-red-500">CANNOT edit or delete</span> this complaint. 
                            False reporting will result in an immediate ID ban.
                        </p>
                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setShowStrictWarning(false)} className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 font-bold dark:text-white">Cancel</button>
                            <button onClick={() => submitToAPI(false)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg">Confirm & Submit</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: DUPLICATE FOUND WARNING --- */}
      <AnimatePresence>
        {showDuplicateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-orange-500/50 overflow-hidden"
                >
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 text-center border-b border-orange-100 dark:border-orange-900/50">
                        <Copy className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-400">Duplicate Detected</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-orange-100 dark:bg-orange-900/40 p-3 rounded-lg text-center font-bold text-orange-800 dark:text-orange-200">
                             Match Score: {(duplicateData.score * 100).toFixed(0)}%
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                            {duplicateData.message}
                        </p>
                        <p className="text-sm text-slate-500 italic">
                            (Officers are likely already working on this. Submitting again may lower your Trust Score.)
                        </p>
                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setShowDuplicateModal(false)} className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 font-bold dark:text-white">Cancel</button>
                            <button onClick={() => submitToAPI(true)} className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg">Submit Anyway</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">File a Grievance</h1>
            <p className="text-slate-500 mt-2">AI-Powered Classification & Routing</p>
          </div>

          <Card className="relative overflow-hidden border-0 shadow-2xl dark:bg-slate-800">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10">
                  <AILoader />
                  <p className="text-center mt-4 text-indigo-500 font-bold animate-pulse">Analyzing Content...</p>
                </motion.div>
              ) : result ? (
                // SUCCESS VIEW
                <motion.div key="result" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-8 text-center p-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-lg">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Registered!</h2>
                    <p className="text-slate-500 text-lg mt-1">Ref ID: <span className="font-mono font-bold">{result._id.slice(-6).toUpperCase()}</span></p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border dark:border-slate-700 flex justify-between items-center">
                    <div className="text-left">
                        <p className="text-xs text-slate-400 uppercase font-bold">Category</p>
                        <p className="text-xl font-bold text-indigo-600">{result.category}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold">Status</p>
                        <p className="text-xl font-bold text-slate-700 dark:text-white capitalize">{result.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
                </motion.div>
              ) : (
                // FORM VIEW
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handlePreSubmit} className="space-y-6 p-2">
                  <Input label="Issue Title" placeholder="e.g. Theft at house" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Location" placeholder="e.g. Sector 12" icon={<MapPin />} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                      <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Zone <span className="text-red-500">*</span></label>
                        <select className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 dark:border-slate-700 outline-none" value={formData.zone} onChange={(e) => setFormData({ ...formData, zone: e.target.value })}>
                            <option value="">Select Zone</option>
                            <option value="Ward-1">Ward 1 (North)</option>
                            <option value="Ward-2">Ward 2 (South)</option>
                            <option value="Sector-62">Sector 62</option>
                            <option value="Central">Central District</option>
                        </select>
                      </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
                    <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 dark:border-slate-700 outline-none resize-none" placeholder="Describe the issue..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <Button className="w-full text-lg py-4">Process with AI <FileText className="w-5 h-5 ml-2" /></Button>
                </motion.form>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitComplaint;