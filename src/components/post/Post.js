import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Post.module.css';
import { marked } from 'marked';
import checkLogin2 from '../functions/checkLogin2';

const endpoint = process.env.ENDPOINT;


const Post = ({ post }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // setCurrentUser(checkLogin2.user);
    
    // await console.log(checkLogin2());
  }, []);

  const handleEdit = () => {
    navigate(`/edit-post/${post._id}`, { state: { post } });
  };

  return (
    <article className={styles.post}>
      <h1>{post.title}</h1>
      <div className={styles.postMeta}>
        <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
        {post.tags.length > 0 && (
          <span>태그: {post.tags.join(', ')}</span>
        )}
      </div>
      <div 
        className={styles.postContent}
        dangerouslySetInnerHTML={{ __html: marked(post.content) }}
      />
      {currentUser && currentUser === post.author && (
        <button onClick={handleEdit} className={styles.editButton}>수정하기</button>
      )}
    </article>
  );
};

export default Post;