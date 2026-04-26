import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { 
  Search, Car, MapPin, BarChart3, Settings, 
  Home, Info, Phone, Calendar, User 
} from 'lucide-react';
import './CommandPalette.css';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (path) => {
    setOpen(false);
    window.location.href = path;
  };

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu">
      <div className="command-palette-container glass">
        <div className="command-search-wrapper">
          <Search size={18} />
          <Command.Input placeholder="Search everything... (Dealers, AI, Market)" />
        </div>

        <Command.List>
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group heading="Navigation">
            <Command.Item onSelect={() => navigate('/')}>
              <Home size={16} /> <span>Home</span>
            </Command.Item>
            <Command.Item onSelect={() => navigate('/dealers')}>
              <MapPin size={16} /> <span>Find Dealerships</span>
            </Command.Item>
            <Command.Item onSelect={() => navigate('/dashboard')}>
              <User size={16} /> <span>User Dashboard</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Intelligence & Analytics">
            <Command.Item onSelect={() => navigate('/recommendations')}>
              <Car size={16} /> <span>AI Car Recommendations</span>
            </Command.Item>
            <Command.Item onSelect={() => navigate('/market-trends')}>
              <BarChart3 size={16} /> <span>Market Trends Dashboard</span>
            </Command.Item>
            <Command.Item onSelect={() => navigate('/leaderboard')}>
              <BarChart3 size={16} /> <span>Dealer Leaderboard</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Services">
            <Command.Item onSelect={() => navigate('/about')}>
              <Info size={16} /> <span>About AutoSphere</span>
            </Command.Item>
            <Command.Item onSelect={() => navigate('/contact')}>
              <Phone size={16} /> <span>Contact Support</span>
            </Command.Item>
            <Command.Item onSelect={() => navigate('/health-dashboard')}>
              <Settings size={16} /> <span>System Health</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};

export default CommandPalette;
