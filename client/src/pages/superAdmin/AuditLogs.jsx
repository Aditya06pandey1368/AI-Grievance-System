import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { Table, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import api from "../../services/api"; // Ensure this is imported

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Logs from Backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get("/admin/logs");
        if (data.success) {
          setLogs(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">System Audit Logs</h1>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
          <Table>
            <TableHead>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Performed By</th>
              <th className="px-6 py-4">Target / Details</th>
              <th className="px-6 py-4">IP Address</th>
            </TableHead>
            <tbody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="5" className="text-center py-8">Loading logs...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="5" className="text-center py-8">No logs found.</TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log._id}>
                    <TableCell className="text-slate-500 text-xs font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.actor?.name || log.actor?.email || "System"}
                    </TableCell>
                    <TableCell className="text-slate-500 italic text-sm">
                      {log.details || `Target ID: ${log.targetId}`}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {log.ipAddress || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;