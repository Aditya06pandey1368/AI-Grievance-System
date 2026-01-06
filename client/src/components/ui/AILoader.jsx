import { motion } from "framer-motion";

const AILoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-transparent border-t-primary-500 border-r-purple-500 rounded-full"
        />
        {/* Inner Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-2 bg-gradient-to-tr from-primary-500/20 to-purple-500/20 rounded-full blur-md"
        />
        {/* Center Brain Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🤖
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
        AI is analyzing your complaint...
      </p>
    </div>
  );
};

export default AILoader;