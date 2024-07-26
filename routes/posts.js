import express from 'express';
const router = express.Router();
import { google } from'googleapis';
import Post from'../models/Post.js';


// img upload
import { imgbox } from'imgbox-js';
import multer from'multer';
const upload = multer({ storage: multer.memoryStorage() });
// import fs from 'fs' .promises;
import {promises as fs} from 'fs';
import path from 'path';
import os from 'os';
import EventEmitter from 'events';

const uploadEmitter = new EventEmitter();
import { Readable } from 'stream';

import ensureAuthenticated from '../middleware/ensureAuthenticated.js';


router.get('/', ensureAuthenticated, async (req, res) => {
  console.log("Req PAss");
  // 사용자가 인증되어 있는지 확인
  const userId = await req.user; // 세션에서 사용자 ID를 가져옵니다.
  console.log("userID!!="+userId);

  

  try {
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/create', ensureAuthenticated, async (req, res) => {
    console.log("create post");
    try {

      const { title, content, tags} = req.body;

      
      const newPost = new Post({
        title,
        content,
        tags,
        author: req.user  // 현재 로그인한 사용자의 ID를 author로 설정
      });
  
      await newPost.save();
      res.status(201).json({message:'GOOD'});
    } catch (error) {
      console.error('Error saving post:', error);
      res.status(500).send('Error saving post');
    }
});

router.put('/update/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, 
      { title, content, tags },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: '게시물 수정 중 오류가 발생했습니다.', error: error.message });
  }
});

  //upload photo
//lagacy  
// router.post('/upload-image', upload.single('image'), async (req, res) => {
//     let sseRes;
//     if(req.headers.accept & req.headers.accept.includes('text/event-stream')){
//       sseRes = res;
//       sseRes.writeHead(200,{
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive'
//       });
//     }
    
//     sseRes.write(`data: ${JSON.stringify({ message: "SSE Connected" })}\n\n`);

//     const sendProgress = (message, progress) => {
//       if (sseRes) {
//         sseRes.write(`data: ${JSON.stringify({ message, progress })}\n\n`);
//       }
//     };
  
  
//     console.log(req.body);
//     sendProgress('Received image upload request');
//     if (!req.file) {
//       console.log('No file received');
//       return res.status(400).json({ error: 'No image file provided' });
//     }
  
//     try {
//       sendProgress('File received, processing...');
//       const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'imgbox-'));
//       const tempFilePath = path.join(tempDir, req.file.originalname);
      
//       await fs.writeFile(tempFilePath, req.file.buffer);
  
//       sendProgress('Uploading to imgbox...');
//       const result = await imgbox(tempFilePath, {
//         auth_cookie: null,
//         adult_content: false,
//         comments_enabled: false,
//         thumb_size: '350r'
//       });
  
//       // Clean up the temporary file
//       await fs.unlink(tempFilePath);
//       await fs.rmdir(tempDir);
  
//       console.log('Imgbox response:', result);
  
//       if (result && result.ok && result.data && result.data.length > 0) {
//         sendProgress('Upload successful');
//         res.write(`data: ${JSON.stringify({ 
//           success: true, 
//           imageUrl: result.data[0].original_url,
//           thumbnailUrl: result.data[0].thumbnail_url
//         })}\n\n`);
//       } else {
//         sendProgress('Upload failed');
//         console.error('Imgbox upload failed:', result);
//         res.status(500).json({ error: 'Failed to upload image to Imgbox' });
//       }
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       res.status(500).json({ error: error.message || 'Failed to upload image' });
//     } finally{
//       res.end();
//     }
//   });

router.get('/upload-image', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
    handleSSE(req, res);
  } else {
    res.status(400).send('Invalid request');
  }
});
router.post('/upload-image', handleFileUpload);

function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:3000' // 프론트엔드 주소
  });

  res.write(`data: ${JSON.stringify({ message: "SSE Connected" })}\n\n`);

  const progressListener = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  uploadEmitter.on('progress', progressListener);

  req.on('close', () => {
    uploadEmitter.off('progress', progressListener);
  });
}

async function handleFileUpload(req, res) {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      uploadEmitter.emit('progress', { message: 'Upload error', error: err.message });
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      uploadEmitter.emit('progress', { message: 'No file uploaded' });
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      uploadEmitter.emit('progress', { message: 'File received', progress: 10 });

      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'imgbox-'));
      const tempFilePath = path.join(tempDir, req.file.originalname);

      await fs.writeFile(tempFilePath, req.file.buffer);
      uploadEmitter.emit('progress', { message: 'File saved temporarily', progress: 30 });

      uploadEmitter.emit('progress', { message: 'Uploading to imgbox', progress: 50 });
      const result = await imgbox(tempFilePath, {
        auth_cookie: null,
        adult_content: false,
        comments_enabled: false,
        thumb_size: '350r'
      });

      await fs.unlink(tempFilePath);
      await fs.rmdir(tempDir);

      uploadEmitter.emit('progress', { message: 'Upload completed', progress: 90 });

      if (result && result.ok && result.data && result.data.length > 0) {
        uploadEmitter.emit('progress', { message: 'Processing complete', progress: 100 });
        console.log("uploaded!");
        res.json({
          success: true,
          imageUrl: result.data[0].original_url,
          thumbnailUrl: result.data[0].thumbnail_url
        });
      } else {
        throw new Error('Failed to upload image to Imgbox');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      uploadEmitter.emit('progress', { message: 'Upload failed', error: error.message });
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  });
}

//youtube upload

router.post('/upload-video', upload.single('video'), async (req, res) => {
  console.log("upload video request");
  console.log("SSSSS:", req.session);  // 디버깅을 위해 사용자 정보 로깅

  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'No access token available' });
  }

  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: req.session.accessToken,
    refresh_token: req.session.refreshToken
  });

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  try {
    // Create a readable stream from the buffer
    const fileStream = new Readable();
    fileStream.push(req.file.buffer);
    fileStream.push(null);

    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: req.file.originalname,
          description: 'Uploaded video'
        },
        status: {
          privacyStatus: 'unlisted'
        }
      },
      media: {
        body: fileStream
      }
    });

    res.json({ 
      videoId: response.data.id,
      embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/${response.data.id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    });
  } catch (error) {
    console.error('Error uploading to YouTube:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

router.get('/test', async (req, res) => {
  try {
    const post = "AAAAA";
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message+"AAAAA" });
    }
  });






export default router;