import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Trash2, Search, User, ShieldCheck, Mail, MapPin } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const OfficerList = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState(null);

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

  const confirmDelete = (officer) => {
    setOfficerToDelete(officer);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!officerToDelete) return;
    try {
      await api.delete(`/admin/users/${officerToDelete._id}`);
      toast.success("Officer deleted successfully");
      setOfficers(officers.filter(o => o._id !== officerToDelete._id));
      setShowDeleteModal(false);
      setOfficerToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-500" /> 
              Officer Directory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Active personnel digital badges.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
             <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{officers.length} Active Officers</span>
          </div>
        </div>

        {loading ? (
             <div className="text-center py-20 text-slate-500">Loading digital badges...</div>
        ) : officers.length === 0 ? (
             <div className="text-center py-20 text-slate-500">No officers found in your department.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
              {officers.map((officer, index) => (
                <OfficerCard key={officer._id} officer={officer} onDelete={() => confirmDelete(officer)} index={index} />
              ))}
            </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-700"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Revoke Access?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to delete <span className="font-bold text-white">{officerToDelete?.name}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-500/30">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const OfficerCard = ({ officer, onDelete, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ rotateY: 5, rotateX: 5, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
      className="relative h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl overflow-hidden border border-slate-700/50 group"
    >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/20 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

        <button onClick={onDelete} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" title="Delete Officer"><Trash2 className="w-4 h-4" /></button>

        <div className="relative z-10 flex flex-col h-full items-center">
            <div className="w-full flex justify-between items-center mb-6">
                <ShieldCheck className="w-6 h-6 text-primary-400" />
                <span className="text-[10px] font-mono opacity-50 tracking-widest">OFFICIAL ID</span>
            </div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border-4 border-slate-800 shadow-xl flex items-center justify-center mb-4 relative">
                <span className="text-3xl font-bold text-slate-400">{officer.name ? officer.name.charAt(0).toUpperCase() : "U"}</span>
                <div className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-slate-800 rounded-full ${officer.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="text-center w-full space-y-1 mb-6">
                <h3 className="text-xl font-bold tracking-tight truncate px-2">{officer.name}</h3>
                <p className="text-primary-400 text-sm font-medium">Field Officer</p>
                <div className="w-8 h-1 bg-slate-700 rounded-full mx-auto mt-3" />
            </div>
            <div className="w-full grid grid-cols-1 gap-3 mt-auto">
                <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-[10px] uppercase text-slate-400">Email</p>
                        <p className="text-xs font-semibold truncate w-40" title={officer.email}>{officer.email}</p>
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-[10px] uppercase text-slate-400">Zones</p>
                        <p className="text-xs font-semibold truncate w-40">
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