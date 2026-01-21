import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BigScreen } from './components/BigScreen';
import { MobileJoin } from './components/MobileJoin';
import { AdminPanel } from './components/AdminPanel';
import { EventCreator } from './components/EventCreator';
import { Monitor, Smartphone, Settings } from 'lucide-react';
import './index.css';

const Nav: React.FC = () => {
  const location = useLocation();

  // Hide nav on Big Screen to keep it clean, show on others for easy testing navigation
  if (location.pathname === '/' || location.pathname.startsWith('/event/')) return null;

  return (
    <nav className="fixed top-6 right-6 z-50 glass-card rounded-full p-2 flex gap-3 animate-float">
      <Link to="/" className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Big Screen">
        <Monitor size={20} />
      </Link>
      <Link to="/join" className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Mobile Join">
        <Smartphone size={20} />
      </Link>
      <Link to="/admin" className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Admin">
        <Settings size={20} />
      </Link>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen text-slate-200 selection:bg-fuchsia-500/30">
        <Nav />
        <Routes>
          {/* Default "Main" Event Routes */}
          <Route path="/" element={<BigScreen />} />
          <Route path="/join" element={<MobileJoin />} />
          <Route path="/admin" element={<AdminPanel />} />

          {/* Dynamic Event Routes */}
          <Route path="/event/:id" element={<BigScreen />} />
          <Route path="/event/:id/join" element={<MobileJoin />} />

          {/* Admin Event Management */}
          <Route path="/admin/events" element={<EventCreator />} />
          <Route path="/admin/event/:id" element={<AdminPanel />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
