import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { fetchMe } from './lib/api';
import { connectSocket } from './lib/socket';
import { useSession, wireSocket } from './store';
import { Landing } from './screens/Landing';
import { Lobby } from './screens/Lobby';
import { RoomScreen } from './screens/Room';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();
  const location = useLocation();
  if (!ready)
    return (
      <div className="grid min-h-dvh place-items-center">
        <p style={{ color: 'var(--ink-dim)' }}>🌙 Đang tải…</p>
      </div>
    );
  if (!user) return <Navigate to="/" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function App() {
  const { user, ready, setUser, setReady } = useSession();

  useEffect(() => {
    wireSocket();
    fetchMe()
      .then((u) => {
        setUser(u);
        if (u) connectSocket();
      })
      .finally(() => setReady());
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p style={{ color: 'var(--ink-dim)' }}>🌙 Đang tải…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/lobby" replace /> : <Landing />} />
        <Route
          path="/lobby"
          element={
            <Guard>
              <Lobby />
            </Guard>
          }
        />
        <Route
          path="/room/:code"
          element={
            <Guard>
              <RoomScreen />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
