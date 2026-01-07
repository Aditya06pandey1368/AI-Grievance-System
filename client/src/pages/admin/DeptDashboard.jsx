import { useEffect, useState } from "react";
import { BarChart2, Users, AlertTriangle, CheckSquare } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";

const DeptDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // This assumes you have a generic stats endpoint or we reuse the admin one
    api.get("/stats/dashboard").then(res => setStats(res.data.data));
  }, []);

  if (!stats) return <div className="min-h-screen pt-24 text-center">Loading Stats...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Department Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <DashCard label="Total Complaints" value={stats.totalComplaints} icon={<BarChart2 className="text-blue-500"/>} />
           <DashCard label="Pending" value={stats.pending} icon={<AlertTriangle className="text-orange-500"/>} />
           <DashCard label="Resolved" value={stats.resolved} icon={<CheckSquare className="text-green-500"/>} />
           <DashCard label="Active Officers" value="12" icon={<Users className="text-purple-500"/>} />
        </div>
        
        {/* Placeholder for Charts */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-96 flex items-center justify-center text-slate-400">
           Chart Visualization would go here (Requires Recharts)
        </div>
      </div>
    </div>
  );
};

const DashCard = ({ label, value, icon }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-bold uppercase">{label}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">{icon}</div>
  </div>
);

export default DeptDashboard;