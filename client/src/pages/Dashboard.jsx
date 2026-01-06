import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
            <Navbar />
            <div className="pt-24 px-4 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Dashboard
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                        Hello, <span className="font-bold text-primary-500">{user?.name}</span>.
                        You are logged in as a <span className="capitalize">{user?.role}</span>.
                    </p>

                    <div className="flex gap-4">
                        <Link to="/submit-complaint">
                            <Button>Submit New Complaint</Button>
                        </Link>
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;