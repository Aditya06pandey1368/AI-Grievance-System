import { motion } from "framer-motion";

const Input = ({ label, error, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <motion.input
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-card 
            border-2 transition-all outline-none
            ${error 
              ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
            }
            text-slate-900 dark:text-white placeholder-slate-400
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-red-500 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;