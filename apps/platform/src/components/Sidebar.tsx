import React from 'react';
import { LayoutDashboard, GitMerge, Trophy, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'The Pipeline', icon: GitMerge, href: '/pipeline' },
    { name: 'Achievements', icon: Trophy, href: '/achievements' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  // Logic to determine active path would go here in a real app
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo-text">STUDY<span>BEARER</span></h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <a 
            key={item.name} 
            href={item.href} 
            className={`nav-link ${currentPath === item.href ? 'active' : ''}`}
          >
            <item.icon size={20} strokeWidth={2} />
            <span>{item.name}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="player-identifier">
          <div className="avatar-wrapper">
            <div className="avatar-neon-ring"></div>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Student1" 
              alt="Avatar" 
              className="avatar-img"
            />
          </div>
          <div className="player-details">
            <span className="player-name">Student 1</span>
            <span className="player-rank">Silver Tier</span>
          </div>
        </div>
        
        <button className="logout-button">
          <LogOut size={16} />
          <span>Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
