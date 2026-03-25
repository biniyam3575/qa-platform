import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import axiosBase from '../../api/axiosConfig';
import classes from './Home.module.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        // 1. Fetch User Profile (Much cleaner)
        const userRes = await axiosBase.get('/users/profile');
        setUser(userRes.data.data);

        // 2. Fetch All Questions
        const quesRes = await axiosBase.get('/questions');
        setQuestions(quesRes.data.questions || []);
      } catch (err) {
        console.log("Error detail:", err.response?.data || err.message);
        // If 403, it means the token is dead. Send them to login.
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className={classes.homeContainer}>
      <div className={classes.headerRow}>
        <Link to="/ask" className={classes.askBtn}>Ask Question</Link>
        <h2 className={classes.welcomeText}>Welcome, {user?.userName}</h2>
      </div>

      <div className={classes.searchBar}>
        <input type="text" placeholder="Search for a question..." />
      </div>

      <div className={classes.questionList}>
        {questions.length > 0 ? (
          questions.map((q) => (
            <Link to={`/question/${q.question_id}`} key={q.question_id} className={classes.questionCard}>
              <div className={classes.userIcon}>
                <div className={classes.avatar}>{q.userName?.[0].toUpperCase()}</div>
                <p className={classes.userName}>{q.userName}</p>
              </div>
              <div className={classes.questionTitle}>
                <p>{q.title}</p>
              </div>
              <div className={classes.arrow}>&rsaquo;</div>
            </Link>
          ))
        ) : (
          <p>No questions found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;