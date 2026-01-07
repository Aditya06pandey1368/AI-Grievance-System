import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Plus, 
  FileText,
  Loader2,
  MapPin,
  Calendar
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        // This endpoint (from your controller) already filters by req.user._id
        // So it ONLY returns this specific citizen's complaints.
        const { data } = await axios.get("http://localhost:5000/api/complaints/my-history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setComplaints(data.data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // 2. Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "submitted": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case "Critical": return "text-red-600 bg-red-50 border-red-100";
      case "High": return "text-orange-600 bg-orange-50 border-orange-100";
      case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  // 3. Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-12">
        
        {/* HEADER SECTION - Welcome & Action Only */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 border-b border-slate-200 dark:border-slate-700 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, <span className="text-primary-500">{user?.name}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              View your submitted grievances and their current status.
            </p>
          </div>
          
          <Link to="/submit-complaint">
            <Button className="shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 flex items-center gap-2 px-6 py-3 text-base">
              <Plus className="w-5 h-5" /> Submit New Complaint
            </Button>
          </Link>
        </div>

        {/* COMPLAINTS LIST SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              My Recent Activity
            </h2>
            <span className="text-sm text-slate-500 font-medium bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              {complaints.length} Records
            </span>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-40">
               <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
             </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No complaints yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm text-center">
                You haven't submitted any grievances. If you see an issue in your area, report it now.
              </p>
              <Link to="/submit-complaint" className="mt-6">
                <Button variant="outline">Report an Issue</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {complaints.map((complaint, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={complaint._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 group"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    
                    {/* Left: Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between md:justify-start gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(complaint.priorityLevel)}`}>
                          {complaint.priorityLevel}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                          {complaint.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {complaint.location}
                        </div>
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {complaint.category}
                        </span>
                      </div>
                    </div>

                    {/* Right: Image Preview (Optional - if you want to show it) */}
                    {complaint.images && complaint.images.length > 0 && (
                      <div className="hidden md:block w-24 h-24 shrink-0">
                         <img 
                           src={`http://localhost:5000${complaint.images[0]}`} 
                           alt="Proof" 
                           className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                         />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;