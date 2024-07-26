// const express = require('express');
// const router = express.Router();
// const Post = require('../models/Post');
// const { ensureAuthenticated } = require('../middleware/auth');

// router.get('/', ensureAuthenticated, async (req, res) => {
//     try {
//       const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
//       res.json(posts);
//     } catch (error) {
//       console.error('Error fetching posts:', error);
//       res.status(500).render('error', { message: 'Internal Server Error' });
//     }
//   });

// router.get('/privacy-policy', (req, res) => {
//     res.render('privacy-policy', { title: '개인정보처리방침' });
// });


// module.exports = router;