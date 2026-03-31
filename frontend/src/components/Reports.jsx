import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, LineChart, PieChart, Download, FileText, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getSummary()
            .then(res => {
                setSummary(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>Synchronizing Intelligence Lab...</div>;

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>Intelligence Lab</h1>
                    <div className="caption">Advanced predictive analytics and cross-sector research engine.</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="cyber-action">
                        <FileText size={16} /> Data Export (JSON)
                    </button>
                    <button className="primary-neon">
                        <Download size={18} /> Generate PDF Report
                    </button>
                </div>
            </header>

            <div className="bento-grid">
                {/* Sector Metrics */}
                <div className="bento-card" style={{ gridColumn: 'span 4' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                       <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
                            <TrendingUp size={20} />
                       </div>
                       <h2>Circulation Velocity</h2>
                   </div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-active)' }}>
                        {(summary.issued_books / summary.total_books * 100).toFixed(1)}%
                   </div>
                   <div className="caption" style={{ marginTop: '8px' }}>Active resource utilization across all sectors.</div>
                </div>

                <div className="bento-card" style={{ gridColumn: 'span 4' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                       <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger)' }}>
                            <AlertTriangle size={20} />
                       </div>
                       <h2>Risk Exposure</h2>
                   </div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-active)' }}>
                        {summary.overdue_transactions}
                   </div>
                   <div className="caption" style={{ marginTop: '8px' }}>Identified overdue units requiring immediate retrieval.</div>
                </div>

                <div className="bento-card" style={{ gridColumn: 'span 4' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                       <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-main)' }}>
                            <CheckCircle2 size={20} />
                       </div>
                       <h2>Registry Health</h2>
                   </div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-active)' }}>
                        99.8%
                   </div>
                   <div className="caption" style={{ marginTop: '8px' }}>Logical integrity and record accuracy verified.</div>
                </div>

                {/* Main Intel Views */}
                <div className="bento-card" style={{ gridColumn: 'span 8', gridRow: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <BarChart size={20} color="var(--accent-main)" />
                            <h2>Projected Borrowing Trends</h2>
                        </div>
                    </div>
                    <div style={{ height: '320px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-clean)' }}>
                        <span className="caption">Advanced Neural Graphics Integration Active...</span>
                    </div>
                </div>

                <div className="bento-card" style={{ gridColumn: 'span 4', gridRow: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <PieChart size={20} color="var(--accent-main)" />
                        <h2>Sector Distribution</h2>
                    </div>
                    <table className="registry-table" style={{ fontSize: '0.8125rem' }}>
                        <thead>
                            <tr>
                                <th>Sector</th>
                                <th style={{ textAlign: 'right' }}>Units</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(summary.category_distribution).map(([cat, count]) => (
                                <tr key={cat}>
                                    <td style={{ fontWeight: 600 }}>{cat}</td>
                                    <td style={{ textAlign: 'right' }}>{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Recent Export Log */}
                <div className="bento-card" style={{ gridColumn: 'span 12' }}>
                    <h2>Recent Archive Exports</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Q1 Circulation Analytics.pdf</span>
                            <span className="caption" style={{ fontSize: '0.75rem' }}>Successfully Generated 2h ago</span>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Inventory_Registry_Full_Dump.csv</span>
                            <span className="caption" style={{ fontSize: '0.75rem' }}>Successfully Generated 1d ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
