import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Members from './components/Members';
import Reports from './components/Reports';
import './Theme.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory': return <Inventory />;
      case 'members': return <Members />;
      case 'reports': return <Reports />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="command-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="command-nexus">
        {renderContent()}
      </main>
    </div>
  );
}


export default App;
