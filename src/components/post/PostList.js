// PostList.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PostList.module.css';
const endpoint = process.env.ENDPOINT;


const PostList = ({ posts }) => {
  return (
    <div className={styles.postList}>
      <h1>내 게시글</h1>
      {posts.length > 0 ? (
        <ul className={styles.list}>
          {posts.map(post => (
            <Link key={post._id} to={`/posts/${post._id}`}>
            <li key={post._id} className={styles.listItem}>
              
              <h2>{post.title}</h2>
              <p>{post.content.substring(0, 100)}...</p>
              <div className={styles.postMeta}>
                <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
                {post.tags && post.tags.length > 0 && (
                  <span>태그: {post.tags.join(', ')}</span>
                )}
              </div>
              
            </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>작성한 게시글이 없습니다.</p>
      )}
      <Link to="/posts/create" className={styles.btn}>새 글 작성</Link>
    </div>
  );
};

export default PostList;