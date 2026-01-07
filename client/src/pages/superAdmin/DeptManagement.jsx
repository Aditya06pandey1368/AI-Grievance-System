import { useState } from "react";
import { Plus } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const DeptManagement = () => {
  const [formData, setFormData] = useState({ name: "", code: "", defaultSLAHours: 48 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/departments", formData);
      toast.success("Department Created!");
      setFormData({ name: "", code: "", defaultSLAHours: 48 });
    } catch (err) {
      toast.error("Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-24 px-4 max-w-lg mx-auto">
         <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
           <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create Department</h1>
           <form onSubmit={handleSubmit} className="space-y-4">
             <Input label="Dept Name" placeholder="e.g. Roads & Transport" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             <Input label="Dept Code" placeholder="e.g. RNT" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
             <Input label="Default SLA (Hours)" type="number" value={formData.defaultSLAHours} onChange={e => setFormData({...formData, defaultSLAHours: e.target.value})} />
             <Button className="w-full mt-4"><Plus className="w-4 h-4 mr-2"/> Add Department</Button>
           </form>
         </div>
      </div>
    </div>
  );
};

export default DeptManagement;