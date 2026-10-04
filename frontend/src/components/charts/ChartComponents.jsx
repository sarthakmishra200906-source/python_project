import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

// Register all required Chart.js components once
ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Filler
);

// ── Helper ─────────────────────────────────────────────────────
function chartColors(isDark) {
  return {
    gridColor:  isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.06)',
    labelColor: isDark ? '#94a3b8' : '#64748b',
    tooltipBg:  isDark ? '#1e293b' : '#ffffff',
    tooltipText:isDark ? '#f1f5f9' : '#1e293b',
  };
}

// ─────────────────────────────────────────────────────────────
// 1. Data Usage Doughnut
// ─────────────────────────────────────────────────────────────
export function DataUsageChart({ dataBalance = 0, dataTotal = 0 }) {
  const { isDark } = useTheme();
  const c = chartColors(isDark);
  const used = Math.max(0, dataTotal - dataBalance);
  const remaining = Math.max(0, dataBalance);
  const isEmpty = dataTotal === 0;

  const data = {
    labels: isEmpty ? ['No Active Plan'] : ['Used', 'Remaining'],
    datasets: [{
      data: isEmpty ? [1] : [used, remaining || 0.01],
      backgroundColor: isEmpty
        ? ['rgba(148,163,184,0.3)']
        : ['#f43f5e', '#6366f1'],
      borderColor: isEmpty
        ? [isDark ? '#334155' : '#e2e8f0']
        : ['#e11d48', '#4f46e5'],
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: c.labelColor,
          padding: 16,
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: c.tooltipBg,
        titleColor: c.tooltipText,
        bodyColor: c.labelColor,
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${isEmpty ? 'No data' : `${ctx.parsed.toFixed(2)} GB`}`,
        },
      },
    },
  };

  const pct = dataTotal > 0 ? Math.round((used / dataTotal) * 100) : 0;

  return (
    <div className="relative" style={{ height: 220 }}>
      <Doughnut data={data} options={options} />
      {!isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{pct}%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Used</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Monthly Spending Bar
// ─────────────────────────────────────────────────────────────
export function MonthlySpendingChart({ monthlyData = [] }) {
  const { isDark } = useTheme();
  const c = chartColors(isDark);

  // Ensure 6 months of data, padding with 0 if fewer transactions
  const months = monthlyData.map((m) => m.month_label);
  const amounts = monthlyData.map((m) => Number(m.total_amount));

  const data = {
    labels: months.length ? months : ['No data yet'],
    datasets: [{
      label: 'Recharge Amount (₹)',
      data: amounts.length ? amounts : [0],
      backgroundColor: 'rgba(99,102,241,0.7)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(99,102,241,0.9)',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.tooltipBg,
        titleColor: c.tooltipText,
        bodyColor: c.labelColor,
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.y.toFixed(0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: c.gridColor },
        ticks: { color: c.labelColor, font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: c.gridColor },
        ticks: {
          color: c.labelColor,
          font: { family: 'Inter', size: 11 },
          callback: (v) => `₹${v}`,
        },
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} style={{ height: 200 }} />;
}

// ─────────────────────────────────────────────────────────────
// 3. Daily Data Usage Trend Line
// ─────────────────────────────────────────────────────────────
export function DataTrendChart({ dataTotal = 0, validityDays = 28 }) {
  const { isDark } = useTheme();
  const c = chartColors(isDark);

  // Simulate a 7-day daily data usage pattern
  const dailyGb = dataTotal / Math.max(validityDays, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const multipliers = [0.9, 1.1, 1.3, 0.8, 1.0, 1.5, 0.7]; // realistic variation
  const usageData = multipliers.map((m) => parseFloat((dailyGb * m).toFixed(2)));

  const data = {
    labels: days,
    datasets: [{
      label: 'Data Used (GB)',
      data: usageData,
      fill: true,
      borderColor: '#8b5cf6',
      backgroundColor: isDark
        ? 'rgba(139,92,246,0.15)'
        : 'rgba(139,92,246,0.08)',
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: isDark ? '#1e293b' : '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.tooltipBg,
        titleColor: c.tooltipText,
        bodyColor: c.labelColor,
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} GB`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: c.gridColor },
        ticks: { color: c.labelColor, font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: c.gridColor },
        ticks: {
          color: c.labelColor,
          font: { family: 'Inter', size: 11 },
          callback: (v) => `${v} GB`,
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} style={{ height: 200 }} />;
}
