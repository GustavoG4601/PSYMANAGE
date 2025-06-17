import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import AddUser from './components/AddUser';
import HistorialUsuarios from './components/HistorialUsuarios';
import AgendaCitas from './components/AgendaCitas';
import InformesEstadisticas from './components/InformesEstadisticas';
import Personalizadas from './components/Personalizadas';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (email) => {
    setUser(email);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/home" />}
        />
        <Route
          path="/home"
          element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/adduser"
          element={user ? <AddUser /> : <Navigate to="/" />}
        />
        <Route
          path="/historialusuarios"
          element={user ? <HistorialUsuarios /> : <Navigate to="/" />}
        />
        <Route
          path="/AgendaCitas"
          element={user ? <AgendaCitas /> : <Navigate to="/" />}
        />
        <Route
          path="/InformesEstadisticas"
          element={user ? <InformesEstadisticas /> : <Navigate to="/" />}
        />
        <Route
          path="/personalizadas"
          element={user ? <Personalizadas /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
