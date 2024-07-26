// Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import handleLogout from '../functions/logOut';
import checkLogin from '../functions/checkLogin';



const Header = ({ user }) => {

  return (
    <header className={styles.header}>
      <nav>
        <ul>
          <li><Link to="/">홈</Link></li>
          {user ? (
            <>
              <li><Link to="/posts/create">새 글 작성</Link></li>
              <li><Link to="/auth/logout">로그아웃</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/posts" onClick={handleLogout}>LOGOUT</Link></li>
              <li><Link to="/posts/create">글쓰기</Link></li>
              <li><Link to="/auth/google2" onClick={checkLogin}>CHECKID</Link></li>
              <li><Link to="/login">로그인</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;