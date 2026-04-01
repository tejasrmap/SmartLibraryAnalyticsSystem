import React from 'react';
import { LayoutDashboard, Book, Users, BarChart3, Settings, LogOut, Library } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Inventory', icon: <Book size={20} /> },
    { id: 'members', label: 'Community', icon: <Users size={20} /> },
    { id: 'reports', label: 'Analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="sidebar-minimal">
      {/* High-Contrast Booklytics Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', paddingLeft: '4px' }}>
        <div style={{ background: 'var(--accent-main)', borderRadius: '8px', padding: '6px', display: 'flex', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
          <Library size={22} color="white" />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-active)' }}>
          Book<span style={{ color: 'var(--accent-main)' }}>lytics</span>
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <nav>
          <div className="caption" style={{ marginBottom: '16px', paddingLeft: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>Navigation</div>
          {menuItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className={`nav-link-cyber ${activeTab === item.id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
            >
              {item.icon}
              <span style={{ fontSize: '1rem' }}>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div style={{ paddingTop: '32px', borderTop: '1px solid var(--border-clean)' }}>
        <a href="#" className="nav-link-cyber">
          <Settings size={20} />
          <span style={{ fontSize: '1rem' }}>Settings</span>
        </a>
        <a href="#" className="nav-link-cyber" style={{ color: 'var(--danger)' }}>
          <LogOut size={20} />
          <span style={{ fontSize: '1rem' }}>Terminate</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 14px', marginTop: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-clean)' }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 8px var(--success)' }}></div>
          <span className="caption" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-active)' }}>System Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
