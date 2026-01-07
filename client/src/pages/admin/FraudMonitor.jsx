import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { Table, TableHead, TableRow, TableCell } from "../../components/ui/Table";

const FraudMonitor = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Requires the /admin/users endpoint
    api.get("/admin/users").then(res => {
      const all = res.data.data || [];
      // Filter users with low trust score
      setUsers(all.filter(u => u.trustScore < 50));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <ShieldAlert className="text-orange-500" /> Fraud Monitor
        </h1>
        <p className="text-slate-500 mb-8">Users with low trust scores flagged for potential abuse.</p>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHead>
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Trust Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </TableHead>
            <tbody>
              {users.map(u => (
                <TableRow key={u._id}>
                  <TableCell className="font-bold">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold text-xs">
                      {u.trustScore}/100
                    </span>
                  </TableCell>
                  <TableCell>{u.isActive ? "Active" : "Banned"}</TableCell>
                  <TableCell className="text-right">
                    <button className="text-red-500 hover:underline text-sm font-bold">Ban User</button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FraudMonitor;