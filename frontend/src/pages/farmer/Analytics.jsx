import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';
import { analyticsAPI } from '../../services/api';
import ProfitAnalyzer from '../../components/farmer/ProfitAnalyzer';

const COLORS = ['#2E7D32', '#FF9800', '#81C784', '#f87171'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((e) => (
        <p key={e.name} style={{ color: e.color }}>
          {e.name}: ₹{e.value?.toFixed(0)}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.get();
      setRecords(res.data.data?.analytics || []);
      setSummary(res.data.data?.summary || null);
    } catch {
      // silently fail; show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const barData = records.slice(0, 10).map((r) => ({
    name: `${r.month}/${r.year}`.length > 7 ? `${r.month}/${String(r.year).slice(-2)}` : `${r.month}/${r.year}`,
    Investment: r.totalInvestment,
    Revenue: r.actualRevenue,
    Profit: Math.max(r.profit, 0),
    Loss: r.isLoss ? Math.abs(r.profit) : 0,
  }));

  const pieData = summary
    ? [
        { name: 'Total Investment', value: summary.totalInvestment || 0 },
        { name: 'Total Revenue', value: summary.totalRevenue || 0 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your farm's financial performance</p>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Investment', value: `₹${(summary.totalInvestment || 0).toFixed(0)}`, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Revenue', value: `₹${(summary.totalRevenue || 0).toFixed(0)}`, color: 'text-primary', bg: 'bg-green-50' },
              { label: 'Net Profit', value: `₹${(summary.totalProfit || 0).toFixed(0)}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Total Loss', value: `₹${(summary.totalLoss || 0).toFixed(0)}`, color: 'text-red-500', bg: 'bg-red-50' },
            ].map(({ label, value, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`${bg} rounded-2xl p-4`}
              >
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-5 lg:col-span-2"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Investment vs Revenue (Monthly)</h3>
            {loading ? (
              <div className="h-60 flex items-center justify-center text-gray-300">Loading…</div>
            ) : barData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
                No records yet. Add your first analysis below.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Investment" fill="#93c5fd" radius={[4,4,0,0]} />
                  <Bar dataKey="Revenue" fill="#2E7D32" radius={[4,4,0,0]} />
                  <Bar dataKey="Profit" fill="#81C784" radius={[4,4,0,0]} />
                  <Bar dataKey="Loss" fill="#f87171" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Overall Split</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toFixed(0)}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Profit Analyzer form */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ProfitAnalyzer onSave={fetchData} />

          {/* Records Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-5"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Past Records</h3>
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No records yet</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {records.map((r) => (
                  <div
                    key={r._id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm ${
                      r.isLoss ? 'bg-red-50' : 'bg-green-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(0, r.month - 1).toLocaleString('default', { month: 'short' })} {r.year}
                      </p>
                      <p className="text-xs text-gray-500">
                        Inv: ₹{r.totalInvestment} · Rev: ₹{r.actualRevenue}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        r.isLoss ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {r.isLoss ? '−' : '+'}₹{Math.abs(r.profit).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
