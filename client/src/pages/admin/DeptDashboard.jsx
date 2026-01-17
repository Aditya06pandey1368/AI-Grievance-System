import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  BarChart2, 
  Users, 
  AlertTriangle, 
  CheckSquare, 
  TrendingUp, 
  Activity,
  Filter,
  RefreshCcw,
  Building2,
  CheckCircle
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const DeptDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // Stats & Charts State
  const [stats, setStats] = useState({
    departmentName: "Department",
    totalComplaints: 0,
    pending: 0,
    resolved: 0,
    activeOfficers: 0,
    monthlyData: [],
    statusData: []
  });

  // Table Data State
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [filter, setFilter] = useState("all");

  // --- 1. FETCH ALL DATA ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
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
      const cData = complaintsRes.data.data || complaintsRes.data || [];
      setComplaints(Array.isArray(cData) ? cData : []);

      // 3. Process Departments (for Dropdown)
      const dData = deptsRes.data.data || deptsRes.data || [];
      if (Array.isArray(dData) && dData.length > 0) {
          setDepartments(dData);
      } else {
          setDepartments([]); 
      }

    } catch (error) {
      console.error("Dashboard Load Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- 2. UPDATE HANDLER ---
  const handleUpdate = async (id, type, value) => {
    const originalComplaints = [...complaints];

    // Optimistic Update
    setComplaints(prev => prev.map(c => {
      if (c._id === id) {
        if (type === 'status') return { ...c, status: value };
        // We update local state 'priorityLevel' immediately
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
        toast.success(`Status updated to ${value}`);
      } else {
        // --- FIX IS HERE ---
        // Backend expects 'priority', not 'priorityLevel' in req.body
        const payload = type === 'priority' ? { priority: value } : { departmentId: value };
        
        await api.put(`/complaints/${id}/reclassify`, payload);
        toast.success(`${type === 'priority' ? 'Priority' : 'Department'} updated successfully`);
        
        if (type === 'department') {
            setComplaints(prev => prev.filter(c => c._id !== id));
        }
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error(`Failed to update ${type}`);
      setComplaints(originalComplaints); // Revert on failure
    }
  };

  // --- 3. FILTER LOGIC ---
  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return c.status === 'resolved';
    if (filter === 'pending') return c.status !== 'resolved' && c.status !== 'rejected';
    // FIX: Ensure we check priorityLevel properly
    if (filter === 'critical') return c.priorityLevel === 'Critical';
    return true;
  });

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading Intelligence...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans overflow-hidden text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12 relative z-10">
        
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4"
        >
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Activity className="w-8 h-8 text-primary-500" />
                    {stats.departmentName} Command Center 
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    Real-time metrics and performance analytics.
                </p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Last Updated</p>
                    <p className="text-slate-900 dark:text-white font-mono">{new Date().toLocaleTimeString()}</p>
                </div>
                <button 
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                    <RefreshCcw className="w-3 h-3" /> Sync
                </button>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <DashCard label="Total Complaints" value={stats.totalComplaints} icon={<BarChart2 className="w-6 h-6 text-blue-500"/>} color="border-blue-500" trend="Lifetime" delay={0}/>
           <DashCard label="Pending Actions" value={stats.pending} icon={<AlertTriangle className="w-6 h-6 text-orange-500"/>} color="border-orange-500" trend="Needs Attention" delay={0.1}/>
           <DashCard label="Resolved Cases" value={stats.resolved} icon={<CheckSquare className="w-6 h-6 text-green-500"/>} color="border-green-500" trend="Completed" delay={0.2}/>
           <DashCard label="Active Officers" value={stats.activeOfficers} icon={<Users className="w-6 h-6 text-purple-500"/>} color="border-purple-500" trend="On Duty" delay={0.3}/>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary-500" /> Complaint Trends (Last 12 Months)</h2>
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
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold">Pending</p><p className="text-xl font-bold text-orange-500">{stats.pending}</p></div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><p className="text-xs text-slate-500 uppercase font-bold">Solved</p><p className="text-xl font-bold text-green-500">{stats.resolved}</p></div>
                </div>
            </motion.div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-10">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center bg-slate-50/50 dark:bg-slate-900/20">
             <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-wider mr-2">
                <Filter className="w-4 h-4" /> Filters:
             </div>
             <div className="flex gap-2">
                {['all', 'pending', 'resolved', 'critical'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                      filter === f 
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Complaint Details</th>
                  <th className="px-6 py-4">Department (Route)</th>
                  <th className="px-6 py-4">Priority Score</th>
                  <th className="px-6 py-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                      <CheckCircle className="w-10 h-10 text-slate-300" />
                      <span>No complaints match this filter.</span>
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={c._id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 min-w-[2rem] h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                {c.citizen?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white line-clamp-1" title={c.title}>
                                    {c.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-[10px]">ID: {c._id.slice(-6)}</span>
                                    <span>• {new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="relative">
                            <select 
                                value={c.department?._id || c.department} 
                                onChange={(e) => handleUpdate(c._id, 'department', e.target.value)}
                                className="w-40 pl-9 pr-8 py-2 rounded-lg text-xs font-bold appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-800"
                            >
                                {departments.length === 0 ? (
                                    <option value="" disabled className="text-slate-400 italic">No Depts Found</option>
                                ) : (
                                    departments.map(d => (
                                        <option key={d._id} value={d._id} className="dark:bg-slate-800 dark:text-white">
                                            {d.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select 
                          value={c.priorityLevel || 'Low'}
                          onChange={(e) => handleUpdate(c._id, 'priority', e.target.value)}
                          className={`appearance-none pl-4 pr-8 py-1.5 rounded-full text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 transition-all text-center w-32 dark:text-white
                            ${(c.priorityLevel === 'Critical') ? 'bg-red-100 text-red-700 dark:bg-red-600 dark:text-white border border-red-200 dark:border-red-500' : ''}
                            ${(c.priorityLevel === 'High') ? 'bg-orange-100 text-orange-700 dark:bg-orange-600 dark:text-white border border-orange-200 dark:border-orange-500' : ''}
                            ${(c.priorityLevel === 'Medium') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white border border-yellow-200 dark:border-yellow-500' : ''}
                            ${(!c.priorityLevel || c.priorityLevel === 'Low') ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white border border-blue-200 dark:border-blue-500' : ''}
                          `}
                        >
                          <option value="Critical" className="dark:bg-slate-800 text-slate-900 dark:text-white">Critical</option>
                          <option value="High" className="dark:bg-slate-800 text-slate-900 dark:text-white">High</option>
                          <option value="Medium" className="dark:bg-slate-800 text-slate-900 dark:text-white">Medium</option>
                          <option value="Low" className="dark:bg-slate-800 text-slate-900 dark:text-white">Low</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <select 
                          value={c.status}
                          onChange={(e) => handleUpdate(c._id, 'status', e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors border w-32
                            ${c.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' : 
                              c.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' :
                              'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'}
                          `}
                        >
                          <option value="submitted" className="dark:bg-slate-800 text-slate-900 dark:text-white">Submitted</option>
                          <option value="in_progress" className="dark:bg-slate-800 text-slate-900 dark:text-white">In Progress</option>
                          <option value="resolved" className="dark:bg-slate-800 text-slate-900 dark:text-white">Resolved</option>
                          <option value="rejected" className="dark:bg-slate-800 text-slate-900 dark:text-white">Rejected</option>
                        </select>
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

const DashCard = ({ label, value, icon, color, trend, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} whileHover={{ y: -5, scale: 1.02 }} className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border-l-4 ${color} border-y border-r border-slate-200 dark:border-slate-700 relative overflow-hidden group`}>
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{value}</h3>
        <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">{trend && <span className="text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">{trend}</span>}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-700 shadow-inner`}>{icon}</div>
    </div>
  </motion.div>
);

export default DeptDashboard;