import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api"; // Direct API call for registration
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Navbar from "../components/layout/Navbar";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/register', formData);
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      <div className="pt-24 pb-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Join the Revolution</h1>
            <p className="text-slate-500">Create your citizen account today</p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
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
              <Button isLoading={isLoading} className="w-full mt-2">
                Create Account <UserPlus className="w-5 h-5 ml-2" />
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-primary-500 font-bold hover:underline">Sign In</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;