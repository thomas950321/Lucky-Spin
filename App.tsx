import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BigScreen } from './components/BigScreen';
import { MobileJoin } from './components/MobileJoin';
import { AdminPanel } from './components/AdminPanel';

import { useGameSocket } from './services/socket';
import { Monitor, Smartphone, Settings } from 'lucide-react';

const Nav: React.FC = () => {
  const location = useLocation();

  // Hide nav on Big Screen to keep it clean, show on others for easy testing navigation
  if (location.pathname === '/') return null;

  return (
    <nav className="fixed top-4 right-4 z-40 bg-slate-800/90 backdrop-blur rounded-full p-2 border border-slate-700 flex gap-2">
      <Link to="/" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors" title="Big Screen">
        <Monitor size={20} />
      </Link>
      <Link to="/join" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors" title="Mobile Join">
        <Smartphone size={20} />
      </Link>
      <Link to="/admin" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors" title="Admin">
        <Settings size={20} />
      </Link>
    </nav>
  );
};

// Simple landing for first time open to direct users
const LandingOrBigScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
}

const App: React.FC = () => {
  const { gameState, emitJoin, emitReset, emitStart } = useGameSocket();

  return (
    <HashRouter>
      <div className="antialiased">
        <Nav />
        <Routes>
          <Route path="/" element={<BigScreen gameState={gameState} />} />
          <Route path="/join" element={<MobileJoin onJoin={emitJoin} />} />
          <Route
            path="/admin"
            element={
              <AdminPanel
                gameState={gameState}
                onStart={emitStart}
                onReset={emitReset}
              />
            }
          />
        </Routes>

      </div>
    </HashRouter>
  );
};

export default App;
