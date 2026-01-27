import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BigScreen } from './components/BigScreen';
import { MobileJoin } from './components/MobileJoin';
import { AdminPanel } from './components/AdminPanel';
import { EventCreator } from './components/EventCreator';
import './index.css';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen text-slate-200 selection:bg-fuchsia-500/30">

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
