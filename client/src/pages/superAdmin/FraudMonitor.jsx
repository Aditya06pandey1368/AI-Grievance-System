import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Ban, 
  CheckCircle, 
  Search, 
  AlertTriangle,
  RefreshCcw,
  UserX
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const FraudMonitor = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, banned, low_trust

  // --- FETCH USERS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      const allUsers = res.data.data || [];
      
      // Filter: Show Banned Users OR Low Trust Score (< 50)
      const flaggedUsers = allUsers.filter(u => !u.isActive || u.trustScore < 50);
      setUsers(flaggedUsers);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- HANDLE BAN / UNBAN ---
  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const newStatus = !currentStatus; // Toggle boolean
    const action = newStatus ? "Unbanned" : "Banned";

    // 1. Optimistic Update (UI updates immediately)
    setUsers(prev => prev.map(u => 
      u._id === userId ? { ...u, isActive: newStatus } : u
    ));

    try {
      // 2. Call API
      await api.put(`/admin/users/${userId}/status`, { isActive: newStatus });
      toast.success(`${userName} has been ${action}`);
      
      // Optional: Refresh list to ensure consistency
      // fetchUsers(); 
    } catch (error) {
      // 3. Revert on Error
      toast.error(`Failed to ${action.toLowerCase()} user`);
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, isActive: currentStatus } : u
      ));
    }
  };

  // --- FILTERING FOR UI ---
  const displayUsers = users.filter(u => {
    if (filterType === 'banned') return !u.isActive;
    if (filterType === 'low_trust') return u.trustScore < 50;
    return true;
  });

  const stats = {
    totalFlagged: users.length,
    banned: users.filter(u => !u.isActive).length,
    lowTrust: users.filter(u => u.isActive && u.trustScore < 50).length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans text-slate-900 dark:text-slate-100">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-red-600 dark:text-red-500">
              <ShieldAlert className="w-10 h-10" />
              Fraud & Ban Monitor
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
              Manage suspended accounts and low-trust entities.
            </p>
          </div>
          
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total Flagged</p>
                    <p className="text-3xl font-black">{stats.totalFlagged}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-slate-500 flex items-center justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Currently Banned</p>
                    <p className="text-3xl font-black">{stats.banned}</p>
                </div>
                <Ban className="w-8 h-8 text-slate-500 opacity-50" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">At Risk (Low Score)</p>
                    <p className="text-3xl font-black">{stats.lowTrust}</p>
                </div>
                <UserX className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center bg-slate-50/50 dark:bg-slate-900/20">
             <div className="flex gap-2">
                {['all', 'banned', 'low_trust'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                      filterType === f 
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
             </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Trust Score</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {displayUsers.length === 0 ? (
                   <tr>
                     <td colSpan="5" className="px-6 py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                       <CheckCircle className="w-10 h-10 text-green-500" />
                       <span className="font-medium">Clean Record. No suspicious users found.</span>
                     </td>
                   </tr>
                ) : (
                  displayUsers.map((u) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={u._id} 
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${!u.isActive ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-bold uppercase">
                            {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-full max-w-[80px] h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${u.trustScore < 30 ? 'bg-red-500' : u.trustScore < 60 ? 'bg-orange-500' : 'bg-green-500'}`} 
                                    style={{ width: `${u.trustScore}%` }}
                                />
                            </div>
                            <span className={`font-bold ${u.trustScore < 50 ? 'text-red-500' : 'text-slate-500'}`}>
                                {u.trustScore}
                            </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                <CheckCircle className="w-3 h-3" /> Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                <Ban className="w-3 h-3" /> Banned
                            </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => handleToggleStatus(u._id, u.isActive, u.name)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                u.isActive 
                                ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:bg-slate-800 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20' 
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20'
                            }`}
                        >
                            {u.isActive ? "BAN USER" : "UNBAN USER"}
                        </button>
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

export default FraudMonitor;