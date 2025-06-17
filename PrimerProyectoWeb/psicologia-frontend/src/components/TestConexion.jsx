import React, { useEffect, useState } from 'react';

const TestConexion = () => {
  const [mensaje, setMensaje] = useState('');
  const [tiempo, setTiempo] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/test-db')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMensaje('Conexión exitosa con la base de datos ✅');
          setTiempo(data.time);
        } else {
          setMensaje('Error conectando con la base de datos ❌');
        }
      })
      .catch((error) => {
        console.error('Error en la conexión:', error);
        setMensaje('Error de conexión al servidor ❌');
      });
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">Prueba de conexión</h2>
      <p>{mensaje}</p>
      {tiempo && <p>Hora del servidor: {tiempo}</p>}
    </div>
  );
};

export default TestConexion;
