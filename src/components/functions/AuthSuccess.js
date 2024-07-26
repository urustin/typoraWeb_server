// AuthSuccess.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionID = params.get('sessionId');


    if (sessionID) {
      sessionStorage.setItem('sessionID', sessionID);
      // 로그인 성공 후 메인 페이지나 대시보드로 리다이렉트
      navigate('/');
    } else {
      // 오류 처리
      console.error('Authentication failed');
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Authentication successful. Redirecting...</div>;
}

export default AuthSuccess;