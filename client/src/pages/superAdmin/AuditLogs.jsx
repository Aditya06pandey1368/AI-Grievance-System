import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. Fetch & Group Logs ---
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get("/admin/logs");
        if (data.success) {
          setLogs(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // --- 2. Helper: Group Logs by Date ---
  const groupLogsByDate = (logs) => {
    const groups = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString(undefined, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  };

  // --- 3. Filter Logic ---
  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedLogs = groupLogsByDate(filteredLogs);

  // --- 4. Action Icon & Color Helper ---
  const getActionStyle = (action) => {
    if (action.includes("CREATE")) return { icon: <CheckCircle className="w-4 h-4"/>, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" };
    if (action.includes("DELETE") || action.includes("BAN")) return { icon: <XCircle className="w-4 h-4"/>, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" };
    if (action.includes("UPDATE") || action.includes("STATUS")) return { icon: <Activity className="w-4 h-4"/>, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" };
    if (action.includes("WARNING") || action.includes("FLAG")) return { icon: <AlertTriangle className="w-4 h-4"/>, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" };
    return { icon: <Shield className="w-4 h-4"/>, color: "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600" };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans text-slate-900 dark:text-slate-100">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-5xl mx-auto pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary-500" />
              System Audit Trail
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Chronological record of all administrative actions and security events.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="animate-spin w-10 h-10 border-4 border-slate-300 border-t-primary-500 rounded-full mb-4"></div>
            <p>Syncing Logs...</p>
          </div>
        )}

        {/* LOGS TIMELINE */}
        {!loading && Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-400 font-medium">No activity recorded found.</p>
          </div>
        ) : (
          <div className="space-y-10 relative">
            {/* Vertical Line Connector */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 z-0 hidden md:block"></div>

            {Object.keys(groupedLogs).map((date, dateIndex) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
                key={date} 
                className="relative z-10"
              >
                {/* DATE HEADER sticky */}
                <div className="sticky top-20 z-20 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                    <Calendar className="w-4 h-4" />
                    {date}
                  </span>
                </div>

                {/* LOG ENTRIES CARD GROUP */}
                <div className="space-y-3 pl-2 md:pl-10">
                  {groupedLogs[date].map((log) => {
                    const style = getActionStyle(log.action);
                    
                    return (
                      <div 
                        key={log._id} 
                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col md:flex-row gap-4 items-start relative overflow-hidden"
                      >
                        {/* Tiny Indicator Dot on Timeline */}
                        <div className="absolute -left-[27px] top-6 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-slate-400 hidden md:block z-10 group-hover:scale-125 group-hover:bg-primary-500 transition-all"></div>

                        {/* Action Icon Box */}
                        <div className={`p-3 rounded-lg border ${style.color} shrink-0`}>
                          {style.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                              {log.action}
                            </h4>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            {log.details}
                          </p>

                          {/* Footer: Actor & IP */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600">
                                {log.actor?.name ? log.actor.name.charAt(0) : <User className="w-3 h-3"/>}
                              </div>
                              <span className="font-medium text-slate-500 dark:text-slate-300">
                                {`${log.actor?.name} (${log.actor?._id})` || "System/Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;