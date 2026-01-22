import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom"; // Added Link import
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  BarChart2, Users, AlertTriangle, CheckSquare, TrendingUp, Activity,
  Filter, RefreshCcw, Building2, CheckCircle, ShieldAlert, ChevronDown, 
  Check, Flame, ArrowUpCircle, MinusCircle, ArrowDownCircle
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const DeptDashboard = () => {
  const [stats, setStats] = useState({
    departmentName: "Department",
    totalComplaints: 0,
    pending: 0,
    resolved: 0,
    activeOfficers: 0,
    monthlyData: [],
    statusData: []
  });

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [pendingAction, setPendingAction] = useState(null);

  const fetchDashboardData = async () => {
    setIsSyncing(true);
    setLoading(true);
    
    try {
      const [statsRes, officersRes, complaintsRes, deptsRes] = await Promise.all([
        api.get("/stats/dashboard"), 
        api.get("/admin/officers"),
        api.get('/complaints/admin/all'),
        api.get('/admin/departments')
      ]);

      // 1. Process Stats
      const dashboardStats = statsRes.data.data || {};
      const officerList = officersRes.data.data || [];
      const statusDistribution = [
          { name: 'Pending', value: dashboardStats.pending || 0, color: '#f59e0b' },
          { name: 'Resolved', value: dashboardStats.resolved || 0, color: '#10b981' },
          { name: 'In Progress', value: (dashboardStats.totalComplaints - dashboardStats.pending - dashboardStats.resolved) || 0, color: '#3b82f6' }
      ].filter(item => item.value > 0);

      setStats({
        departmentName: dashboardStats.departmentName || "Department",
        totalComplaints: dashboardStats.totalComplaints || 0,
        pending: dashboardStats.pending || 0,
        resolved: dashboardStats.resolved || 0,
        activeOfficers: officerList.length,
        monthlyData: dashboardStats.monthlyData || [], 
        statusData: statusDistribution
      });

      // 2. Process Table Data
      const cData = complaintsRes.data.data || [];
      setComplaints(Array.isArray(cData) ? cData : []);

      // 3. Process Departments
      const dData = deptsRes.data.data || [];
      setDepartments(Array.isArray(dData) ? dData : []);

    } catch (error) {
      console.error("Dashboard Load Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- ACTIONS ---
  const initiateChange = (id, type, value, currentLabel) => {
    let newValueLabel = value;
    if (type === 'department') {
        const dept = departments.find(d => d._id === value);
        newValueLabel = dept ? dept.name : 'Unknown Dept';
    }
    setPendingAction({ id, type, value, label: newValueLabel, currentLabel });
  };

  const executeUpdate = async () => {
    if (!pendingAction) return;
    const { id, type, value } = pendingAction;
    setPendingAction(null);

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
        
        if (type === 'department') {
            setComplaints(prev => prev.filter(c => c._id !== id));
        }
      }
    } catch (error) {
      toast.error(`Update failed`);
      setComplaints(originalComplaints);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return c.status === 'resolved';
    if (filter === 'pending') return c.status !== 'resolved' && c.status !== 'rejected';
    if (filter === 'critical') return c.priorityLevel === 'Critical';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans text-slate-900 dark:text-slate-100 relative">
      <Navbar />
      
      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingAction && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.95, opacity: 0 }} 
                  className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Confirm Change?</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            Change <span className="font-bold uppercase">{pendingAction.type}</span> to <span className="font-bold text-indigo-600 dark:text-indigo-400">"{pendingAction.label}"</span>?
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setPendingAction(null)} className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={executeUpdate} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-transform active:scale-95">Confirm</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 max-w-[1600px] mx-auto pb-24">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3 tracking-tight text-slate-900 dark:text-white">
              <Activity className="w-10 h-10 text-indigo-600 dark:text-indigo-400" /> 
              {stats.departmentName} <span className="text-slate-500 dark:text-slate-400">Center</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
              Real-time metrics and performance analytics.
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData} 
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-xl transition-all text-slate-700 dark:text-slate-200 font-bold group"
          >
            <RefreshCcw className={`w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-colors ${isSyncing ? 'animate-spin' : ''}`} /> 
            <span>Sync Data</span>
          </motion.button>
        </div>

        {/* 3D STATS CARDS (Matching AdminDashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Complaints" count={stats.totalComplaints} icon={<BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400"/>} gradient="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" borderColor="border-blue-200 dark:border-blue-800" />
            <StatCard label="Pending Actions" count={stats.pending} icon={<AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400"/>} gradient="from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" borderColor="border-orange-200 dark:border-orange-800" />
            <StatCard label="Resolved Cases" count={stats.resolved} icon={<CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/>} gradient="from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20" borderColor="border-emerald-200 dark:border-emerald-800" />
            <StatCard label="Active Officers" count={stats.activeOfficers} icon={<Users className="w-6 h-6 text-purple-600 dark:text-purple-400"/>} gradient="from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20" borderColor="border-purple-200 dark:border-purple-800" />
        </div>

        {/* CHARTS SECTION (Preserved) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Complaint Trends (Last 12 Months)</h2>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                            <Bar dataKey="complaints" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Resolution Status</h2>
                <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {stats.statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold">Pending</p><p className="text-xl font-bold text-orange-500">{stats.pending}</p></div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold">Solved</p><p className="text-xl font-bold text-emerald-500">{stats.resolved}</p></div>
                </div>
            </motion.div>
        </div>

        {/* MAIN TABLE SECTION (Matching AdminDashboard) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 bg-white dark:bg-slate-900 rounded-t-3xl items-center">
             <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-sm mr-4">
               <Filter className="w-4 h-4" /> Filters:
             </div>
             <div className="flex gap-3">
                {['all', 'pending', 'resolved', 'critical'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 border ${filter === f ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    {f}
                  </button>
                ))}
             </div>
          </div>

          <div className="min-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-5 tracking-wider">Complaint Details</th>
                  <th className="px-8 py-5 tracking-wider w-64">Department</th>
                  <th className="px-8 py-5 tracking-wider w-48 text-center">Priority</th>
                  <th className="px-8 py-5 tracking-wider w-48 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                   <tr><td colSpan="4" className="px-6 py-32 text-center text-slate-400 animate-pulse font-medium">Syncing database...</td></tr>
                ) : filteredComplaints.length === 0 ? (
                   <tr><td colSpan="4" className="px-6 py-32 text-center text-slate-400 font-medium">No records found matching filters.</td></tr>
                ) : (
                  filteredComplaints.map((c, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: idx * 0.05 }}
                      key={c._id} 
                      style={{ zIndex: filteredComplaints.length - idx, position: "relative" }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                      <td className="px-8 py-6 max-w-sm">
                        <div className="flex gap-4">
                            <div className="mt-1 w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-600">
                                {c.citizen?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                {/* ADDED LINK HERE */}
                                <Link to={`/complaint/${c._id}`}>
                                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1 text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer hover:underline">
                                        {c.title}
                                    </div>
                                </Link>
                                <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                    <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                      #{c._id.slice(-6).toUpperCase()}
                                    </span>
                                    <span>• {new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 relative">
                        <CustomDropdown 
                            value={c.department?._id || "unassigned"}
                            options={[ ...departments.map(d => ({ label: d.name, value: d._id }))]}
                            onChange={(val) => initiateChange(c._id, 'department', val)}
                            type="department"
                        />
                      </td>

                      <td className="px-8 py-6 text-center relative">
                        <CustomDropdown 
                            value={c.priorityLevel || 'Low'}
                            options={[
                                { label: 'Critical', value: 'Critical', icon: <Flame className="w-3 h-3" /> },
                                { label: 'High', value: 'High', icon: <ArrowUpCircle className="w-3 h-3" /> },
                                { label: 'Medium', value: 'Medium', icon: <MinusCircle className="w-3 h-3" /> },
                                { label: 'Low', value: 'Low', icon: <ArrowDownCircle className="w-3 h-3" /> }
                            ]}
                            onChange={(val) => initiateChange(c._id, 'priority', val)}
                            type="priority"
                        />
                      </td>

                      <td className="px-8 py-6 text-center relative">
                        <CustomDropdown 
                            value={c.status}
                            options={[
                                { label: 'Submitted', value: 'submitted' },
                                { label: 'Assigned', value: 'assigned' },
                                { label: 'Resolved', value: 'resolved' },
                                { label: 'Rejected', value: 'rejected' }
                            ]}
                            onChange={(val) => initiateChange(c._id, 'status', val)}
                            type="status"
                        />
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

// --- SOLID OPAQUE DROPDOWN COMPONENT (Fixes visibility) ---
const CustomDropdown = ({ value, options, onChange, type }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getBadgeStyle = (option) => {
        if (type === 'priority') {
            switch (option.value) {
                case 'Critical': return 'bg-red-600 text-white border-red-700 shadow-md';
                case 'High': return 'bg-orange-500 text-white border-orange-600 shadow-md';
                case 'Medium': return 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-md';
                case 'Low': return 'bg-blue-500 text-white border-blue-600 shadow-md';
                default: return 'bg-slate-200 text-slate-800';
            }
        }
        if (type === 'status') {
            switch (option.value) {
                case 'resolved': return 'bg-emerald-600 text-white border-emerald-700 shadow-md';
                case 'rejected': return 'bg-red-600 text-white border-red-700 shadow-md';
                case 'assigned': return 'bg-indigo-600 text-white border-indigo-700 shadow-md';
                default: return 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-indigo-500';
            }
        }
        return 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700';
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all duration-200 ${getBadgeStyle(selectedOption)}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption.icon}
                    <span className="truncate">{selectedOption.label}</span>
                </div>
                <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 overflow-hidden z-50 min-w-[140px]"
                    >
                        <div className="max-h-60 overflow-y-auto py-1">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 last:border-0"
                                >
                                    {opt.icon && <span className="opacity-70">{opt.icon}</span>}
                                    {opt.label}
                                    {opt.value === value && <Check className="w-4 h-4 ml-auto text-indigo-500" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ label, count, icon, gradient, borderColor }) => (
  <motion.div 
    whileHover={{ y: -5, rotateX: 2 }}
    className={`p-6 rounded-3xl shadow-xl bg-gradient-to-br ${gradient} border ${borderColor} relative overflow-hidden group`}
  >
    <div className="relative z-10 flex justify-between items-center">
      <div>
        <p className="text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{count}</p>
      </div>
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 dark:bg-black/10 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
  </motion.div>
);

export default DeptDashboard;