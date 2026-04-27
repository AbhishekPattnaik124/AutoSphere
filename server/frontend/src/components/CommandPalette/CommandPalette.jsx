import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  Search, Car, MapPin, BarChart3, Settings, 
  Home, Info, Phone, Calendar, User, Zap, Activity
} from 'lucide-react';
import './CommandPalette.css';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dealers, setDealers] = useState([]);
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [dRes, cRes] = await Promise.all([
            fetch('/djangoapp/get_dealers'),
            fetch('/djangoapp/get_cars')
          ]);
          const dData = await dRes.json();
          const cData = await cRes.json();
          setDealers(dData.dealers || []);
          setCars(cData.CarModels || []);
        } catch (err) {
          console.error('Palette fetch failed', err);
        }
      };
      fetchData();
    }
  }, [open]);

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu">
      <div className="command-palette-container luxury-palette">
        <div className="command-search-wrapper">
          <Search size={18} className="gold-text" />
          <Command.Input 
            placeholder="Search dealers, cars, or systems... (CMD+K)" 
            value={query}
            onValueChange={setQuery}
          />
        </div>

        <Command.List>
          <Command.Empty>No matches found in the network.</Command.Empty>

          <Command.Group heading="Strategic Navigation">
            <Command.Item onSelect={() => handleSelect('/')}>
              <Home size={16} /> <span>Home Overview</span>
            </Command.Item>
            <Command.Item onSelect={() => handleSelect('/advancements')}>
              <Zap size={16} className="gold-text" /> <span className="gold-text">Elite Advancements</span>
            </Command.Item>
            <Command.Item onSelect={() => handleSelect('/dealers')}>
              <MapPin size={16} /> <span>Network Hub (Dealers)</span>
            </Command.Item>
          </Command.Group>

          {dealers.length > 0 && (
            <Command.Group heading="Partner Dealerships">
              {dealers.filter(d => d.full_name.toLowerCase().includes(query.toLowerCase())).slice(0, 5).map(dealer => (
                <Command.Item key={dealer.id} onSelect={() => handleSelect(`/dealer/${dealer.id}`)}>
                  <MapPin size={16} /> <span>{dealer.full_name} ({dealer.city})</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {cars.length > 0 && (
            <Command.Group heading="Luxury Inventory">
              {cars.filter(c => c.CarModel.toLowerCase().includes(query.toLowerCase())).slice(0, 5).map((car, idx) => (
                <Command.Item key={idx} onSelect={() => handleSelect(`/dealers`)}>
                  <Car size={16} /> <span>{car.CarMake} {car.CarModel}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Intelligence Center">
            <Command.Item onSelect={() => handleSelect('/recommendations')}>
              <Zap size={16} /> <span>AI Concierge</span>
            </Command.Item>
            <Command.Item onSelect={() => handleSelect('/market-trends')}>
              <BarChart3 size={16} /> <span>Market Pulse</span>
            </Command.Item>
            <Command.Item onSelect={() => handleSelect('/leaderboard')}>
              <Activity size={16} /> <span>Global Leaderboard</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
        
        <div className="command-footer">
          Press <kbd>ESC</kbd> to exit • <kbd>ENTER</kbd> to select
        </div>
      </div>
    </Command.Dialog>
  );
};

export default CommandPalette;
