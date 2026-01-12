import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { BarChart2, Users, AlertTriangle, CheckSquare, TrendingUp, Activity } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const DeptDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    resolved: 0,
    activeOfficers: 0,
    monthlyData: [], // Will be filled by API
    statusData: []
  });

  // 1. Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Parallel Fetching
        const [statsRes, officersRes] = await Promise.all([
          api.get("/stats/dashboard"), 
          api.get("/admin/officers") 
        ]);

        const dashboardStats = statsRes.data.data || {};
        const officerList = officersRes.data.data || [];

        // Prepare Status Distribution for Pie Chart
        const statusDistribution = [
            { name: 'Pending', value: dashboardStats.pending || 0, color: '#f59e0b' },
            { name: 'Resolved', value: dashboardStats.resolved || 0, color: '#10b981' },
            { name: 'In Progress', value: (dashboardStats.totalComplaints - dashboardStats.pending - dashboardStats.resolved) || 0, color: '#3b82f6' }
        ].filter(item => item.value > 0); // Hide 0 value segments

        setStats({
          totalComplaints: dashboardStats.totalComplaints || 0,
          pending: dashboardStats.pending || 0,
          resolved: dashboardStats.resolved || 0,
          activeOfficers: officerList.length,
          monthlyData: dashboardStats.monthlyData || [], // REAL DATA from Backend
          statusData: statusDistribution
        });

      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans overflow-hidden">
      <Navbar />
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12 relative z-10">
        
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4"
        >
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Activity className="w-8 h-8 text-primary-500" />
                    Department Command Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    Real-time metrics and performance analytics.
                </p>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Last Updated</p>
                <p className="text-slate-900 dark:text-white font-mono">{new Date().toLocaleTimeString()}</p>
            </div>
        </motion.div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <DashCard 
             label="Total Complaints" 
             value={stats.totalComplaints} 
             icon={<BarChart2 className="w-6 h-6 text-blue-500"/>} 
             color="border-blue-500"
             trend="Lifetime"
             delay={0}
           />
           <DashCard 
             label="Pending Actions" 
             value={stats.pending} 
             icon={<AlertTriangle className="w-6 h-6 text-orange-500"/>} 
             color="border-orange-500"
             trend="Needs Attention"
             delay={0.1}
           />
           <DashCard 
             label="Resolved Cases" 
             value={stats.resolved} 
             icon={<CheckSquare className="w-6 h-6 text-green-500"/>} 
             color="border-green-500"
             trend="Completed"
             delay={0.2}
           />
           <DashCard 
             label="Active Officers" 
             value={stats.activeOfficers} 
             icon={<Users className="w-6 h-6 text-purple-500"/>} 
             color="border-purple-500"
             trend="On Duty"
             delay={0.3}
           />
        </div>
        
        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Chart: Monthly Trends */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" /> Complaint Trends (Last 12 Months)
                    </h2>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            />
                            <Bar 
                                dataKey="complaints" 
                                fill="#6366f1" 
                                radius={[6, 6, 0, 0]} 
                                barSize={40}
                                animationDuration={1500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Secondary Chart: Status Distribution */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700"
            >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Resolution Status</h2>
                <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-bold">Pending</p>
                        <p className="text-xl font-bold text-orange-500">{stats.pending}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-bold">Solved</p>
                        <p className="text-xl font-bold text-green-500">{stats.resolved}</p>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

// 3D Card Component with Hover Effect
const DashCard = ({ label, value, icon, color, trend, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border-l-4 ${color} border-y border-r border-slate-200 dark:border-slate-700 relative overflow-hidden group`}
  >
    {/* Background Glow */}
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
    
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{value}</h3>
        <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">
           {trend && <span className="text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">{trend}</span>}
        </p>
      </div>
      <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-700 shadow-inner`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default DeptDashboard;