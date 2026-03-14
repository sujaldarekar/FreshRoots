import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: ₹{entry.value}
        </p>
      ))}
    </div>
  );
};

const MarketPriceChart = ({ products = [] }) => {
  const data = products.slice(0, 8).map((p) => ({
    name: p.productName?.length > 10 ? p.productName.slice(0, 10) + '…' : p.productName,
    'Your Price': p.price,
    'Market Price': p.marketPrice || p.price,
    Suggested: p.marketPrice ? Math.round(p.marketPrice * 0.92) : p.price,
  }));

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
        No products found to compare prices.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-5"
    >
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Price Comparison (₹ per unit)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="25%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
          <Bar dataKey="Your Price" fill="#2E7D32" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Market Price" fill="#FF9800" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Suggested" fill="#81C784" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default MarketPriceChart;
