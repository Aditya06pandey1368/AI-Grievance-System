import { useState, useEffect } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const DeptManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    code: "", 
    defaultSLAHours: 48 
  });
  const [loading, setLoading] = useState(false);

  // 1. Fetch Departments on Load
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (error) {
      console.error("Failed to load departments");
    }
  };

  // 2. Handle Create Department
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/departments", formData);
      toast.success("Department created successfully!");
      setFormData({ name: "", code: "", defaultSLAHours: 48 }); // Reset Form
      fetchDepartments(); // Refresh List
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <div className="pt-24 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: CREATE FORM --- */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-500"/> Add Department
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Department Name" 
                placeholder="e.g. Roads & Highways" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              
              <Input 
                label="Department Code (Unique)" 
                placeholder="e.g. DEPT_ROADS" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              />
              
              <Input 
                label="Default SLA (Hours)" 
                type="number" 
                value={formData.defaultSLAHours} 
                onChange={e => setFormData({...formData, defaultSLAHours: e.target.value})} 
              />

              <Button isLoading={loading} className="w-full mt-2">
                Create Department
              </Button>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: EXISTING LIST --- */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500"/> Existing Departments
            </h2>

            {departments.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                No departments found. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-500 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{dept.name}</h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex gap-4 mt-1">
                        <span className="bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                          ID: {dept._id}
                        </span>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-bold">
                          {dept.code}
                        </span>
                      </div>
                    </div>
                    
                    {/* Only show delete if you implement delete API later */}
                    <div className="text-slate-400 text-sm">
                      {dept.defaultSLAHours}h SLA
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeptManagement;