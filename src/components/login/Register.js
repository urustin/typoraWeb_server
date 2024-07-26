// Register.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
const endpoint = process.env.REACT_APP_ENDPOINT;


const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      console.log(email);
      const response = await fetch(`${endpoint}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials:"include"
      });

      if (response.ok) {
        navigate('/login'); // 회원가입 성공 시 로그인 페이지로 리다이렉트
      } else {
        const data = await response.json();
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.signup}>
      <h1>회원가입</h1>
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호 확인"
          required
        />
        <button type="submit" className={styles.btn}>회원가입</button>
      </form>
      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
};

export default Signup;