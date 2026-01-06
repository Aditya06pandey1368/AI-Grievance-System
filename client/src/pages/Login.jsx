import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, ArrowRight } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Navbar from "../components/layout/Navbar";
import { toast } from "react-hot-toast"; // Import Toast
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Call the REAL backend
    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success("Welcome back, Citizen!");
      navigate("/dashboard"); // Redirect to Dashboard
    } else {
      toast.error(result.message); // Show Error Popup
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />

      <div className="pt-24 pb-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative overflow-hidden">
        
        {/* Background Blobs (for that modern 3D feel) */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse-slow" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Access your grievance dashboard
            </p>
          </div>

          <Card className="shadow-2xl border-t-4 border-t-primary-500">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <Input
                label="Email Address"
                type="email"
                placeholder="citizen@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <Button isLoading={isLoading} className="w-full text-lg">
                Sign In <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold hover:underline">
                  Create one now
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;