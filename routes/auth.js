import express from 'express';
import passport from '../config/passport.js'; // Adjust the path as necessary
const router = express.Router();
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ensureAuthenticated from '../middleware/ensureAuthenticated.js';


// 로그인
// 로그인
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.setHeader('X-Session-ID', req.sessionID);
  res.status(200).send('로그인!!');
});
// SIGN UP

// 회원가입
router.post('/register', async (req, res) => {

  
  try {
    const existingUser = await User.findOne({ 
      $or: [
        { email: req.body.email },
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 5);
    let newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      createdAt: new Date(),
      googleId:undefined
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.force-ssl'],
    // accessType: 'offline',
    // prompt:'consent'
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log("Google OAuth callback");
    console.log("Auth Info:", req.authInfo);
    console.log("User:", req.user);
    
    // accessToken과 refreshToken을 세션에 저장
    req.session.accessToken = req.authInfo.accessToken;
    req.session.refreshToken = req.authInfo.refreshToken;

    // console.log("Session before save:", req.session);
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/login');
      }
      console.log("Session saved successfully");

      const redirectUrl = new URL('http://localhost:3000/auth-success');
      redirectUrl.searchParams.append('sessionId', req.sessionID);
      res.redirect(redirectUrl.toString());
    });
  }
);
// 로그아웃

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
      res.clearCookie('connect.sid'); // 세션 쿠키 삭제
      res.json({ message: '로그아웃 성공' });
    });
  });
});


router.get('/verify', ensureAuthenticated, (req, res) => {
  console.log("verify Request 들어옴");

  
    console.log("사용자 인증됨");
    // 사용자가 인증되었다면
    res.status(200).json({ 
      authenticated: true, 
      userId: req.user,
      // 필요한 경우 추가 사용자 정보
      email: req.user.email,
      username: req.user.username
    });
});

router.get('/check-auth', ensureAuthenticated, (req, res) => {
  console.log("인증 상태 확인 요청 받음");
    console.log("세션 인증된 사용자 ID:", req.user);
    const safeUserInfo = {
      id: req.user,
      email: req.user.email,
      name: req.user.name,
      profilePicture: req.user.profilePicture
    };

    res.json({
      isAuthenticated: true,
      authType: 'session',
      user: safeUserInfo
    });
});

export default router;