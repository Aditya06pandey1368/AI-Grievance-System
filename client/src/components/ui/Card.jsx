import { motion } from "framer-motion";

const Card = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5 }}
      className={`glass p-6 rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;