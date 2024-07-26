import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: [
      'https://typora-web.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
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

app.use((req, res, next) => {
    // console.log("SEEESSSIION",req.session);
    // console.log("SEESSIONIDDDDDD",req.sessionID);
    console.log("HEAADDER = ",req.header);
    console.log("REEEESSSSS = ",res.header);

    // console.log("req.property",req._passport.instance);
    next();
});

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
      console.log("isMatch"+isMatch);
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
  res.status(200).json('Login successful');

});

async function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
}


app.get('/', isAuthenticated, (req, res) => {
  console.log('AAAAAAAAAA GET/');
  res.json({ message: 'You are authenticated', user: req.user });
});




const PORT = 5102;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
