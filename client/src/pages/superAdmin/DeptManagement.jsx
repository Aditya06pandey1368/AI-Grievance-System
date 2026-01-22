import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Plus, CheckCircle, AlertTriangle, X, ShieldCheck, 
  Mail, Lock, User, Hash, Clock 
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const DeptManagement = () => {
  const [formData, setFormData] = useState({
    name: "", code: "", defaultSLAHours: 48,
    adminName: "", adminEmail: "", adminPassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid = Object.values(formData).every(val => val !== "" && val !== 0);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return toast.error("Please fill all fields.");
    setShowConfirm(true);
  };

  const createDepartment = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await api.post("/departments", formData);
      toast.success("Department & Admin created successfully!");
      setFormData({ name: "", code: "", defaultSLAHours: 48, adminName: "", adminEmail: "", adminPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans pb-20 relative overflow-hidden">
      <Navbar />
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-8 text-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-blue-50 dark:border-slate-700 relative">
                            <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse"></div>
                            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400 relative z-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Create Department?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            You are about to establish <strong>{formData.name}</strong> as a new entity with <strong>{formData.adminName}</strong> as the administrator.
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowConfirm(false)} 
                                className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={createDepartment} 
                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                            >
                                Confirm Creation
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-28 px-4 max-w-3xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
            >
                <ShieldCheck className="w-4 h-4" /> System Administration
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3"
            >
                Register New Department
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto"
            >
                Define a new grievance category and assign a dedicated administrator to oversee operations.
            </motion.p>
        </div>

        {/* Form Container */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 dark:shadow-black/50 border border-slate-200 dark:border-slate-700 relative overflow-hidden"
        >
            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <form onSubmit={handlePreSubmit} className="space-y-8">
                
                {/* Section 1: Dept Info */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <Building2 className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold">Department Configuration</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Department Name" 
                            placeholder="e.g. Fire Safety" 
                            value={formData.name} 
                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                            icon={<Building2 className="w-4 h-4" />}
                        />
                        <Input 
                            label="Dept Code" 
                            placeholder="e.g. FIRE_DEPT" 
                            value={formData.code} 
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                            icon={<Hash className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                        <Input 
                            label="Default SLA (Hours)" 
                            type="number" 
                            value={formData.defaultSLAHours} 
                            onChange={e => setFormData({ ...formData, defaultSLAHours: e.target.value })} 
                            icon={<Clock className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* Section 2: Admin Info */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold">Administrator Credentials</h3>
                    </div>

                    <Input 
                        label="Admin Full Name" 
                        placeholder="e.g. John Doe" 
                        value={formData.adminName} 
                        onChange={e => setFormData({ ...formData, adminName: e.target.value })} 
                        icon={<User className="w-4 h-4" />}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Email Address" 
                            type="email" 
                            placeholder="admin@dept.com" 
                            value={formData.adminEmail} 
                            onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} 
                            icon={<Mail className="w-4 h-4" />}
                        />
                        <Input 
                            label="Secure Password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={formData.adminPassword} 
                            onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} 
                            icon={<Lock className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button 
                        disabled={!isValid || loading} 
                        className={`w-full py-4 text-lg font-bold shadow-xl transition-all transform active:scale-[0.99] ${!isValid ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/25'}`}
                    >
                        {loading ? "Creating System Entity..." : "Create System Department"}
                    </Button>
                </div>
            </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DeptManagement;