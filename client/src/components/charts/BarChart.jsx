import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import useTheme from '../../hooks/useTheme';

const BarChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? '#94a3b8' : '#64748b'} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke={isDark ? '#94a3b8' : '#64748b'} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#fff', 
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              color: isDark ? '#fff' : '#0f172a'
            }}
            cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }}
          />
          <Bar 
            dataKey="value" 
            fill="#8b5cf6" 
            radius={[4, 4, 0, 0]} 
            barSize={30}
          />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;