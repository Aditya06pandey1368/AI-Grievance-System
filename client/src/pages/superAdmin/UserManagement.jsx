import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Trash2, Edit2, AlertTriangle, Users, FileText, ShieldAlert } from "lucide-react";
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
        toast.success("Department updated");
        setEditModal({ show: false, dept: null });
        fetchDepartments(); // Refresh data
    } catch (error) {
        toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans">
      <Navbar />

      {/* --- 1. DELETE MODAL --- */}
      <AnimatePresence>
        {deleteModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border-2 border-red-500 shadow-2xl">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Permanent Delete?</h3>
                        <p className="text-slate-500 mt-2 text-sm">
                            You are about to delete <strong>{deleteModal.dept.name}</strong>.
                            <br/><br/>
                            <span className="text-red-500 font-bold">WARNING:</span> This will permanently erase:
                        </p>
                        <ul className="text-left text-sm text-slate-600 dark:text-slate-300 mt-4 space-y-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                            <li>• The Department Entry</li>
                            <li>• The Admin User Account</li>
                            <li>• All Associated Officers</li>
                            <li>• All Complaint Records</li>
                        </ul>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDeleteModal({ show: false, dept: null })} className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-bold dark:text-white">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg">Confirm Delete</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- 2. EDIT MODAL --- */}
      <AnimatePresence>
        {editModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Department
                    </h3>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <Input label="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        <Input label="Code" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} />
                        <Input label="SLA (Hours)" type="number" value={editForm.defaultSLAHours} onChange={e => setEditForm({...editForm, defaultSLAHours: e.target.value})} />
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Admin Details</h4>
                            <Input label="Admin Name" value={editForm.adminName} onChange={e => setEditForm({...editForm, adminName: e.target.value})} />
                            <Input label="Admin Email" value={editForm.adminEmail} onChange={e => setEditForm({...editForm, adminEmail: e.target.value})} />
                            <Input label="New Password (Leave blank to keep)" type="password" value={editForm.adminPassword} onChange={e => setEditForm({...editForm, adminPassword: e.target.value})} />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setEditModal({ show: false, dept: null })} className="flex-1 py-3 rounded-xl border font-bold dark:text-white">Cancel</button>
                            <button className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700">Save Changes</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="w-8 h-8 text-indigo-500" />
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Department Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Overview of active departments and resource allocation</p>
            </div>
        </div>

        {loading ? (
            <div className="text-center py-20 text-slate-500">Loading Departments...</div>
        ) : departments.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-lg font-medium text-slate-500">No departments found.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <motion.div 
                        key={dept._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 group relative"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                                <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded text-xs font-mono mt-1">
                                    {dept.code}
                                </span>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Admin Info */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Administrator</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{dept.admin?.name || "Unassigned"}</p>
                            <p className="text-xs text-slate-500 truncate">{dept.admin?.email}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl text-center">
                                <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{dept.officerCount || 0}</p>
                                <p className="text-xs text-slate-500">Officers</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl text-center">
                                <FileText className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{dept.complaintCount || 0}</p>
                                <p className="text-xs text-slate-500">Active Cases</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => openEdit(dept)}
                                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                                Edit Details
                            </button>
                            <button 
                                onClick={() => setDeleteModal({ show: true, dept })}
                                className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;