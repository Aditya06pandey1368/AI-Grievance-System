export const Table = ({ children }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
    <tr>{children}</tr>
  </thead>
);

export const TableRow = ({ children, className }) => (
  <tr className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${className}`}>
    {children}
  </tr>
);

export const TableCell = ({ children, className }) => (
  <td className={`px-6 py-4 ${className}`}>
    {children}
  </td>
);