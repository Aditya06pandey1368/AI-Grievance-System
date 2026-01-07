const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-green-100 text-green-700 border-green-200", // Resolved
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200", // Pending
    danger: "bg-red-100 text-red-700 border-red-200", // Rejected/Critical
    info: "bg-blue-100 text-blue-700 border-blue-200", // In Progress
  };

  return (
    <span className={`
      px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border
      ${variants[variant]} ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;