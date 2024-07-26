// Login.js
import React, { useEffect, useState } from 'react';

// const port = "http://localhost:5102";
// const port = "";
const port = "https://ec2seoul.flaresolution.com";
// const port = "http://13.124.195:5102"
console.log("port="+port);

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  // const [sessionID, setSessionID] = useState(null);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${port}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      // const data = await response.headers.get("X-Session-Id");
      if (response.ok) {

        setMessage('Login successful');
        console.log("22",data);
        handleSubmit2()
        
        // Handle successful login (e.g., redirect or update state)
      } else {
        setMessage('Login failed: ' + data.message);
        console.error('Login failed', data);
      }
    } catch (error) {
      setMessage('An error occurred');
      console.error('Login error', error);
    }
  };

  const handleSubmit2 = async () => {
    try {
      const response = await fetch(`${port}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {

        console.log('Login2 successful', data);
      } else {
        setMessage('Login failed: ' + data.message);
        console.error('Login failed', data);
      }
    } catch (error) {
      setMessage('An error occurred');
      console.error('Login error', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;