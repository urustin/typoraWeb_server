import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const endpoint = process.env.REACT_APP_ENDPOINT;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    checkAuthStatus();
  },[])
  
  const checkAuthStatus = async () => {
    try {
      const sessionID = sessionStorage.getItem('sessionID');
      const response = await fetch(`${endpoint}/auth/check-auth`, {
        method: 'GET',
        credentials: 'include', // 쿠키를 포함시키기 위해 필요합니다
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionID,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        // 이미 인증된 사용자라면 홈페이지로 리다이렉트
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${endpoint}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // 쿠키를 포함시키기 위해 필요합니다
      });
      const data = await response.headers.get('X-Session-ID');


      if (response.ok) {
        const sessionID = response.headers.get('X-Session-ID');
        sessionStorage.setItem('sessionID', sessionID); // sessionStorage에 저장
        navigate('/'); // 로그인 성공 시 홈페이지로 리다이렉트
      } else {
        
        setError(data.message || "로그인에 실패하였습니다");
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    }
  };



  const googleLogin = async (e) => {
    e.preventDefault();

    window.location.href = `${endpoint}/auth/google`;
  };



  
  


  
  return (
    <div className={styles.login}>
      <h1>로그인</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          // type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
        />
        <button type="submit" className={styles.btn}>로그인</button>
      </form>
      <button onClick={googleLogin} className={styles.btn}>Google로 로그인</button>
      <p>
        계정이 없으신가요? <Link to="/register">회원가입</Link>
      </p>
    </div>
  );
};

export default Login;