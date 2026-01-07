import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../../components/ui/Button";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-bg text-center px-4">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        You do not have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.
      </p>
      <Link to="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
};

export default Unauthorized;