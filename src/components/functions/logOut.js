// logout.js

const endpoint = process.env.REACT_APP_ENDPOINT;

const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // 서버에 로그아웃 요청을 보냅니다.
      const response = await fetch(`${endpoint}/auth/logout`, {
        method: 'GET',
        credentials: 'include',

      });

      if (response.ok) {
        // 로컬 스토리지에서 토큰과 사용자 정보를 제거합니다.

        alert("LOGOUT!");
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
};

export default handleLogout;