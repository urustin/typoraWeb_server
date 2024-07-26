// src/components/Home.js
import React from 'react';

import styles from './Home.module.css';
import { useEffect } from 'react';

const endpoint = process.env.REACT_APP_ENDPOINT;


const Home = ({ children, title }) => {


  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await fetch(`${endpoint}/posts/test`);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
      } catch (err) {
        console.error('Error fetching test data:', err);
      }
    };

    fetchTestData();
  }, []);



  return (

    <main className={styles.home}>{children}</main>

  );
};

export default Home;