import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('Debil');
  const [password, setPassword] = useState('123');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/') // Запрос к бэку
        .then(res => setMessage(res.data))
        .catch(err => console.error(err));
    //TODO: solve error
    axios.post('http://localhost:5000/api/register', { username, password })
      .then(res => console.log(res.data.message))
      .catch(err => console.error(err.response.data.error));
  }, []);

  return (
      <div>
        <h1>Personal Blog</h1>
        <p>From backend: {message}</p> // Покажет сообщение от бэка
      </div>
  );
}

export default App;