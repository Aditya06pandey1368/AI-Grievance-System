import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  MapPin, 
  ShieldCheck, 
  User
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const OfficerManagement = () => {
  const [formData, setFormData] = useState({ 
    name: "", email: "", password: "", zones: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        zones: formData.zones.split(',').map(z => z.trim())
        // departmentId is handled by backend (extracted from logged-in Admin)
      };
      
      await api.post("/admin/create-officer", payload);
      toast.success("Officer created successfully!");
      setFormData({ name: "", email: "", password: "", zones: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create officer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans overflow-hidden transition-colors">
      <Navbar />
      
      {/* Background Ambience Removed to fix color lines */}

      <div className="pt-28 px-4 max-w-6xl mx-auto pb-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* --- LEFT COLUMN: THE FORM --- */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Register Officer</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Create credentials for your field staff.</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Name Input */}
                    <div className="group">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Officer Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input 
                                type="text"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="e.g. Inspector Vijay"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="group">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Official Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input 
                                type="email"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="officer@gov.in"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="group">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Set Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input 
                                type="password"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Zones Input */}
                    <div className="group">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Assigned Zones</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input 
                                type="text"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Ward 1, Ward 2..."
                                value={formData.zones}
                                onChange={e => setFormData({...formData, zones: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <Button isLoading={loading} className="w-full h-12 text-lg mt-4 shadow-lg shadow-primary-500/30">
                        Create Officer Account
                    </Button>
                </form>
            </motion.div>

            {/* --- RIGHT COLUMN: 3D PREVIEW CARD --- */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-col items-center justify-center relative perspective-1000"
            >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live ID Preview</h2>
                    <p className="text-slate-500">Generating digital badge...</p>
                </div>

                {/* The 3D Card */}
                <motion.div 
                    whileHover={{ rotateY: 10, rotateX: 5 }}
                    className="w-96 h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-slate-700/50"
                >
                    {/* Card Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                    <div className="relative z-10 flex flex-col h-full items-center">
                         {/* Header */}
                         <div className="w-full flex justify-between items-center mb-8">
                             <ShieldCheck className="w-8 h-8 text-primary-400" />
                             <span className="text-xs font-mono opacity-60">GOVT AUTHORITY</span>
                         </div>

                         {/* Photo Placeholder */}
                         <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border-4 border-slate-800 shadow-xl flex items-center justify-center mb-6 relative">
                            <User className="w-16 h-16 text-slate-400" />
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-slate-800 rounded-full" />
                         </div>

                         {/* Live Data */}
                         <div className="text-center w-full space-y-2">
                             <h3 className="text-2xl font-bold tracking-tight">
                                {formData.name || "Officer Name"}
                             </h3>
                             <p className="text-primary-400 font-medium">
                                Departmental Officer
                             </p>
                             <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto my-4" />
                         </div>

                         {/* Details Grid */}
                         <div className="w-full grid grid-cols-2 gap-4 mt-auto">
                            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-[10px] uppercase text-slate-400 mb-1">Role</p>
                                <p className="text-sm font-semibold">Field Staff</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm overflow-hidden">
                                <p className="text-[10px] uppercase text-slate-400 mb-1">Official ID / Email</p>
                                <p className="text-xs font-semibold truncate" title={formData.email}>
                                    {formData.email || "officer@gov.in"}
                                </p>
                            </div>
                            <div className="col-span-2 bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-[10px] uppercase text-slate-400 mb-1">Assigned Zones</p>
                                <p className="text-sm font-semibold truncate">
                                    {formData.zones || "Unassigned"}
                                </p>
                            </div>
                         </div>
                    </div>
                </motion.div>

                {/* Floating Decor REMOVED (Purple circle and Blue rectangle deleted) */}
            </motion.div>

        </div>
      </div>
    </div>
  );
};

export default OfficerManagement;