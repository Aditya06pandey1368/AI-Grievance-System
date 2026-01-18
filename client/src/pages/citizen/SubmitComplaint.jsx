import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, FileText, AlertTriangle, CheckCircle, Upload, X } from "lucide-react";
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
  const [files, setFiles] = useState([]);
  
  // --- NEW: Warning Modal State ---
  const [showWarning, setShowWarning] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setFiles(Array.from(e.target.files));
  };

  // Step 1: Validate & Show Warning
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.zone) {
      toast.error("Please fill all fields including Zone");
      return;
    }
    // Show Confirmation Modal
    setShowWarning(true);
  };

  // Step 2: Actual API Submission
  const confirmAndSubmit = async () => {
    setShowWarning(false); // Close modal
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('zone', formData.zone); 
      
      files.forEach((file) => {
        data.append('images', file); 
      });

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTimeout(() => {
        setResult(res.data.data); 
        setLoading(false);
        toast.success("Complaint Classified & Submitted!");
      }, 2000); // Slight delay for AI effect

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans relative">
      <Navbar />

      {/* --- WARNING MODAL (Absolute Overlay) --- */}
      <AnimatePresence>
        {showWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-red-500/50 overflow-hidden"
                >
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 text-center border-b border-red-100 dark:border-red-900/50">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">Strict Policy Warning</h3>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                            <span className="text-xl">🛑</span>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">Irreversible Action</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Once submitted, you <span className="font-bold text-red-500">CANNOT edit or delete</span> this complaint. It becomes an official record.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                            <span className="text-xl">⚖️</span>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">Legal Consequence</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Filing false or prank complaints will lead to an <span className="font-bold text-red-500">immediate permanent ban</span> of your Citizen ID.</p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                onClick={() => setShowWarning(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                Cancel & Review
                            </button>
                            <button 
                                onClick={confirmAndSubmit}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition transform active:scale-95"
                            >
                                I Understand, Submit
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              File a <span className="text-indigo-600 dark:text-indigo-400">Grievance</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Our AI engine will analyze your report and route it instantly.
            </p>
          </div>

          <Card className="relative overflow-hidden border-0 shadow-2xl dark:bg-slate-800">
            <AnimatePresence mode="wait">

              {/* STATE 1: LOADING */}
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10"
                >
                  <AILoader />
                  <p className="text-center mt-4 text-indigo-500 font-bold animate-pulse">Analyzing Content & Severity...</p>
                </motion.div>
              ) : result ? (

                /* STATE 2: SUCCESS RESULT */
                <motion.div
                  key="result"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-8 text-center p-6"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 shadow-lg shadow-green-500/20">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                      Registered Successfully!
                    </h2>
                    <p className="text-slate-500 text-lg mt-1">Token ID: <span className="font-mono font-bold text-slate-800 dark:text-white">{result._id.slice(-6).toUpperCase()}</span></p>
                  </div>

                  {/* AI ANALYSIS CARD */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-left">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Route Assigned</p>
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> {formData.zone} Officer
                        </p>
                    </div>
                    <div className="h-10 w-px bg-slate-300 dark:bg-slate-700 hidden md:block"></div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">AI Classification</p>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-700 dark:text-white">{result.category}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                result.priorityLevel === 'Critical' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                                {result.priorityLevel}
                            </span>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center pt-2">
                    <Button variant="outline" onClick={() => setResult(null)} className="px-6">
                      File Another
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} className="px-6 bg-indigo-600 hover:bg-indigo-700">
                      Go to Dashboard
                    </Button>
                  </div>
                </motion.div>

              ) : (

                /* STATE 3: INPUT FORM */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handlePreSubmit} // Intercepts submit to show modal
                  className="space-y-6 p-2"
                >
                  <Input
                    label="Issue Title"
                    placeholder="Briefly summarize the issue..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Location / Landmark"
                        placeholder="e.g., Near City Center"
                        icon={<MapPin />}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                      
                      <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                            Assigned Zone <span className="text-red-500">*</span>
                        </label>
                        <select 
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium"
                            value={formData.zone}
                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        >
                            <option value="">Select Ward / Zone</option>
                            <option value="Ward-1">Ward 1 (North)</option>
                            <option value="Ward-2">Ward 2 (South)</option>
                            <option value="Sector-62">Sector 62</option>
                            <option value="Central">Central District</option>
                        </select>
                      </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                      Detailed Description
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all resize-none"
                      placeholder="Describe the issue in detail. Our AI looks for keywords like 'Fire', 'Accident', etc."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                      Upload Evidence (Max 5)
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                            <Upload className="w-8 h-8" />
                            <span className="font-medium">
                                {files.length > 0 
                                    ? <span className="text-indigo-600 font-bold">{files.length} images attached</span> 
                                    : "Drag & drop or click to upload"}
                            </span>
                        </div>
                    </div>
                  </div>

                  <Button className="w-full text-lg py-4 rounded-xl shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
                    Process with AI <FileText className="w-5 h-5 ml-2" />
                  </Button>
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