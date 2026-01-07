import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-bg text-center px-4">
      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-orange-600 dark:text-orange-500" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;