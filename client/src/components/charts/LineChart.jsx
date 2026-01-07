import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import useTheme from '../../hooks/useTheme';

const LineChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
            activeDot={{ r: 6 }} 
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;