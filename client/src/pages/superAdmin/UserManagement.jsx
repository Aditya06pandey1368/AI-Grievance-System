import { useState, useEffect } from "react";
import { Users, Trash2, AlertTriangle } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Delete Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      
      if(data.success) {
        // Robust Filtering for 'admin' role (case-insensitive)
        const adminsOnly = data.data.filter(user => 
            user.role && 
            user.role.toLowerCase() === 'dept_admin'
        );
        setUsers(adminsOnly);
      }
    } catch (error) {
      console.error("Failed to load users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Open Delete Modal
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // 3. Perform Delete Action
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/admin/users/${userToDelete._id}`);
      toast.success("Admin deleted successfully");
      
      // Update UI immediately
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300 font-sans">
      <Navbar />

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-500" /> 
              Admin Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 ml-11">
              Manage department administrators and their access.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                {users.length}
             </div>
             <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Admins</p>
                <p className="text-xs text-slate-400">System Wide</p>
             </div>
          </div>
        </div>

        {/* --- USERS LIST (Styled like DeptManagement) --- */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Registered Admins
          </h2>

          {loading ? (
             <div className="text-center py-12 text-slate-500">Loading admins...</div>
          ) : users.length === 0 ? (
             <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
               <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
               <p>No admins found. Create a department to add an admin.</p>
             </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-500 transition-colors group">
                  
                  {/* Left Side: User Info */}
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{user.name}</h3>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex gap-2 items-center mt-0.5">
                          <span>{user.email}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                            {user.role}
                          </span>
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block text-slate-400 text-xs text-right">
                       <p>Joined</p>
                       <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <button 
                      onClick={() => confirmDelete(user)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete Admin"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 scale-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Admin?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{userToDelete?.name}</span>? 
              <br/>
              This will remove their access and unassign them from their Department.
            </p>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition shadow-lg shadow-red-500/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;