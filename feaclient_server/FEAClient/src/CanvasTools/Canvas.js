import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:9600/api') // replace 9960 with your backend port
      .then(response => setData(response.data.message))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>React + Express Integration</h1>
      <p>{data}</p>
    </div>
  );
}

export default App;