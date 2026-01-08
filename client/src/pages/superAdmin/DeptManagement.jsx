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
    name: "", code: "", defaultSLAHours: 48,
    adminName: "", adminEmail: "", adminPassword: "" // New Fields
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
      toast.success("Department & Admin created!");
      // Reset all fields
      setFormData({ name: "", code: "", defaultSLAHours: 48, adminName: "", adminEmail: "", adminPassword: "" });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
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
              <Plus className="w-5 h-5 text-primary-500" /> Add Department
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">Department Details</h3>
              <Input label="Dept Name" placeholder="e.g. Fire Safety" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <Input label="Dept Code" placeholder="e.g. DEPT_FIRE" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
              <Input label="SLA (Hours)" type="number" value={formData.defaultSLAHours} onChange={e => setFormData({ ...formData, defaultSLAHours: e.target.value })} />

              <h3 className="font-semibold text-slate-700 dark:text-slate-300 border-b pb-2 pt-2">Assign Admin</h3>
              <Input label="Admin Name" placeholder="e.g. Chief Fire Officer" value={formData.adminName} onChange={e => setFormData({ ...formData, adminName: e.target.value })} />
              <Input label="Admin Email" type="email" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
              <Input label="Password" type="password" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} />

              <Button isLoading={loading} className="w-full mt-4">Create Department & Admin</Button>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: EXISTING LIST --- */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" /> Existing Departments
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