import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Calendar, User } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

const ComplaintDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/complaints/${id}`).then(res => setData(res.data.data)); // Assumes you have a get-by-id route
  }, [id]);

  if (!data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="pt-24 px-4 max-w-4xl mx-auto pb-12">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{data.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
               <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(data.createdAt).toLocaleDateString()}</span>
               <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {data.location}</span>
            </div>
          </div>
          <Badge variant="info" className="text-lg px-4 py-2">{data.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Description</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{data.description}</p>
            </Card>

            {/* Evidence Image */}
            {data.images?.length > 0 && (
              <Card>
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Evidence</h3>
                <div className="grid grid-cols-2 gap-4">
                  {data.images.map((img, i) => (
                    <img key={i} src={`http://localhost:5000${img}`} className="rounded-xl w-full h-48 object-cover border dark:border-slate-700" alt="evidence" />
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             <Card>
               <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Assigned Officer</h3>
               {data.assignedOfficer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Officer ID: {data.assignedOfficer.toString().slice(-4)}</p>
                      <p className="text-xs text-slate-500">Zone: {data.zone}</p>
                    </div>
                  </div>
               ) : (
                 <p className="text-slate-500 italic">Pending assignment...</p>
               )}
             </Card>

             <Card>
               <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Timeline</h3>
               <div className="space-y-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4 ml-1">
                 {data.history?.map((h, i) => (
                   <div key={i} className="relative">
                     <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary-500 border-2 border-white dark:border-slate-900" />
                     <p className="text-sm font-bold text-slate-800 dark:text-white">{h.action}</p>
                     <p className="text-xs text-slate-500">{new Date(h.timestamp).toLocaleString()}</p>
                     {h.remarks && <p className="text-xs text-slate-500 italic mt-1">"{h.remarks}"</p>}
                   </div>
                 ))}
               </div>
             </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;