import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function InformesEstadisticas() {
  const [usuarios, setUsuarios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [citasPorDia, setCitasPorDia] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState(0);

  useEffect(() => {
    const historialUsuarios = JSON.parse(localStorage.getItem('historialUsuarios')) || [];
    const historialCitas = JSON.parse(localStorage.getItem('citas')) || [];
    const respuestasPersonalizadas = JSON.parse(localStorage.getItem('respuestasPersonalizadas')) || {};

    setUsuarios(historialUsuarios);
    setCitas(historialCitas);
    setEvaluaciones(Object.keys(respuestasPersonalizadas).length);

    // Agrupar citas por fecha
    const agrupadas = historialCitas.reduce((acc, cita) => {
      acc[cita.fecha] = (acc[cita.fecha] || 0) + 1;
      return acc;
    }, {});
    
    const datosAgrupados = Object.keys(agrupadas).map(fecha => ({
      fecha,
      cantidad: agrupadas[fecha]
    }));

    setCitasPorDia(datosAgrupados);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #3b82f6, #6366f1)',
      color: 'white',
      padding: '40px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '32px' }}>
        📊 Informes y Estadísticas
      </h1>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>📅 Citas por Día</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={citasPorDia}>
            <XAxis dataKey="fecha" stroke="#ffffff" />
            <YAxis stroke="#ffffff" />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>👥 Registro de Usuarios</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[{ name: 'Usuarios', cantidad: usuarios.length }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#ffffff" />
            <YAxis stroke="#ffffff" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cantidad" stroke="#34d399" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>📈 Actividad General</h2>
        <ul style={{ fontSize: '1.2rem' }}>
          <li>Usuarios registrados: <strong>{usuarios.length}</strong></li>
          <li>Citas agendadas: <strong>{citas.length}</strong></li>
          <li>Evaluaciones personalizadas realizadas: <strong>{evaluaciones}</strong></li>
        </ul>
      </section>
    </div>
  );
}
