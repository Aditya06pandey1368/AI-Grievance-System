import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const ComplaintAction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    if (!remarks) return toast.error("Please add remarks first");
    
    // --- BUG 3 FIX: CONFIRMATION POPUP ---
    const isConfirmed = window.confirm(
        status === 'rejected' 
        ? "⚠️ Are you sure you want to REJECT this complaint?\n\nThis will decrease the citizen's Trust Score."
        : "✅ Are you sure you want to RESOLVE this complaint?"
    );

    if (!isConfirmed) return; 
    // -------------------------------------

    setLoading(true);
    try {
      await api.put(`/complaints/${id}/status`, { status, remarks });
      toast.success(`Complaint marked as ${status}`);
      navigate("/officer/dashboard");
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-32 px-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Take Action</h1>
          <p className="text-slate-500 mb-6">Complaint ID: {id}</p>
          
          <div className="mb-6">
            <Input 
              isTextarea 
              label="Resolution Remarks / Reason for Rejection" 
              placeholder="e.g., Pothole filled and leveled."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="danger" 
              isLoading={loading}
              onClick={() => handleAction('rejected')}
              className="w-full"
            >
              <XCircle className="w-5 h-5 mr-2" /> Reject / Spam
            </Button>
            <Button 
              isLoading={loading}
              onClick={() => handleAction('resolved')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5 mr-2" /> Mark Resolved
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintAction;