const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

router.get('/post/:id', (req, res) => {
  res.render('post', { title: 'Blog Post', postId: req.params.id });
});

module.exports = router;