import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      alert('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registro exitoso');
        navigate('/');
      } else {
        alert(data.error || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #6366f1, #3b82f6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '32px',
          textAlign: 'center',
          color: '#3b82f6'
        }}>
          📝 Crear cuenta
        </h2>

        <label htmlFor="email" style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '600',
          color: '#4338ca'
        }}>
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          required
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '20px',
            border: '1px solid #c7d2fe',
            borderRadius: '10px',
            fontSize: '1rem',
            color: 'black',
            backgroundColor: '#f8faff'
          }}
        />

        <label htmlFor="password" style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '600',
          color: '#4338ca'
        }}>
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="********"
          required
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '20px',
            border: '1px solid #c7d2fe',
            borderRadius: '10px',
            fontSize: '1rem',
            color: 'black',
            backgroundColor: '#f8faff'
          }}
        />

        <label htmlFor="confirmPassword" style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '600',
          color: '#4338ca'
        }}>
          Confirmar contraseña
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="********"
          required
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '28px',
            border: '1px solid #c7d2fe',
            borderRadius: '10px',
            fontSize: '1rem',
            color: 'black',
            backgroundColor: '#f8faff'
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: '700',
            fontSize: '1rem',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          Crear cuenta
        </button>

        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '0.95rem'
        }}>
          <Link
            to="/"
            style={{
              color: '#4338ca',
              fontWeight: '600',
              textDecoration: 'underline',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={e => (e.currentTarget.style.color = '#2563eb')}
            onMouseOut={e => (e.currentTarget.style.color = '#4338ca')}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
