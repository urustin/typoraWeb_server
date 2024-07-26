import React, {useState, useEffect} from "react";
import { Link, useNavigate } from 'react-router-dom';
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import PostList from "../components/post/PostList";
import Home from "../components/home/Home";


const endpoint = process.env.REACT_APP_ENDPOINT;

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const sessionID = sessionStorage.getItem("sessionID");
          const response = await fetch(`${endpoint}/posts/`,{
            credentials: 'include',
            headers:{
              "x-session-id":sessionID,
            }
          }); // Assuming your backend API endpoint
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setPosts(data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching posts:", err);
          setError('Failed to fetch posts');
          setLoading(false);
        }
      };
  
      fetchPosts();
    }, []);
  
    if (loading) return <div>Loading...</div>;
    if (error){
      // console.log(error);
      // navigate('/login');
    } 

  return (
    <>
      <Header />
      <Home />
      <PostList posts={posts} />
      <Footer />
    </>
  );
}

export default HomePage;