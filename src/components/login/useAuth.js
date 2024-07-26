// // useAuth.js
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const useAuth = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = () => {
//       const storedUserId = localStorage.getItem('userId');
//       const expiration = localStorage.getItem('loginExpiration');
      
//       if (storedUserId && expiration && new Date().getTime() < parseInt(expiration)) {
//         setIsLoggedIn(true);
//         setUserId(storedUserId);
//       } else {
//         localStorage.removeItem('userId');
//         localStorage.removeItem('loginExpiration');
//         setIsLoggedIn(false);
//         setUserId(null);
//       }
//     };

//     checkAuth();
//     const interval = setInterval(checkAuth, 60000); // 매 분마다 체크

//     return () => clearInterval(interval);
//   }, [navigate]);

//   return { isLoggedIn, userId };
// };

// export default useAuth;