import { motion } from "framer-motion";

const Card = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;