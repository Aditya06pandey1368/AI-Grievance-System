import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { Table, TableHead, TableRow, TableCell } from "../../components/ui/Table";

// Mock Data for now as we didn't explicitly create a GET route for logs in the previous step
// In production, you would fetch from /api/admin/logs
const AuditLogs = () => {
  const logs = [
    { id: 1, action: "USER_LOGIN", actor: "Citizen John", details: "Login Successful", time: "2024-01-08 10:00" },
    { id: 2, action: "OFFICER_CREATED", actor: "Super Admin", details: "Created Officer ID 45", time: "2024-01-08 11:30" },
    { id: 3, action: "SLA_BREACH", actor: "System", details: "Complaint #1234 breached", time: "2024-01-08 14:00" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">System Audit Logs</h1>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHead>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Performed By</th>
              <th className="px-6 py-4">Details</th>
            </TableHead>
            <tbody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="text-slate-500 text-xs font-mono">{log.time}</TableCell>
                  <TableCell className="font-bold">{log.action}</TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell className="text-slate-500 italic">{log.details}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;