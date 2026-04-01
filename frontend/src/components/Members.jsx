import React, { useEffect, useState } from 'react';
import api from '../api';
import { Users, UserPlus, Search, Mail, Phone, Calendar, MoreVertical, ShieldCheck } from 'lucide-react';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.getMembers()
            .then(res => {
                setMembers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>Synchronizing Member Directory...</div>;

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>Member Directory</h1>
                    <div className="caption">High-fidelity profile management and circulation tracking.</div>
                </div>
                <button className="primary-neon">
                    <UserPlus size={18} /> Register Member
                </button>
            </header>

            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    type="text" 
                    placeholder="Search by name or email identity..." 
                    className="input-minimal"
                    style={{ width: '100%', paddingLeft: '48px', height: '48px', background: 'var(--bg-card)', border: '1px solid var(--border-clean)', borderRadius: '8px', color: 'var(--text-main)' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bento-grid">
                {filteredMembers.map((member) => (
                    <div key={member.id} className="bento-card" style={{ gridColumn: 'span 4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-main)' }}>
                                <Users size={24} />
                            </div>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <MoreVertical size={20} />
                            </button>
                        </div>
                        
                        <h2 style={{ marginBottom: '4px' }}>{member.name}</h2>
                        <div className="caption" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={14} color="var(--success)" />
                            Active Member
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                                <Mail size={16} /> {member.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                                <Phone size={16} /> {member.phone}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                                <Calendar size={16} /> Joined {member.membership_date}
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-clean)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="caption" style={{ fontWeight: 800 }}>0 ACTIVE ISSUES</span>
                            <button className="cyber-action" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Full Profile</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Members;
