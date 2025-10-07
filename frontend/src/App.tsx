import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/') // Запрос к бэку
        .then(res => setMessage(res.data))
        .catch(err => console.error(err));
  }, []);

  return (
      <div>
        <h1>Personal Blog</h1>
        <p>From backend: {message}</p> // Покажет сообщение от бэка
      </div>
  );
}

export default App;