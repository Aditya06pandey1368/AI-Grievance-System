import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";
import Card from "../components/ui/Card";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await api.get('/complaints/admin/all');
        setComplaints(data.data);
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}`, { status: newStatus });
      // Update UI locally to reflect change instantly
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Command Center
          </h1>
          <span className="bg-primary-100 text-primary-700 px-4 py-1 rounded-full text-sm font-bold">
            Admin Access
          </span>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              label="Total Complaints" 
              count={complaints.length} 
              icon={<AlertCircle />} 
              color="blue" 
            />
            <StatCard 
              label="Pending" 
              count={complaints.filter(c => c.status !== 'resolved').length} 
              icon={<Clock />} 
              color="orange" 
            />
            <StatCard 
              label="Resolved" 
              count={complaints.filter(c => c.status === 'resolved').length} 
              icon={<CheckCircle />} 
              color="green" 
            />
        </div>

        {/* MASTER TABLE */}
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-medium">{c.title}</td>
                  <td className="px-6 py-4">{c.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${c.priorityLevel === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {c.priorityLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">{c.status}</td>
                  <td className="px-6 py-4">
                    {/* Simple Action Dropdown */}
                    <select 
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      className="bg-white dark:bg-slate-700 border border-slate-300 rounded px-2 py-1"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <div className="text-center py-10">No complaints found.</div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Small Helper Component for Stats
const StatCard = ({ label, count, icon, color }) => {
  const colors = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500"
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center justify-between">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{count}</p>
      </div>
      <div className={`p-3 rounded-xl text-white shadow-lg ${colors[color]}`}>
        {icon}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;