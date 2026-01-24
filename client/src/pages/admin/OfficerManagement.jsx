import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, Lock, MapPin, ShieldCheck, User, Phone, BadgeCheck } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const OfficerManagement = () => {
  const [formData, setFormData] = useState({ 
    name: "", email: "", password: "", mobile: "", zones: "" 
  });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation
  const isFormValid = 
    formData.name.trim() !== "" && 
    formData.email.trim() !== "" && 
    formData.password.trim() !== "" && 
    formData.zones.trim() !== "" &&
    /^\d{10}$/.test(formData.mobile);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
        if (!/^\d{10}$/.test(formData.mobile)) return toast.error("Mobile Number must be exactly 10 digits");
        return toast.error("Please fill all fields correctly");
    }
    setShowConfirm(true);
  };

  const createOfficer = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const payload = {
        ...formData,
        zones: formData.zones.split(',').map(z => z.trim())
      };
      
      await api.post("/admin/create-officer", payload);
      toast.success("Officer created successfully!");
      setFormData({ name: "", email: "", password: "", mobile: "", zones: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create officer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans overflow-hidden transition-colors relative">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-8 text-center bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-indigo-50 dark:border-slate-700">
                            <BadgeCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Authorize Officer?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm px-2">
                            Creating access for <strong>{formData.name}</strong> with Mobile: <strong>{formData.mobile}</strong>.
                        </p>
                        
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={createOfficer} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all">Confirm</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-28 px-4 max-w-7xl mx-auto pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT: FORM */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Register Officer</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Create secure credentials for field staff.</p>
                    </div>
                </div>
                
                <form onSubmit={handlePreSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input type="text" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-semibold" placeholder="e.g. Inspector Vijay" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>

                    {/* Email & Mobile Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input type="email" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-semibold" placeholder="officer@gov.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Mobile (10 Digits)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input 
                                    type="text" 
                                    maxLength="10"
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-2 rounded-xl focus:ring-0 outline-none transition-all font-semibold ${
                                        formData.mobile.length > 0 && !/^\d{10}$/.test(formData.mobile) 
                                        ? 'border-red-300 focus:border-red-500 text-red-500' 
                                        : 'border-slate-100 dark:border-slate-700 focus:border-indigo-500'
                                    }`} 
                                    placeholder="9876543210" 
                                    value={formData.mobile} 
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, ''); 
                                        setFormData({...formData, mobile: val});
                                    }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input type="password" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-semibold" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>

                    {/* Zones */}
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Jurisdiction Zones</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input type="text" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-semibold" placeholder="Sector 1, Ward 2 (Comma Separated)" value={formData.zones} onChange={e => setFormData({...formData, zones: e.target.value})} />
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!isFormValid || loading}
                        className={`w-full py-4 text-lg font-bold rounded-xl mt-4 shadow-xl shadow-indigo-500/30 transition-all ${
                            !isFormValid 
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:to-blue-700'
                        }`}
                    >
                        {loading ? "Generating Credentials..." : "Create Officer Account"}
                    </motion.button>
                </form>
            </motion.div>

            {/* RIGHT: 3D ID CARD PREVIEW */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="hidden lg:flex flex-col items-center justify-center perspective-1000">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Live ID Preview</h2>
                    <p className="text-slate-500 font-medium mt-1">Real-time digital badge generation.</p>
                </div>

                <motion.div 
                    whileHover={{ rotateY: 5, rotateX: 5 }} 
                    className="w-96 h-[520px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-700/50 flex flex-col"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full items-center">
                         <div className="w-full flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                             <div className="flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                                <span className="text-xs font-bold tracking-widest text-indigo-200">OFFICIAL ID</span>
                             </div>
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                         </div>

                         <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-slate-700 to-slate-600 border-4 border-slate-700/50 shadow-inner flex items-center justify-center mb-6 relative">
                            <User className="w-12 h-12 text-slate-400" />
                         </div>

                         <div className="text-center w-full space-y-1 mb-2">
                             <h3 className="text-2xl font-black tracking-tight leading-tight line-clamp-1">{formData.name || "Officer Name"}</h3>
                             <p className="text-indigo-300 text-sm font-bold uppercase tracking-wide">Field Officer</p>
                         </div>

                         <div className="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent my-6 opacity-50" />

                         <div className="w-full space-y-3 mt-auto">
                            <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-md border border-white/5 flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg"><Phone className="w-4 h-4 text-white" /></div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold">Contact</p>
                                    <p className="text-sm font-mono tracking-wide">{formData.mobile || "+91 XXXXX XXXXX"}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-md border border-white/5 flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg"><MapPin className="w-4 h-4 text-white" /></div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold">Zone Assignment</p>
                                    <p className="text-xs font-medium truncate w-40">{formData.zones || "Unassigned"}</p>
                                </div>
                            </div>
                         </div>
                    </div>
                </motion.div>
            </motion.div>

        </div>
      </div>
    </div>
  );
};

export default OfficerManagement;