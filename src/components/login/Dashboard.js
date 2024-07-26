// src/components/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  return (
    <div>
      <h1>대시보드</h1>
      <p>환영합니다, {user.name}님!</p>
      <Link to="/posts/create" className="btn">새 글 작성</Link>
      {/* 여기에 사용자의 게시글 목록을 추가할 수 있습니다 */}
    </div>
  );
};

export default Dashboard;