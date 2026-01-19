import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, Clock, AlertCircle, RefreshCcw, BarChart3, 
  Filter, Building2, AlertTriangle, X 
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Confirmation State
  const [pendingAction, setPendingAction] = useState(null); 

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, deptsRes] = await Promise.all([
        api.get('/complaints/admin/all'), // This now returns SORTED data
        api.get('/admin/departments')
      ]);

      const cData = complaintsRes.data.data || [];
      setComplaints(Array.isArray(cData) ? cData : []);

      const dData = deptsRes.data.data || [];
      setDepartments(Array.isArray(dData) ? dData : []);

    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      toast.error("Failed to sync dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // --- INITIATE CHANGE ---
  const initiateChange = (id, type, value, currentLabel) => {
    let newValueLabel = value;
    if (type === 'department') {
        const dept = departments.find(d => d._id === value);
        newValueLabel = dept ? dept.name : 'Unknown Dept';
    }
    setPendingAction({ id, type, value, label: newValueLabel, currentLabel });
  };

  // --- EXECUTE UPDATE ---
  const executeUpdate = async () => {
    if (!pendingAction) return;
    const { id, type, value } = pendingAction;
    setPendingAction(null);

    // Optimistic Update
    const originalComplaints = [...complaints];
    setComplaints(prev => prev.map(c => {
      if (c._id === id) {
        if (type === 'status') return { ...c, status: value };
        if (type === 'priority') return { ...c, priorityLevel: value }; 
        if (type === 'department') {
            const newDept = departments.find(d => d._id === value);
            return { ...c, department: newDept || c.department };
        }
      }
      return c;
    }));

    try {
      if (type === 'status') {
        await api.patch(`/complaints/${id}/status`, { status: value });
        toast.success(`Status updated`);
      } else {
        const payload = type === 'priority' ? { priority: value } : { departmentId: value };
        await api.put(`/complaints/${id}/reclassify`, payload);
        toast.success(`Updated successfully`);
      }
    } catch (error) {
      toast.error(`Update failed`);
      setComplaints(originalComplaints); 
    }
  };

  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return c.status === 'resolved';
    if (filter === 'pending') return c.status !== 'resolved' && c.status !== 'rejected';
    if (filter === 'critical') return c.priorityLevel === 'Critical'; 
    return true;
  });

  const stats = {
    pending: complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    total: complaints.length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans text-slate-900 dark:text-slate-100 relative">
      <Navbar />
      
      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border dark:border-slate-700">
                    <div className="p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">Confirm Change?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                            Change <span className="font-bold uppercase">{pendingAction.type}</span> to <span className="font-bold text-indigo-500">"{pendingAction.label}"</span>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setPendingAction(null)} className="flex-1 py-2 rounded-xl border font-bold">Cancel</button>
                            <button onClick={executeUpdate} className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">Confirm</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-indigo-500" /> Admin Command Center
            </h1>
            <p className="text-slate-500 mt-1">Manage complaints, overrides, and workflows.</p>
          </div>
          <button onClick={fetchDashboardData} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-50 transition">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Data
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Pending Action" count={stats.pending} icon={<AlertCircle className="text-orange-500" />} color="border-orange-500" />
            <StatCard label="Resolved Cases" count={stats.resolved} icon={<CheckCircle className="text-green-500" />} color="border-green-500" />
            <StatCard label="Total Database" count={stats.total} icon={<Clock className="text-blue-500" />} color="border-blue-500" />
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b dark:border-slate-700 flex gap-2 overflow-x-auto">
             {['all', 'pending', 'resolved', 'critical'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${filter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700'}`}>{f}</button>
             ))}
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Complaint Details</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredComplaints.map((c) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      
                      {/* 1. Details */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex gap-3">
                            <div className="mt-1 min-w-[2rem] h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold">
                                {c.citizen?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</div>
                                <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                    <span className="font-mono">#{c._id.slice(-6)}</span>
                                    <span>• {new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                      </td>

                      {/* 2. Department Dropdown */}
                      <td className="px-6 py-4">
                        <div className="relative">
                            <select 
                                value={c.department?._id || c.department} 
                                onChange={(e) => initiateChange(c._id, 'department', e.target.value)}
                                className="w-40 pl-8 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-none font-bold text-xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
                            >
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                            <Building2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </td>

                      {/* 3. Priority Dropdown */}
                      <td className="px-6 py-4">
                        <select 
                          value={c.priorityLevel || 'Low'}
                          onChange={(e) => initiateChange(c._id, 'priority', e.target.value)}
                          className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer text-center w-28 appearance-none border-2
                            ${c.priorityLevel === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 
                              c.priorityLevel === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200'}
                          `}
                        >
                          {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>

                      {/* 4. Status Dropdown (UPDATED OPTIONS) */}
                      <td className="px-6 py-4">
                        <select 
                          value={c.status}
                          onChange={(e) => initiateChange(c._id, 'status', e.target.value)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer w-32 appearance-none border
                            ${c.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 
                              c.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'}
                          `}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="assigned">Assigned</option> {/* Added */}
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                          {/* Removed 'in_progress' from manual selection */}
                        </select>
                      </td>

                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, icon, color }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-l-4 ${color}`}>
    <div className="flex justify-between items-center">
      <div><p className="text-slate-500 text-sm font-bold uppercase">{label}</p><p className="text-3xl font-extrabold mt-1">{count}</p></div>
      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;