import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Trash2, Edit2, AlertTriangle, Users, FileText, 
  ShieldAlert, Shield, X 
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import Input from "../../components/ui/Input";

const UserManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [deleteModal, setDeleteModal] = useState({ show: false, dept: null });
  const [editModal, setEditModal] = useState({ show: false, dept: null });
  const [editForm, setEditForm] = useState({});

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/departments");
      if(data.success) setDepartments(data.data);
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  // --- DELETE LOGIC ---
  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${deleteModal.dept._id}`);
      toast.success("Department permanently deleted");
      setDepartments(departments.filter(d => d._id !== deleteModal.dept._id));
      setDeleteModal({ show: false, dept: null });
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // --- EDIT LOGIC ---
  const openEdit = (dept) => {
    setEditForm({
        name: dept.name,
        code: dept.code,
        defaultSLAHours: dept.defaultSLAHours,
        adminName: dept.admin?.name || "",
        adminEmail: dept.admin?.email || "",
        adminPassword: "" // Blank by default
    });
    setEditModal({ show: true, dept });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        await api.put(`/departments/${editModal.dept._id}`, editForm);
        toast.success("Department updated successfully");
        setEditModal({ show: false, dept: null });
        fetchDepartments(); // Refresh data to show updates
    } catch (error) {
        toast.error("Update failed");
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans relative overflow-hidden">
      <Navbar />
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* --- 1. DELETE MODAL --- */}
      <AnimatePresence>
        {deleteModal.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden"
                >
                    <div className="p-8 text-center bg-gradient-to-b from-red-50 to-white dark:from-red-900/10 dark:to-slate-900">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-red-100 dark:border-red-900/30">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Permanent Delete?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                            You are about to delete <strong>{deleteModal.dept.name}</strong>. This action cannot be undone.
                        </p>
                    </div>
                    
                    <div className="p-6">
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl p-4 mb-6">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" /> Warning: Data Loss
                            </p>
                            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1.5 list-disc pl-4">
                                <li>The Department Entry will be removed.</li>
                                <li>The Admin User Account will be unlinked.</li>
                                <li>All Officers & Complaints will be orphaned.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeleteModal({ show: false, dept: null })} 
                                className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDelete} 
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all"
                            >
                                Confirm Delete
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- 2. EDIT MODAL --- */}
      <AnimatePresence>
        {editModal.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    exit={{ y: 50, opacity: 0 }} 
                    className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto relative"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl shadow-inner">
                                <Edit2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Edit Department
                        </h3>
                        <motion.button 
                            whileHover={{ rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditModal({ show: false, dept: null })} 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </motion.button>
                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Basic Info</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                <Input label="Code" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} />
                            </div>
                            <Input label="SLA (Hours)" type="number" value={editForm.defaultSLAHours} onChange={e => setEditForm({...editForm, defaultSLAHours: e.target.value})} />
                        </div>
                        
                        <div className="space-y-4 pt-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Admin Configuration</h4>
                            <Input label="Admin Name" value={editForm.adminName} onChange={e => setEditForm({...editForm, adminName: e.target.value})} />
                            <Input label="Admin Email" value={editForm.adminEmail} onChange={e => setEditForm({...editForm, adminEmail: e.target.value})} />
                            <div className="relative">
                                <Input label="New Password" type="password" placeholder="Leave blank to keep current" value={editForm.adminPassword} onChange={e => setEditForm({...editForm, adminPassword: e.target.value})} />
                                <p className="text-[10px] text-slate-400 mt-1 absolute right-0 top-0">* Optional</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
                            >
                                Save Changes
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 max-w-[1600px] mx-auto pb-12 relative z-10">
        
        {/* HEADER - RESPONSIVE FIX */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-3">
                        <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>Department <span className="text-slate-400 dark:text-slate-500">Center</span></span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg font-medium">Manage organizational structures and administrative access.</p>
                </motion.div>
            </div>
            
            <div className="w-full md:w-auto">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="flex gap-2"
                >
                    <span className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold shadow-md border border-slate-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 w-full md:w-auto text-center">
                        Total Departments: {departments.length}
                    </span>
                </motion.div>
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-72 bg-slate-200 dark:bg-slate-800/50 rounded-[2rem] animate-pulse"
                    ></motion.div>
                ))}
            </div>
        ) : departments.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-700"
            >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-xl font-bold text-slate-500">No departments found.</p>
                <p className="text-slate-400 mt-1">Create one from the "Register Dept" page.</p>
            </motion.div>
        ) : (
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" // FIXED GRID (Max 3 on large)
            >
                {departments.map((dept) => (
                    <motion.div 
                        key={dept._id}
                        variants={itemVariants}
                        whileHover={{ y: -10 }}
                        className="group bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Top Decoration */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={dept.name}>
                                    {dept.name}
                                </h3>
                                <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                    {dept.code}
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Admin Card */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Administrator
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {dept.admin?.name?.charAt(0) || "U"}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{dept.admin?.name || "Unassigned"}</p>
                                    <p className="text-xs text-slate-500 truncate">{dept.admin?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl text-center border border-blue-100 dark:border-blue-900/20 group-hover:border-blue-200 dark:group-hover:border-blue-800/50 transition-colors">
                                <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                <p className="text-lg font-black text-slate-900 dark:text-white">{dept.officerCount || 0}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Officers</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl text-center border border-emerald-100 dark:border-emerald-900/20 group-hover:border-emerald-200 dark:group-hover:border-emerald-800/50 transition-colors">
                                <FileText className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                <p className="text-lg font-black text-slate-900 dark:text-white">{dept.complaintCount || 0}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Active Cases</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openEdit(dept)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" /> Edit
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDeleteModal({ show: true, dept })}
                                className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;