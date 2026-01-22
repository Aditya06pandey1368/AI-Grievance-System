import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Ban, 
  CheckCircle, 
  Search, 
  AlertTriangle,
  RefreshCcw,
  UserX,
  X
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const FraudMonitor = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    userId: null, 
    currentStatus: null, 
    userName: "" 
  });

  // --- FETCH USERS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      const allUsers = res.data.data || [];
      
      const flaggedUsers = allUsers.filter(u => !u.isActive || u.trustScore < 50);
      setUsers(flaggedUsers);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- ACTIONS ---
  
  // 1. Open Modal
  const initiateAction = (userId, currentStatus, userName) => {
    setConfirmModal({
        show: true,
        userId,
        currentStatus, // true = active (so action is BAN), false = banned (so action is UNBAN)
        userName
    });
  };

  // 2. Execute Logic (After Confirmation)
  const executeToggleStatus = async () => {
    const { userId, currentStatus, userName } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false }); // Close modal

    const newStatus = !currentStatus;
    const action = newStatus ? "Unbanned" : "Banned";

    // Optimistic Update
    setUsers(prev => prev.map(u => 
      u._id === userId ? { ...u, isActive: newStatus } : u
    ));

    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: newStatus });
      toast.success(`${userName} has been ${action}`);
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} user`);
      // Revert on error
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, isActive: currentStatus } : u
      ));
    }
  };

  // --- FILTERING ---
  const displayUsers = users.filter(u => {
    const matchesCategory = 
        filterType === 'all' || 
        (filterType === 'banned' && !u.isActive) ||
        (filterType === 'low_trust' && u.trustScore < 50);

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
        u.name.toLowerCase().includes(searchLower) || 
        u.email.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  const stats = {
    totalFlagged: users.length,
    banned: users.filter(u => !u.isActive).length,
    lowTrust: users.filter(u => u.isActive && u.trustScore < 50).length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <Navbar />
      
      {/* Decorative Red Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {confirmModal.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className={`p-8 text-center text-white ${confirmModal.currentStatus ? 'bg-red-600' : 'bg-green-600'}`}>
                        <div className="mb-4 flex justify-center">
                            <motion.div 
                                initial={{ rotate: -45, scale: 0.5 }} 
                                animate={{ rotate: 0, scale: 1 }}
                                className="p-3 bg-white/20 rounded-full backdrop-blur-sm"
                            >
                                {confirmModal.currentStatus ? <Ban className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
                            </motion.div>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-wider drop-shadow-md">
                            {confirmModal.currentStatus ? 'Ban User?' : 'Restore Access?'}
                        </h3>
                    </div>
                    
                    <div className="p-6 text-center">
                        <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm font-bold uppercase tracking-wide">Target User</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-6 truncate px-4">
                            {confirmModal.userName}
                        </p>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                            {confirmModal.currentStatus 
                                ? "This action will revoke their login access immediately." 
                                : "This action will restore their account permissions."}
                        </p>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmModal({ ...confirmModal, show: false })} 
                                className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={executeToggleStatus} 
                                className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all ${
                                    confirmModal.currentStatus 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                }`}
                            >
                                Confirm
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-red-600 dark:text-red-500 drop-shadow-sm">
              <ShieldAlert className="w-12 h-12" />
              Fraud & Ban Monitor
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium max-w-2xl">
              Real-time surveillance of suspended accounts and low-trust entities.
            </p>
          </div>
          
          {/* SYNC BUTTON (Applied Requested Styles) */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchUsers} 
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-xl transition-all text-slate-700 dark:text-slate-200 font-bold group"
          >
            <RefreshCcw className={`w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors ${loading ? 'animate-spin' : ''}`} /> 
            <span>Sync Data</span>
          </motion.button>
        </div>

        {/* 3D STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Stat3DCard 
                label="Total Flagged" 
                value={stats.totalFlagged} 
                icon={<AlertTriangle className="w-8 h-8 text-white" />} 
                gradient="bg-gradient-to-br from-red-500 to-rose-600"
                shadow="shadow-red-500/40"
            />
            <Stat3DCard 
                label="Currently Banned" 
                value={stats.banned} 
                icon={<Ban className="w-8 h-8 text-white" />} 
                gradient="bg-gradient-to-br from-slate-600 to-slate-800"
                shadow="shadow-slate-500/40"
            />
            <Stat3DCard 
                label="At Risk (Low Score)" 
                value={stats.lowTrust} 
                icon={<UserX className="w-8 h-8 text-white" />} 
                gradient="bg-gradient-to-br from-orange-500 to-amber-600"
                shadow="shadow-orange-500/40"
            />
        </div>

        {/* MAIN CONTENT BLOCK */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-red-900/5 dark:shadow-black/50 border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col lg:flex-row gap-6 justify-between items-center">
             
             {/* 3D Search Bar */}
             <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search user by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all shadow-sm font-medium"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                    </button>
                )}
             </div>

             {/* Filter Tabs */}
             <div className="flex p-1 bg-slate-200 dark:bg-slate-900 rounded-xl">
                {['all', 'banned', 'low_trust'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                      filterType === f 
                      ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-md transform scale-105' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
             </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-8 py-5">User Identity</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Trust Integrity</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Enforcement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {displayUsers.length === 0 ? (
                   <tr>
                     <td colSpan="5" className="px-6 py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                       <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                       </div>
                       <span className="font-bold text-lg text-slate-600 dark:text-slate-300">No records found</span>
                       <span className="text-sm">Try adjusting your filters or search query.</span>
                     </td>
                   </tr>
                ) : (
                  displayUsers.map((u, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={u._id} 
                      className={`group transition-all hover:bg-red-50/50 dark:hover:bg-red-900/10 ${!u.isActive ? 'bg-red-50/30 dark:bg-red-950/20' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-base">{u.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-1">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-24 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${u.trustScore}%` }}
                                    className={`h-full ${u.trustScore < 30 ? 'bg-red-600' : u.trustScore < 60 ? 'bg-orange-500' : 'bg-green-500'}`} 
                                />
                            </div>
                            <span className={`font-black text-lg ${u.trustScore < 50 ? 'text-red-600 drop-shadow-sm' : 'text-slate-700 dark:text-slate-300'}`}>
                                {u.trustScore}
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {u.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                <CheckCircle className="w-3.5 h-3.5" /> Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse">
                                <Ban className="w-3.5 h-3.5" /> Banned
                            </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => initiateAction(u._id, u.isActive, u.name)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide shadow-md transition-all ${
                                u.isActive 
                                ? 'bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 hover:shadow-red-500/20 dark:bg-slate-800 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-500/30'
                            }`}
                        >
                            {u.isActive ? "Ban User" : "Restore Access"}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3D Card Component ---
const Stat3DCard = ({ label, value, icon, gradient, shadow }) => (
    <motion.div 
        whileHover={{ y: -10, rotateX: 5 }}
        className={`relative p-6 rounded-3xl overflow-hidden ${gradient} ${shadow} shadow-2xl text-white border border-white/10`}
    >
        <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12 scale-150">
            {icon}
        </div>
        <div className="relative z-10">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
            <h3 className="text-5xl font-black tracking-tighter">{value}</h3>
        </div>
        {/* Glass Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
    </motion.div>
);

export default FraudMonitor;