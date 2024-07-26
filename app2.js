import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const app = express();

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

import cors from 'cors';
app.use(
  cors({
    origin: [
      'https://typora-web.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    exposedHeaders: ['X-Session-ID'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: redisStore,
    secret:
      'd291fb4622fbcff52762f07aed63998273ca2f30c743548c3773a7d7539d222242e0d0f381091d2ac8f1cf5ffba360b739e9e65e6840542e6fc40063ed9df079',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // 개발 환경에서는 false, 프로덕션에서는 true
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const users = [
  {
    id: 1,
    username: '1',
    password: '1', // plain 'password' for simplicity
  },
];

// Passport local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = users.find((u) => u.username === username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = password === user.password;
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user);
});

// Routes
app.post('/login', passport.authenticate('local'), (req, res) => {
  // console.log('Response headers:', res.getHeaders());
  res.setHeader('X-Session-ID', req.sessionID);
  res.status(200).send('Login successful');
  // res.setHeader('X-Session-ID', req.sessionID);

});

async function isAuthenticated(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  console.log("ISAUTHEN Session:", sessionId);
  console.log("Checking authentication...");

  if (!sessionId) {
    return res.status(401).json({ message: 'No session ID provided' });
  }

  const redisKey = `sess:${sessionId}`;
  console.log(redisKey);
  try {
    const sessionData = await redisClient.get(redisKey);
    if (!sessionData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sessionObj = JSON.parse(sessionData);
    if (sessionObj.passport && sessionObj.passport.user) {
      req.user = sessionObj.passport.user;
      req.sessionID = sessionId; // Update the sessionID in the request
      return next();
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Error accessing Redis:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}


app.get('/', isAuthenticated, (req, res) => {
  console.log('GET /');
  res.json({ message: 'You are authenticated', user: req.user });
});

const PORT = 5102;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
