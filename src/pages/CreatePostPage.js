import React from "react";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import CreatePost from "../components/post/CreatePost";

function CreatePostPage() {
  return (
    <>
      <Header />
      <CreatePost />
      <Footer />
    </>
  );
}

export default CreatePostPage;