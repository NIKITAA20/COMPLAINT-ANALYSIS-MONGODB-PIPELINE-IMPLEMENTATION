import { useEffect, useState } from "react";
import { API } from "./api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";

const COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f1f5f9;
    --surface: #ffffff;
    --surface2: #f8fafc;
    --border: #e2e8f0;
    --text: #0f172a;
    --text2: #334155;
    --muted: #94a3b8;
    --accent: #6366f1;
    --accent2: #06b6d4;
    --green: #10b981;
    --yellow: #f59e0b;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.09);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .dashboard { max-width: 1600px; margin: 0 auto; padding: 1.75rem 1.5rem; }

  /* HEADER */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.25rem 1.75rem;
    margin-bottom: 1.25rem;
    box-shadow: var(--shadow-sm);
  }

  .header-left { display: flex; align-items: center; gap: 0.9rem; }

  .logo-badge {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }

  .header-title { font-size: clamp(1rem, 2.5vw, 1.25rem); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
  .header-sub   { font-size: 0.72rem; color: var(--muted); font-weight: 500; margin-top: 2px; }

  /* FILTER */
  .filter-wrapper { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }

  .filter-label {
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; color: var(--muted);
  }

  .filter-pills {
    display: flex; gap: 0.3rem;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 3px;
  }

  .pill {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem; font-weight: 600;
    padding: 0.28rem 0.85rem; border-radius: 7px;
    border: none; background: transparent; color: var(--muted);
    cursor: pointer; transition: all 0.15s ease;
  }

  .pill:hover { background: white; color: var(--text2); box-shadow: var(--shadow-sm); }
  .pill.active          { background: white; color: var(--accent);  box-shadow: var(--shadow-sm); }
  .pill.open.active     { color: var(--accent2); }
  .pill.pending.active  { color: var(--yellow); }
  .pill.resolved.active { color: var(--green); }

  /* SUMMARY CARDS */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
    gap: 1rem; margin-bottom: 1.25rem;
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.3rem 1.4rem 1.1rem;
    position: relative; overflow: hidden;
    box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, transform 0.2s;
  }
  .card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

  .card-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0; }
  .card-blob {
    position: absolute; width: 80px; height: 80px; border-radius: 50%;
    bottom: -20px; right: -20px; opacity: 0.08; pointer-events: none;
  }

  .card-label {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.09em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem;
  }
  .card-value {
    font-size: clamp(1.6rem, 3vw, 2.1rem); font-weight: 800;
    letter-spacing: -0.03em; line-height: 1; color: var(--text);
  }

  /* CHARTS */
  .charts-grid { display: grid; gap: 1rem; grid-template-columns: repeat(12, 1fr); }

  .chart-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.4rem 1.5rem;
    box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, transform 0.2s;
  }
  .chart-box:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }

  .chart-box.col-8  { grid-column: span 8; }
  .chart-box.col-4  { grid-column: span 4; }
  .chart-box.col-6  { grid-column: span 6; }
  .chart-box.col-12 { grid-column: span 12; }

  @media (max-width: 1100px) {
    .chart-box.col-8,
    .chart-box.col-4,
    .chart-box.col-6 { grid-column: span 12; }
  }
  @media (max-width: 640px) {
    .dashboard { padding: 1rem; }
    .header { padding: 1rem 1.2rem; }
    .summary-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .chart-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem;
  }
  .chart-title { font-size: 0.88rem; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
  .chart-badge {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted);
    background: var(--surface2); border: 1px solid var(--border);
    padding: 0.18rem 0.55rem; border-radius: 99px;
  }

  /* loading overlay */
  .chart-box.loading { opacity: 0.5; pointer-events: none; }

  .skeleton {
    background: linear-gradient(90deg, #e8edf5 25%, #f1f5f9 50%, #e8edf5 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const CARD_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
const TICK = { fill: '#94a3b8', fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 };
const GRID = '#f1f5f9';

/* ── helper: fetch all dashboard data with optional ?status= query ── */
const fetchAll = async (status = "") => {
  const q = status ? `?status=${status}` : "";
  const [cat, month, dash, city, last30, avg] = await Promise.all([
    API.get(`/category-stats${q}`),
    API.get(`/monthly-trend${q}`),
    API.get(`/dashboard-summary${q}`),
    API.get(`/city-volume${q}`),        // ✅ switched from /city-status
    API.get(`/last-30-days${q}`),
    API.get(`/avg-resolution`),         // resolution always from resolved docs
  ]);
  return {
    categoryData:  cat.data,
    monthlyData:   month.data,
    summary:       dash.data[0] ?? null,
    cityData:      city.data,
    last30Data:    last30.data,
    avgResolution: avg.data,
  };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
      padding: '9px 13px', fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4, fontWeight: 700, fontSize: '0.63rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontWeight: 700, color: p.color || '#6366f1' }}>
          {p.name}: <span style={{ color: '#0f172a' }}>{typeof p.value === 'number' ? p.value.toFixed(p.value % 1 ? 1 : 0) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

function StatCard({ title, value, colorIdx }) {
  const color = CARD_COLORS[colorIdx % CARD_COLORS.length];
  return (
    <div className="card">
      <div className="card-stripe" style={{ background: color }} />
      <div className="card-blob"   style={{ background: color }} />
      <div className="card-label">{title}</div>
      <div className="card-value">
        {value !== undefined && value !== null
          ? value
          : <span style={{ display: 'block', width: 90, height: 28 }} className="skeleton" />}
      </div>
    </div>
  );
}

function ChartBox({ title, badge, className, loading, children }) {
  return (
    <div className={`chart-box ${className}${loading ? ' loading' : ''}`}>
      <div className="chart-header">
        <div className="chart-title">{title}</div>
        {badge && <span className="chart-badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [data, setData]               = useState({ categoryData: [], monthlyData: [], summary: null, cityData: [], last30Data: [], avgResolution: [] });
  const [statusFilter, setStatusFilter] = useState("");
  const [filtering, setFiltering]     = useState(false);

  /* initial load */
  useEffect(() => {
    let cancelled = false;
    fetchAll().then(d => { if (!cancelled) setData(d); }).catch(console.error);
    return () => { cancelled = true; };
  }, []);

  /* filter — lowercase values match backend stored values */
  const filterByStatus = async (status) => {
    setStatusFilter(status);
    setFiltering(true);
    try {
      const d = await fetchAll(status);
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setFiltering(false);
    }
  };

  // ✅ lowercase values to match DB ("open" / "pending" / "resolved")
  const filters = [
    { label: 'All',      value: '',          cls: '' },
    { label: 'Open',     value: 'open',      cls: 'open' },
    { label: 'Pending',  value: 'pending',   cls: 'pending' },
    { label: 'Resolved', value: 'resolved',  cls: 'resolved' },
  ];

  const { categoryData, monthlyData, summary, cityData, last30Data, avgResolution } = data;

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">

        {/* HEADER */}
        <div className="header">
          <div className="header-left">
            <div className="logo-badge">📊</div>
            <div>
              <div className="header-title">Complaint Analytics</div>
              <div className="header-sub">Operations Intelligence Dashboard</div>
            </div>
          </div>
          <div className="filter-wrapper">
            <span className="filter-label">Status</span>
            <div className="filter-pills">
              {filters.map(f => (
                <button
                  key={f.value}
                  className={`pill ${f.cls} ${statusFilter === f.value ? 'active' : ''}`}
                  onClick={() => filterByStatus(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {summary && (
          <div className="summary-grid">
            {Object.entries(summary).map(([key, val], i) => (
              <StatCard key={key} title={key.replace(/_/g, ' ')} value={val} colorIdx={i} />
            ))}
          </div>
        )}

        {/* CHARTS */}
        <div className="charts-grid">

          {/* Category Bar — _id = category name, count = count */}
          <ChartBox title="Category Distribution" badge="By count" className="col-8" loading={filtering}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} barSize={30} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="_id" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

          {/* Pie — nameKey="_id" */}
          <ChartBox title="Category Share" badge="Proportion" className="col-4" loading={filtering}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="count" nameKey="_id"
                  cx="50%" cy="48%" innerRadius="50%" outerRadius="72%" paddingAngle={3}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7}
                  formatter={val => (
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{val}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>

          {/* Monthly — _id = month number, total = count */}
          <ChartBox title="Monthly Trend" badge="Complaints" className="col-6" loading={filtering}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="_id" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          {/* Last 30 Days — _id.day, total */}
          <ChartBox title="Last 30 Days" badge="Daily volume" className="col-6" loading={filtering}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last30Data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="_id.day" tick={{ ...TICK, fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: '#06b6d4', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          {/* City — /city-volume: _id = city name, count = count */}
          <ChartBox title="City Distribution" badge="By volume" className="col-6" loading={filtering}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData} layout="vertical" barSize={13} margin={{ top: 0, right: 4, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis dataKey="_id" type="category" tick={{ ...TICK, fill: '#64748b' }} axisLine={false} tickLine={false} width={78} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                  {cityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

          {/* Avg Resolution — _id = category, avgHours */}
          <ChartBox title="Avg Resolution Time" badge="Hours" className="col-6" loading={filtering}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={avgResolution} barSize={30} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="_id" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                <Bar dataKey="avgHours" radius={[5, 5, 0, 0]}>
                  {avgResolution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

        </div>
      </div>
    </>
  );
}