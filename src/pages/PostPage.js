import React,{useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import Post from "../components/post/Post";

const endpoint = process.env.REACT_APP_ENDPOINT;

function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState();
    const [loading, setLoading] = useState(true);
    
    useEffect(()=>{
        const fetchPost = async ()=>{
            try{
                const response = await fetch(`${endpoint}/posts/${id}`);
                if(!response.ok){
                    throw new Error("http error3");
                }
                const data = await response.json();
                setPost(data);
                setLoading(false);
            }catch (err){
                console.error("Error4",err)
            }
        };
        fetchPost();
    },[id])

    if (loading) return <div>Loading...</div>;
    console.log(post);
  return (
    <>
      <Header />
      <Post post={post} />
      <Footer />
    </>
  );
}

export default PostPage;