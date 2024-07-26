import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
import CreatePost from './components/post/CreatePost';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthSuccess from './components/functions/AuthSuccess';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/create" element={<CreatePostPage />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:id" element={<CreatePost />} />
      </Routes>
    </Router>
  );
}

export default App;