// CreatePost.js
import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styles from './CreatePost.module.css';
import checkLogin from '../functions/checkLogin2';


const endpoint = process.env.REACT_APP_ENDPOINT;



const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState(null);

  const textareaRef = useRef(null);
  const dropAreaRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPost = async () => {
      const isLoggedIn = await checkLogin();
      if (id && isLoggedIn) {
        // console.log(id);
        try {
          const response = await fetch(`${endpoint}/posts/${id}`, {
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('게시물을 불러오는데 실패했습니다.');
          }
          const post = await response.json();
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags.join(', '));
          setIsEditing(true);
          setPostId(post._id);
        } catch (error) {
          console.error('게시물 불러오기 오류:', error);
          setError('게시물을 불러오는데 실패했습니다.');
        }
      } else if (location.state && location.state.post) {
        const { post } = location.state;
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags.join(', '));
        setIsEditing(true);
        setPostId(post._id);
      } else if (!isLoggedIn) {
        // 로그인되지 않은 경우 처리
        // navigate('/login'); // 또는 다른 적절한 처리
      }
    };


    checkLogin();
    fetchPost();
    // edit

    // if (location.state && location.state.post) {
    //   const { post } = location.state;
    //   setTitle(post.title);
    //   setContent(post.content);
    //   setTags(post.tags.join(', '));
    //   setIsEditing(true);
    //   setPostId(post._id);
    // }

    // Set up drag and drop event listeners
    const dropArea = dropAreaRef.current;
    if (dropArea) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
      });

      dropArea.addEventListener('drop', handleDrop, false);
    }

    return () => {
      // Clean up event listeners
      if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropArea.removeEventListener(eventName, preventDefaults);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
          dropArea.removeEventListener(eventName, highlight);
        });

        ['dragleave', 'drop'].forEach(eventName => {
          dropArea.removeEventListener(eventName, unhighlight);
        });

        dropArea.removeEventListener('drop', handleDrop);
      }
    };
  }, [id, location.state, navigate]);



  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const highlight = () => setIsDragging(true);
  const unhighlight = () => setIsDragging(false);

  const handleDrop = (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
  };

  const handleFiles = (files) => {
    ([...files]).forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadImage(file, file.name);
      } else if (file.type.startsWith('video/')) {
        uploadVideo(file);
      } else {
        console.log(`Unsupported file type: ${file.type}`);
        setError(`Unsupported file type: ${file.type}`);
      }
    });
  };

  const uploadImage = async (file, fileName) => {
    setIsUploading(true);
    setUploadProgress(0);
  
    let eventSource;
  
    try {
      // SSE 연결 설정
      eventSource = new EventSource(`${endpoint}/posts/upload-image`, { withCredentials: true });
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.message) {
          console.log(data.message);
          if (data.progress) {
            setUploadProgress(data.progress);
          }
        }
      };
  
      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        console.warn('SSE connection failed, proceeding with file upload');
      };
  
      // 파일 업로드 로직
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await fetch(`${endpoint}/posts/upload-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error('Upload request failed');
      }
  
      const result = await response.json();
  
      if (result.success) {
        console.log('Upload successful');
        setUploadProgress(100);
        insertImageUrl(result.imageUrl, fileName);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
  
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      if (eventSource) {
        eventSource.close();
      }
    }
  };
  
  const insertImageUrl = (url, fileName) => {
    const imageMarkdown = `![${fileName}](${url})`;
    setContent(prevContent => prevContent + '\n' + imageMarkdown + '\n');
  };

  const uploadVideo = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const response = await fetch(`${endpoint}/posts/upload-video`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload request failed');
      }
  
      const result = await response.json();
  
      if (result.videoId) {
        console.log('Upload successful');
        setUploadProgress(100);
        insertVideoUrl(result.videoId, result.embedHtml);
      } else {
        throw new Error('Upload failed');
      }
  
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('비디오 업로드 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const insertVideoUrl = (videoId, embedHtml) => {
    const videoEmbed = `
  ${embedHtml}
  `;
    setContent(prevContent => prevContent + '\n' + videoEmbed + '\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sessionID = sessionStorage.getItem("sessionID");
      const url = isEditing 
        ? `${endpoint}/posts/update/${postId}` 
        : `${endpoint}/posts/create`;
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionID,
        },
        body: JSON.stringify({
          title,
          content,
          tags: tags.split(',').map(tag => tag.trim())
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('서버 응답이 실패했습니다');
      }

      const data = await response.json();
      
      console.log(isEditing ? '게시물이 성공적으로 수정되었습니다:' : '게시물이 성공적으로 생성되었습니다:', data);
      if(response.ok){
        navigate('/');
      }
      
    } catch (err) {
      console.error(isEditing ? '게시물 수정 중 오류 발생:' : '게시물 생성 중 오류 발생:', err);
      setError(isEditing ? '게시물을 수정하는 동안 오류가 발생했습니다. 다시 시도해 주세요.' : '게시물을 생성하는 동안 오류가 발생했습니다. 다시 시도해 주세요.');
    }

  };

  const handleEditorCommand = (command) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    switch (command) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'heading':
        replacement = `# ${selectedText}`;
        break;
      case 'link':
        replacement = `[${selectedText}](url)`;
        break;
      default:
        break;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  return (
    <div className={styles.createPost}>
      <h1>{isEditing ? '글 수정' : '새 글 작성'}</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">제목:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="tags">태그 (쉼표로 구분):</label>
          <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={styles.tags} />
        </div>
        <div className={styles.editorContainer}>
          <div className={styles.editorToolbar}>
            <button type="button" className={styles.toolbarBtn} onClick={() => handleEditorCommand('bold')}>B</button>
            <button type="button" className={styles.toolbarBtn} onClick={() => handleEditorCommand('italic')}>I</button>
            <button type="button" className={styles.toolbarBtn} onClick={() => handleEditorCommand('heading')}>#</button>
            <button type="button" className={styles.toolbarBtn} onClick={() => handleEditorCommand('link')}>Link</button>
            <button type="button" className={styles.toolbarBtn} onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? '편집' : '미리보기'}
            </button>
          </div>
          <div 
            ref={dropAreaRef}
            className={`${styles.editorContent} ${isDragging ? styles.highlight : ''}`} 
            id="drop-area"
          >
            {isUploading && (
              <div className={styles.uploadingOverlay}>
                <div className={styles.spinner}></div>
                <p>Uploading... {uploadProgress}%</p>
              </div>
            )}
            {showPreview ? (
              <div id="preview" className={styles.preview} dangerouslySetInnerHTML={{ __html: marked(content) }}></div>
            ) : (
              <textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.content}
                rows="10"
                required
              />
            )}
          </div>
        </div>
        <button type="submit" className={styles.uploadBtn}>{isEditing ? '수정하기' : '게시하기'}</button>
      </form>
    </div>
  );
};

export default CreatePost;