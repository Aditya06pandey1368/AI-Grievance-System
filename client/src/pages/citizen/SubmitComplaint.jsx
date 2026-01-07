import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, FileText, AlertTriangle, CheckCircle, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import AILoader from "../../components/common/AILoader"; // Fixed path
import api from "../../services/api";

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    location: "",
    zone: "" // New Field
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); 
  const [files, setFiles] = useState([]); // Array for multiple files

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.zone) {
      toast.error("Please fill all fields including Zone");
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('zone', formData.zone); // Critical for routing
      
      // Append multiple files
      files.forEach((file) => {
        data.append('images', file); // 'images' matches backend
      });

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Simulate AI delay for UX
      setTimeout(() => {
        setResult(res.data.data); 
        setLoading(false);
        toast.success("Complaint Classified Successfully!");
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Report a Grievance
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Our AI will automatically categorize, prioritize, and route your issue.
            </p>
          </div>

          <Card className="relative overflow-hidden">
            <AnimatePresence mode="wait">

              {/* STATE 1: LOADING (AI SCANNING) */}
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AILoader />
                </motion.div>
              ) : result ? (

                /* STATE 2: SUCCESS RESULT */
                <motion.div
                  key="result"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6 text-center p-4"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                      Complaint Registered!
                    </h2>
                    <p className="text-slate-500">Ref ID: {result._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Routed to: <span className="font-bold text-slate-600 dark:text-slate-300">{formData.zone} Officer</span>
                    </p>
                  </div>

                  {/* AI ANALYSIS BADGES */}
                  <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">AI Category</p>
                      <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {result.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">AI Priority</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mt-1
                        ${result.priorityLevel === 'High' || result.priorityLevel === 'Critical'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`
                      }>
                        {result.priorityLevel === 'Critical' && <AlertTriangle className="w-4 h-4" />}
                        {result.priorityLevel} ({result.priorityScore}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center pt-4">
                    <Button variant="outline" onClick={() => setResult(null)}>
                      File Another
                    </Button>
                    <Button onClick={() => navigate('/dashboard')}>
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
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <Input
                    label="Issue Title"
                    placeholder="e.g., Deep Pothole causing accidents"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Location Address"
                        placeholder="e.g., Near City Center Mall"
                        icon={<MapPin />}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                      
                      {/* ZONE SELECTION - Critical for Backend Routing */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                            Zone / Ward
                        </label>
                        <select 
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all"
                            value={formData.zone}
                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        >
                            <option value="">Select Zone</option>
                            <option value="Ward-1">Ward 1 (North)</option>
                            <option value="Ward-2">Ward 2 (South)</option>
                            <option value="Sector-62">Sector 62</option>
                            <option value="Central">Central District</option>
                        </select>
                      </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                      Detailed Description
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="Describe the issue... (Mention keywords like 'Fire', 'Blood', 'Spark' to test AI)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                      Evidence (Max 5 Images)
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                            <Upload className="w-6 h-6" />
                            <span className="text-sm">
                                {files.length > 0 
                                    ? `${files.length} file(s) selected` 
                                    : "Click to upload photos"}
                            </span>
                        </div>
                    </div>
                  </div>

                  <Button isLoading={loading} className="w-full text-lg">
                    Analyze & Submit <FileText className="w-5 h-5 ml-2" />
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