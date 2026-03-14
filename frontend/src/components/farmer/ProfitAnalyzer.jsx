import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../../services/api';

const ProfitAnalyzer = ({ onSave }) => {
  const [form, setForm] = useState({
    productionCost: '',
    transportationCost: '',
    laborCost: '',
    expectedRevenue: '',
    actualRevenue: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    productId: '',
  });
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculate = () => {
    const p = parseFloat(form.productionCost) || 0;
    const t = parseFloat(form.transportationCost) || 0;
    const l = parseFloat(form.laborCost) || 0;
    const totalInvestment = p + t + l;
    const actualRevenue = parseFloat(form.actualRevenue) || 0;
    const profit = actualRevenue - totalInvestment;
    const profitMargin = totalInvestment > 0 ? ((profit / totalInvestment) * 100).toFixed(1) : 0;
    setResult({ totalInvestment, actualRevenue, profit, profitMargin, isLoss: profit < 0 });
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await analyticsAPI.create({
        ...form,
        productionCost: parseFloat(form.productionCost) || 0,
        transportationCost: parseFloat(form.transportationCost) || 0,
        laborCost: parseFloat(form.laborCost) || 0,
        expectedRevenue: parseFloat(form.expectedRevenue) || 0,
        actualRevenue: parseFloat(form.actualRevenue) || 0,
      });
      toast.success('Analytics saved!');
      onSave?.();
      setResult(null);
      setForm({
        productionCost: '', transportationCost: '', laborCost: '',
        expectedRevenue: '', actualRevenue: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        productId: '',
      });
    } catch {
      toast.error('Failed to save analytics');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 space-y-5">
      <h3 className="text-base font-semibold text-gray-800">Profit / Loss Analyzer</h3>

      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'productionCost', label: 'Production Cost (₹)' },
          { name: 'transportationCost', label: 'Transportation Cost (₹)' },
          { name: 'laborCost', label: 'Labour Cost (₹)' },
          { name: 'expectedRevenue', label: 'Expected Revenue (₹)' },
          { name: 'actualRevenue', label: 'Actual Revenue (₹)' },
        ].map(({ name, label }) => (
          <div key={name} className={name === 'actualRevenue' ? 'col-span-2' : ''}>
            <label className="form-label">{label}</label>
            <input
              type="number"
              name={name}
              value={form[name]}
              onChange={handleChange}
              min="0"
              className="input-field"
              placeholder="0"
            />
          </div>
        ))}

        <div>
          <label className="form-label">Month</label>
          <select name="month" value={form.month} onChange={handleChange} className="input-field">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Year</label>
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handleChange}
            className="input-field"
            min="2020"
            max="2100"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="btn-primary w-full"
      >
        Calculate
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl p-4 border-2 ${
              result.isLoss
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-primary'
            }`}
          >
            <p className={`text-lg font-bold mb-2 ${result.isLoss ? 'text-red-600' : 'text-primary'}`}>
              {result.isLoss ? '⚠ Loss Detected' : '✅ Profitable'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-lg p-2.5 text-center">
                <p className="text-gray-500 text-xs">Total Investment</p>
                <p className="font-bold text-gray-800">₹{result.totalInvestment.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 text-center">
                <p className="text-gray-500 text-xs">Actual Revenue</p>
                <p className="font-bold text-gray-800">₹{result.actualRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 text-center">
                <p className="text-gray-500 text-xs">{result.isLoss ? 'Loss' : 'Profit'}</p>
                <p className={`font-bold ${result.isLoss ? 'text-red-600' : 'text-primary'}`}>
                  ₹{Math.abs(result.profit).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2.5 text-center">
                <p className="text-gray-500 text-xs">Margin</p>
                <p className={`font-bold ${result.isLoss ? 'text-red-600' : 'text-primary'}`}>
                  {result.profitMargin}%
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full mt-3 text-sm"
            >
              {saving ? 'Saving…' : 'Save Record'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfitAnalyzer;
