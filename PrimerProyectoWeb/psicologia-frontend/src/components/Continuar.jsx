import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaHistory, FaClipboardCheck, FaCalendarAlt, FaChartBar } from 'react-icons/fa';

export default function Continuar() {
  const navigate = useNavigate();

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '32px 24px',
    flex: '1 1 280px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  };

  const iconStyle = {
    fontSize: '4.5rem',
    color: 'white',
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
  };

  const handleMouseEnter = e => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
    e.currentTarget.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = e => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #3b82f6, #6366f1)',
        color: 'white',
        padding: '40px 24px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: '900',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        🧠 Plataforma PsyManage
      </h1>

      <p
        style={{
          fontSize: '1.25rem',
          maxWidth: '720px',
          margin: '0 auto 48px',
          lineHeight: '1.6',
          textAlign: 'center',
          fontWeight: '500',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '20px 28px',
          borderRadius: '14px',
          boxShadow: '0 8px 18px rgba(0,0,0,0.4)',
        }}
      >
        Este software de gestión psicológica está diseñado para profesionales de la psicología de la universidad,
        facilitando el almacenamiento, organización y seguimiento de la información clínica y emocional de las personas
        internas, incluyendo docentes y trabajadores. Permite registrar perfiles, gestionar historiales y personalizar
        evaluaciones con seguridad y flexibilidad.
      </p>

      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '28px',
          flexWrap: 'wrap',
        }}
      >
        {/* Tarjeta: Añadir usuario */}
        <div
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/adduser')}
        >
          <FaUserPlus style={iconStyle} />
          <h2 style={{ fontWeight: '800', fontSize: '1.6rem' }}>Añadir nuevo usuario</h2>
          <p>Registra nuevos usuarios con sus perfiles y tipologías psicológicas específicas.</p>
        </div>

        {/* Tarjeta: Historial */}
        <div
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/HistorialUsuarios')}
        >
          <FaHistory style={iconStyle} />
          <h2 style={{ fontWeight: '800', fontSize: '1.6rem' }}>Ver historial de usuarios</h2>
          <p>Consulta y gestiona los historiales clínicos y emocionales de los usuarios registrados.</p>
        </div>

        {/* Tarjeta: Evaluaciones */}
        <div
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/Personalizadas')}
        >
          <FaClipboardCheck style={iconStyle} />
          <h2 style={{ fontWeight: '800', fontSize: '1.6rem' }}> Crear Cuestionarios</h2>
          <p>Crea, personaliza cuestionarios para evaluar diferentes aspectos emocionales y clínicos.</p>
        </div>

        {/* Tarjeta: Realizar Cuestionarios */}
<div
  style={cardStyle}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  onClick={() => navigate('/Realizar_cuestionarios')}
>
  <FaClipboardCheck style={iconStyle} />
  <h2 style={{ fontWeight: '800', fontSize: '1.6rem' }}>Realizar Cuestionarios</h2>
  <p>Registra datos del usuario y responde cuestionarios previamente creados.</p>
</div>


        {/* Tarjeta: Agenda */}
        <div
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/AgendaCitas')}
        >
          <FaCalendarAlt style={iconStyle} />
          <h2 style={{ fontWeight: '800', fontSize: '1.6rem' }}>Agenda y Gestión de Citas</h2>
          <p>Organiza tus citas, recordatorios y sesiones con usuarios de forma visual y eficaz.</p>
        </div>

        {/* Tarjeta: Estadísticas */}
        <div
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/InformesEstadisticas')}
        >
          <FaChartBar style={iconStyle} />
          <h2 style={{ fontWeight: '800', fontSize: '1.6rem' }}>Informes y Estadísticas</h2>
          <p>Visualiza métricas clave, progresos terapéuticos y reportes personalizados.</p>
        </div>
      </div>
    </div>
  );
}
