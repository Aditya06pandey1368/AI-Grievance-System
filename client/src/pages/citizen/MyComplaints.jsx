import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/complaints/my-history");
        if (data.success) setComplaints(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filtered = complaints.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors">
      <Navbar />
      <div className="pt-24 px-4 max-w-5xl mx-auto pb-12">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Complaints</h1>
          
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
                placeholder="Search titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((c) => (
            <motion.div 
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{c.title}</h3>
                <p className="text-sm text-slate-500">{new Date(c.createdAt).toLocaleDateString()} • {c.zone}</p>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-xs font-bold text-slate-400">{c.priorityLevel} Priority</span>
                 <Badge variant={c.status === 'resolved' ? 'success' : 'default'}>{c.status}</Badge>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-center text-slate-500 mt-10">No complaints found.</p>}
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;