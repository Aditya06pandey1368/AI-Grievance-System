import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { Table, TableHead, TableRow, TableCell } from "../../components/ui/Table"; // Use the Table component I gave earlier

const SLATracker = () => {
  const [breaches, setBreaches] = useState([]);

  useEffect(() => {
    // This is a mock filter. In real app, create a specific endpoint like /complaints/breached
    api.get("/complaints/admin/all").then(res => {
      const all = res.data.data || [];
      setBreaches(all.filter(c => c.isBreached || c.priorityLevel === 'Critical'));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle /> SLA Breaches & Critical Issues
        </h1>
        <p className="text-slate-500 mb-8">Complaints that have exceeded their resolution deadline.</p>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHead>
              <th className="px-6 py-4">Complaint ID</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4 text-right">Delay</th>
            </TableHead>
            <tbody>
              {breaches.map(c => (
                <TableRow key={c._id}>
                  <TableCell className="font-mono text-xs">{c._id.slice(-6)}</TableCell>
                  <TableCell className="font-bold">{c.title}</TableCell>
                  <TableCell className="text-red-500">{new Date(c.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{c.assignedOfficer || "Unassigned"}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">OVERDUE</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SLATracker;