import { useState } from "react";
import { UserPlus } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const OfficerManagement = () => {
  const [formData, setFormData] = useState({ 
    name: "", email: "", password: "", departmentId: "", zones: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert zones string "Ward-1, Ward-2" to array
      const payload = {
        ...formData,
        zones: formData.zones.split(',').map(z => z.trim())
      };
      await api.post("/admin/create-officer", payload);
      toast.success("Officer created successfully!");
      setFormData({ name: "", email: "", password: "", departmentId: "", zones: "" });
    } catch (error) {
      toast.error("Failed to create officer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-24 px-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary-500"/> Add New Officer
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Officer Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            {/* Note: In a real app, Department ID would be auto-filled or a dropdown */}
            <Input label="Department ID" placeholder="Paste Dept ID here" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} />
            
            <Input label="Zones (Comma separated)" placeholder="Ward-1, Sector-62" value={formData.zones} onChange={e => setFormData({...formData, zones: e.target.value})} />
            
            <Button isLoading={loading} className="w-full mt-4">Create Officer Account</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfficerManagement;