// OfficerDashboard.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, MapPin, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const OfficerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch complaints assigned to THIS officer
  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/complaints/my-history'); // Reuses the endpoint, backend filters by role automatically
      if (data.success) setTasks(data.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      fetchTasks(); // Refresh list
    } catch (error) {
      alert("Update failed");
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading Assignments...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto pb-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Officer Dashboard</h1>
          <p className="text-slate-500">Manage your assigned grievances</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
              <h3 className="text-slate-500 text-sm font-bold uppercase">Active Tasks</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {tasks.filter(t => t.status !== 'resolved').length}
              </p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
              <h3 className="text-slate-500 text-sm font-bold uppercase">Resolved</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {tasks.filter(t => t.status === 'resolved').length}
              </p>
           </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
           {tasks.length === 0 ? (
               <div className="text-center py-10 text-slate-500 bg-white dark:bg-slate-800 rounded-xl shadow-sm">No tasks assigned yet.</div>
           ) : (
               tasks.map((task) => (
                 <motion.div 
                   key={task._id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                 >
                   <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <Badge variant={task.status === 'resolved' ? 'success' : 'warning'}>
                             {task.status.replace('_', ' ')}
                           </Badge>
                           <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                             {task.priorityLevel === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                             {task.priorityLevel} Priority
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{task.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{task.description}</p>
                        
                        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                           <div className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(task.createdAt).toDateString()}</div>
                           <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {task.location} ({task.zone})</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 min-w-[140px]">
                         {task.status !== 'resolved' && (
                           <Button 
                             onClick={() => handleStatusUpdate(task._id, 'resolved')}
                             className="bg-green-600 hover:bg-green-700 text-white py-2 text-sm"
                           >
                             Mark Resolved
                           </Button>
                         )}
                         {task.status !== 'rejected' && (
                           <Button 
                             onClick={() => handleStatusUpdate(task._id, 'rejected')}
                             variant="danger"
                             className="py-2 text-sm"
                           >
                             Reject / Spam
                           </Button>
                         )}
                      </div>
                   </div>
                 </motion.div>
               ))
           )}
        </div>

      </div>
    </div>
  );
};

export default OfficerDashboard;