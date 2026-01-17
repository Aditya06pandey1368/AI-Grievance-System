import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, complaint, onUpdateSuccess }) => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    departmentId: "",
    priority: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  // 1. Load Departments dynamically on mount
  useEffect(() => {
    if (isOpen) {
      // Pre-fill current values
      setFormData({
        departmentId: complaint.department?._id || complaint.department, // Handle populated or unpopulated
        priority: complaint.priority,
        notes: ""
      });

      // Fetch all departments for the dropdown
      api.get("/departments/all") // Ensure you have a route to get all depts
        .then((res) => setDepartments(res.data.data))
        .catch((err) => console.error("Failed to load departments", err));
    }
  }, [isOpen, complaint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/complaints/${complaint._id}/reclassify`, formData);
      toast.success("Complaint updated & re-routed!");
      
      // TRIGGER REMOVAL FROM UI
      onUpdateSuccess(complaint._id); 
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    Review & Reclassify
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Department Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Department</label>
                    <select 
                        value={formData.departmentId}
                        onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                    <select 
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>

                {/* Audit Note */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Change (Audit Log)</label>
                    <textarea 
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="e.g. AI misclassified water leak as electrical issue..."
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 transition-all"
                    >
                        {loading ? "Updating..." : <><Save className="w-4 h-4" /> Update & Route</>}
                    </button>
                </div>
            </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;