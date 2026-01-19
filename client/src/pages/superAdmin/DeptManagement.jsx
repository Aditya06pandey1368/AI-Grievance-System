import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, CheckCircle, AlertTriangle, X } from "lucide-react";
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

  // Check if form is valid
  const isValid = Object.values(formData).every(val => val !== "" && val !== 0);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans">
      <Navbar />

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Department?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            This will create a new system entity <strong>{formData.name}</strong> and assign <strong>{formData.adminName}</strong> as the administrator.
                        </p>
                        
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                Cancel
                            </button>
                            <button onClick={createDepartment} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition">
                                Yes, Create
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-4 max-w-2xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700"
        >
            <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> 
                    </div>
                    Register New Department
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 ml-12">
                    Define a new grievance category and assign an administrator.
                </p>
            </div>

            <form onSubmit={handlePreSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Department Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Department Name" placeholder="e.g. Fire Safety" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <Input label="Dept Code" placeholder="e.g. FIRE_DEPT" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                    </div>
                    <Input label="Default SLA (Hours)" type="number" value={formData.defaultSLAHours} onChange={e => setFormData({ ...formData, defaultSLAHours: e.target.value })} />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Administrator Credentials</h3>
                    <Input label="Admin Name" placeholder="Full Name" value={formData.adminName} onChange={e => setFormData({ ...formData, adminName: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Email Address" type="email" placeholder="admin@dept.com" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
                        <Input label="Password" type="password" placeholder="••••••••" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} />
                    </div>
                </div>

                <Button 
                    disabled={!isValid} 
                    className={`w-full py-4 text-lg shadow-xl ${!isValid ? 'opacity-50 cursor-not-allowed' : 'shadow-indigo-500/20'}`}
                >
                    Create System Department
                </Button>
            </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DeptManagement;