import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    } else {
      alert('Debes iniciar sesión primero');
      navigate('/');
    }
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #3b82f6, #6366f1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>
        🧠 Bienvenido a PsyManage
      </h1>
      <p style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '40px' }}>
        Hola, {usuario.email}. Esta es tu plataforma de software para gestión psicológica.
      </p>

      <img
        src="https://img.freepik.com/vector-gratis/plantilla-logotipo-degradado-salud-mental_23-2148820570.jpg?t=st=1747856695~exp=1747860295~hmac=38b8f414b60a0c952069750a2c96762cfb11b7b44f142cdebefee1b98a21f701&w=1380"
        alt="Logo salud mental"
        style={{ width: '300px', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}
      />

      <button
        onClick={() => navigate('/continuar')}
        style={{
          backgroundColor: 'white',
          color: '#6366f1',
          fontWeight: '700',
          padding: '12px 32px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
          transition: 'background-color 0.3s ease',
          marginBottom: '16px',
        }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e0e7ff')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = 'white')}
      >
        Continuar
      </button>
    </div>
  );
}
