import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import path from 'path';
import connectDB from './config/database.js';
// import marked from 'marked';
import Post from './models/Post.js';
import passport from './config/passport.js';



import dotenv from 'dotenv';
dotenv.config();


const app = express();
import cors from 'cors';
app.use(cors({
  origin: ['https://typora-web.vercel.app','http://localhost:3000', 'http://127.0.0.1:3000'], // Your React app's URL
  methods: ['GET', 'POST','PUT'],
  credentials: true,
  exposedHeaders: ['X-Session-ID'],
}));
// MongoDB 연결
connectDB();

// Redis
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

const redisClient = createClient({
  url: 'redis://localhost:6379',
});
redisClient.connect().catch(console.error);

// Initialize store
let redisStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});


// 미들웨어 추가
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:
    {
        secure:true,
        sameSite:'lax',
        httpOnly:true,
        maxAge:5 * 60 * 1000,
    },
    //proxy:true
}));
app.use(passport.initialize());
app.use(passport.session());


// 오류 처리
app.use((err, req, res, next) => {
    console.log(req.session)

});


// // marked 설정
// marked.setOptions({
//     renderer: new marked.Renderer(),
//     highlight: function(code, lang) {
//       const hljs = require('highlight.js');
//       const language = hljs.getLanguage(lang) ? lang : 'plaintext';
//       return hljs.highlight(code, { language }).value;
//     },
//     langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
//     pedantic: false,
//     gfm: true,
//     breaks: false,
//     sanitize: false,
//     smartLists: true,
//     smartypants: false,
//     xhtml: false
// });
  

// 라우트 설정
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
// import homeRoutes from './routes/home.js';


app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// 서버 시작
const PORT = process.env.PORT || 5102;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
