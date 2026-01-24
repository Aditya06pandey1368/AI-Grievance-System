import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Trash2, Search, User, ShieldCheck, Mail, MapPin, Phone, AlertTriangle, X, Edit2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const OfficerList = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [deleteModal, setDeleteModal] = useState({ show: false, officer: null });
  const [editModal, setEditModal] = useState({ show: false, officer: null });
  const [confirmEdit, setConfirmEdit] = useState(false);
  
  const [editForm, setEditForm] = useState({
      name: "", email: "", mobile: "", zones: "", password: ""
  });

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/officers");
      if(res.data.success) {
          setOfficers(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load officers");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const confirmDelete = (officer) => {
    setDeleteModal({ show: true, officer });
  };

  const handleDelete = async () => {
    if (!deleteModal.officer) return;
    try {
      await api.delete(`/admin/users/${deleteModal.officer._id}`);
      toast.success("Officer deleted successfully");
      setOfficers(officers.filter(o => o._id !== deleteModal.officer._id));
      setDeleteModal({ show: false, officer: null });
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // --- EDIT ---
  const openEdit = (officer) => {
      setEditForm({
          name: officer.name,
          email: officer.email,
          mobile: officer.officerProfile?.mobile || "",
          zones: officer.zones ? officer.zones.join(", ") : "",
          password: ""
      });
      setEditModal({ show: true, officer });
  };

  const handleEditPreSubmit = (e) => {
      e.preventDefault();
      if (!/^\d{10}$/.test(editForm.mobile)) return toast.error("Mobile must be 10 digits");
      setConfirmEdit(true);
  };

  const executeEdit = async () => {
      setConfirmEdit(false);
      try {
          const payload = {
              ...editForm,
              zones: editForm.zones.split(',').map(z => z.trim())
          };
          
          await api.put(`/admin/officers/${editModal.officer._id}`, payload);
          toast.success("Officer updated successfully");
          setEditModal({ show: false, officer: null });
          fetchOfficers();
      } catch (error) {
          toast.error("Update failed");
      }
  };

  // Search Logic
  const filteredOfficers = officers.filter(officer => {
    const term = searchTerm.toLowerCase();
    const nameMatch = officer.name?.toLowerCase().includes(term);
    const idMatch = officer._id?.toLowerCase().includes(term);
    const zoneMatch = officer.zones?.some(z => z.toLowerCase().includes(term));
    return nameMatch || idMatch || zoneMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans relative overflow-hidden">
      <Navbar />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- CONFIRM DELETE --- */}
      <AnimatePresence>
        {deleteModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden"
                >
                    <div className="p-6 text-center bg-red-50 dark:bg-red-900/10">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Delete Officer?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This action cannot be undone.</p>
                    </div>
                    <div className="p-5 flex gap-3">
                        <button onClick={() => setDeleteModal({ show: false, officer: null })} className="flex-1 py-2.5 rounded-xl border font-bold text-sm dark:text-white">Cancel</button>
                        <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700">Delete</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM EDIT SAVE --- */}
      <AnimatePresence>
        {confirmEdit && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700"
                >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Save Changes?</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">This will update the officer's credentials immediately.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmEdit(false)} className="flex-1 py-2 rounded-lg border font-bold text-sm dark:text-white">Cancel</button>
                        <button onClick={executeEdit} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700">Save</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- EDIT FORM MODAL --- */}
      <AnimatePresence>
        {editModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Officer
                        </h3>
                        <button onClick={() => setEditModal({ show: false, officer: null })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleEditPreSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                                <input type="text" className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Mobile</label>
                                <input type="text" maxLength="10" className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value.replace(/\D/g, '')})} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input type="email" className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Zones</label>
                            <input type="text" className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" value={editForm.zones} onChange={e => setEditForm({...editForm, zones: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">New Password <span className="text-[10px] lowercase font-normal">(Optional)</span></label>
                            <input type="password" placeholder="••••••••" className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                        </div>
                        <div className="pt-4">
                            <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg transition">Update Credentials</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 max-w-[1600px] mx-auto pb-12 relative z-10">
        
        {/* HEADER SECTION - COMPACT */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="space-y-3 flex-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                    <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> 
                    Officer Directory
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                    Manage field personnel access.
                </p>
            </motion.div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by Name, ID or Zone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 self-start lg:self-end">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"/>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{filteredOfficers.length} Active</span>
          </motion.div>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800/50 rounded-[1.5rem] animate-pulse" />)}
             </div>
        ) : filteredOfficers.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-lg font-bold text-slate-400">No officers found.</p>
                <p className="text-sm text-slate-500">Try adjusting your search query.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 perspective-1000">
              {filteredOfficers.map((officer, index) => (
                <OfficerCard 
                    key={officer._id} 
                    officer={officer} 
                    onDelete={() => confirmDelete(officer)} 
                    onEdit={() => openEdit(officer)}
                    index={index} 
                />
              ))}
            </div>
        )}
      </div>
    </div>
  );
};

const OfficerCard = ({ officer, onDelete, onEdit, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ rotateY: 5, rotateX: 5, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)" }}
      // Compact Card Height
      className="relative h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-[1.5rem] p-5 text-white shadow-xl overflow-hidden border border-slate-700/50 group"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/30 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onEdit} className="p-2 bg-white/10 hover:bg-indigo-500/80 backdrop-blur-md rounded-full text-white/50 hover:text-white shadow-lg"><Edit2 className="w-4 h-4" /></motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onDelete} className="p-2 bg-white/10 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white/50 hover:text-white shadow-lg"><Trash2 className="w-4 h-4" /></motion.button>
        </div>

        <div className="relative z-10 flex flex-col h-full items-center">
            {/* Header: ID */}
            <div className="w-full flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-200 opacity-80">
                        #{officer._id.slice(-6).toUpperCase()}
                    </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${officer.isActive ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-red-500'}`} />
            </div>

            {/* Avatar - Reduced */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-600 border-2 border-slate-700/50 shadow-inner flex items-center justify-center mb-3 relative group-hover:scale-105 transition-transform duration-500">
                <User className="w-10 h-10 text-slate-400" />
            </div>

            {/* Info */}
            <div className="text-center w-full space-y-0.5 mb-4">
                <h3 className="text-lg font-black tracking-tight truncate px-2">{officer.name}</h3>
                <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-wide">Dept. Officer</p>
                <div className="w-8 h-0.5 bg-slate-700 rounded-full mx-auto mt-2" />
            </div>

            {/* Stats - Compact */}
            <div className="w-full grid grid-cols-1 gap-2 mt-auto">
                <div className="bg-white/5 rounded-xl p-2 px-3 backdrop-blur-sm flex items-center gap-3 border border-white/5 hover:bg-white/10 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-semibold truncate text-white/90" title={officer.email}>{officer.email}</p>
                    </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-2 px-3 backdrop-blur-sm flex items-center gap-3 border border-white/5 hover:bg-white/10 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                    <div>
                        <p className="text-[10px] font-mono font-semibold text-white/90">{officer.officerProfile?.mobile || "N/A"}</p>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-2 px-3 backdrop-blur-sm flex items-center gap-3 border border-white/5 hover:bg-white/10 transition-colors mb-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-semibold truncate text-white/90">
                             {officer.zones && officer.zones.length > 0 ? officer.zones.join(", ") : "Unassigned"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default OfficerList;