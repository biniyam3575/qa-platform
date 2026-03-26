import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './Home.module.css';
import { FaUserCircle, FaChevronRight } from "react-icons/fa";

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get User Profile
        const userRes = await axiosBase.get('/users/profile'); 
        setUser(userRes.data.data);

        // 2. Get All Questions (Ensure backend JOINs users to get profile_image)
        const quesRes = await axiosBase.get('/questions');
        setQuestions(quesRes.data.questions || []);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search Logic
  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.userName && q.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className={classes.loading}>Loading discussions...</div>;

  return (
    <div className={classes.homeWrapper}>
      <div className={classes.topSection}>
        <Link to="/ask" className={classes.askBtn}>
          Ask Question
        </Link>
        <h2 className={classes.welcomeText}>
          Welcome, <span className={classes.userName}>{user?.userName}</span>
        </h2>
      </div>

      <div className={classes.searchContainer}>
        <input
          type="text"
          placeholder="Search for a question..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={classes.searchInput}
        />
      </div>

      <hr className={classes.horizontalLine} />

      <div className={classes.listContainer}>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <Link 
              to={`/question/${q.question_id}`} 
              key={q.question_id} 
              className={classes.questionCard}
            >
              <div className={classes.userInfo}>
                <div className={classes.avatar}>
                   {/* Updated to show Real Profile Image */}
                   {q.profile_image ? (
                     <img src={q.profile_image} alt="user" className={classes.user_avatar_img} />
                   ) : (
                     <FaUserCircle size={45} color="#555" />
                   )}
                   <p className={classes.avatarName}>{q.userName}</p>
                </div>
              </div>
              
              <div className={classes.questionContent}>
                <h3 className={classes.qTitle}>{q.title}</h3>
              </div>

              <div className={classes.arrowIcon}>
                <FaChevronRight color="#ccc" />
              </div>
            </Link>
          ))
        ) : (
          <div className={classes.noData}>
            {searchQuery ? "No questions match your search." : "No questions have been asked yet."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;