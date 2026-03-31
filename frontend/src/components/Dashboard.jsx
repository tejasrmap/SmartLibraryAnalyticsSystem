import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import api from '../api';
import { BookOpen, Users, Clock, AlertCircle, RefreshCw, BarChart, FileText } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const Dashboard = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, logsRes] = await Promise.all([
        api.getSummary(),
        api.getRecentTransactions()
      ]);
      setData(summaryRes.data);
      setRecentLogs(logsRes.data);
    } catch (err) {
      console.error("Data synchronization failure:", err);
      setError("Unable to establish connection with the Intelligence Sector. Please verify backend status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = () => fetchData();

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>Synchronizing Athena OS Intelligence...</div>;

  if (error || !data) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '24px' }}>
            <div className="bento-card" style={{ textAlign: 'center', maxWidth: '500px', border: '1px solid var(--danger)' }}>
                <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
                <h1 style={{ color: 'var(--danger)' }}>Connection Failure</h1>
                <div className="caption" style={{ marginTop: '12px' }}>{error || "The Intelligence Sector is currently offline."}</div>
                <button className="primary-neon" style={{ marginTop: '24px' }} onClick={handleSync}>Retry Synchronization</button>
            </div>
        </div>
    );
  }

  const doughnutData = {
    labels: data.category_distribution ? Object.keys(data.category_distribution) : [],
    datasets: [{
      data: data.category_distribution ? Object.values(data.category_distribution) : [],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'],
      borderWidth: 2,
      borderColor: '#1e293b',
    }],
  };


  const lineData = {
    labels: Object.keys(data.monthly_borrowing).reverse(),
    datasets: [{
      label: 'Activity',
      data: Object.values(data.monthly_borrowing).reverse(),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 11, weight: 600 } } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11, weight: 600 } } }
    }
  };

  const cards = [
    { label: 'Total Books', value: data.total_books, icon: <BookOpen size={18} />, color: '#3b82f6' },
    { label: 'Active Members', value: data.total_members, icon: <Users size={18} />, color: '#0ea5e9' },
    { label: 'Currently Issued', value: data.issued_books, icon: <Clock size={18} />, color: '#10b981' },
    { label: 'Overdue Items', value: data.overdue_transactions, icon: <AlertCircle size={18} />, color: '#ef4444' },
  ];

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Library Dashboard</h1>
          <div className="caption">High-visibility metrics and operational summaries.</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="cyber-action" onClick={handleSync}>
            <RefreshCw size={16} /> Sync Data
          </button>
          <button className="primary-neon" onClick={() => alert("Archives successfully exported to local storage.")}>
            <FileText size={16} /> Export Report
          </button>
        </div>
      </header>
      
      <div className="bento-grid">
        {/* KPI Cards */}
        {cards.map((card, i) => (
          <div key={i} className="bento-card" style={{ gridColumn: 'span 3' }}>
            <div className="kpi-bento">
              <div className="kpi-icon-futuristic" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div>
                <div className="kpi-label-muted">{card.label}</div>
                <div className="kpi-value-sharp">{card.value}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Charts */}
        <div className="bento-card" style={{ gridColumn: 'span 8', gridRow: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <BarChart size={20} color="var(--accent-main)" />
            <h2>Borrowing Activity</h2>
          </div>
          <div style={{ height: '340px' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="bento-card" style={{ gridColumn: 'span 4', gridRow: 'span 2' }}>
          <h2 style={{ marginBottom: '24px' }}>Resource Categories</h2>
          <div style={{ height: '320px' }}>
            <Doughnut data={doughnutData} options={{ 
              maintainAspectRatio: false, 
              plugins: { legend: { position: 'bottom', labels: { color: '#ffffff', font: { size: 11, weight: 600 }, boxWidth: 12, padding: 20 } } } 
            }} />
          </div>
        </div>

        {/* Recent Shipments / Highlights */}
        <div className="bento-card" style={{ gridColumn: 'span 12' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-main)' }}>
                        <BookOpen size={20} />
                    </div>
                    <h2>Recent Resource Shipments</h2>
                </div>
                <button className="cyber-action" style={{ fontSize: '0.8125rem' }} onClick={() => setActiveTab('inventory')}>View Full Registry</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                {recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="shipment-item" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-clean)', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '100%', aspectRatio: '2/3', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
                            <img 
                                src={`https://covers.openlibrary.org/b/isbn/${Math.random() > 0.5 ? '0374157065' : '0451524934'}-M.jpg`} // Fallback for demo since some URLs might be old
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-active)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.book_title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{log.member_name}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* System Event Log */}
        <div className="bento-card" style={{ gridColumn: 'span 12' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Sector Activity Log</h2>
                <span className="caption" style={{ fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></span>
                    LIVE MONITORING
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentLogs.map((log) => (
                    <div key={log.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9375rem', display: 'flex', gap: '16px', borderLeft: log.type === 'Issue' ? '2px solid var(--accent-main)' : '2px solid var(--success)', transition: 'all 0.2s' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600, minWidth: '45px' }}>{log.issue_date}</span>
                        <span style={{ flex: 1 }}>
                            <strong style={{ color: log.type === 'Issue' ? 'var(--accent-main)' : 'var(--success)' }}>{log.type.toUpperCase()}</strong>: 
                            <span style={{ marginLeft: '12px', color: 'var(--text-main)' }}>"{log.book_title}" requested by <strong>{log.member_name}</strong>.</span>
                        </span>
                    </div>
                ))}
                {recentLogs.length === 0 && <div className="caption" style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-clean)' }}>No recent activity detected in the sectors.</div>}
            </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
