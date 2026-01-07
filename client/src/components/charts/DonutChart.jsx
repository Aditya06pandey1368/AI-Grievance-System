import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import useTheme from '../../hooks/useTheme';

const DonutChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Custom colors matching your theme (Primary, Green, Orange, Red)
  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#fff', 
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              color: isDark ? '#fff' : '#0f172a'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;