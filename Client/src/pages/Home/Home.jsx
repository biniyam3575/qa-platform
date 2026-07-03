import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './Home.module.css';
import { FaUserCircle, FaChevronRight, FaSearch } from "react-icons/fa";

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch user data safely ONLY if a token exists
        if (token) {
          try {
            const userRes = await axiosBase.get('/users/profile'); 
            setUser(userRes.data.data);
          } catch (authErr) {
            console.warn("User auth context invalid or expired:", authErr);
          }
        }

        // 2. Fetch All Questions publicly
        const quesRes = await axiosBase.get('/questions');
        setQuestions(quesRes.data.questions || []);
      } catch (err) {
        console.error("Error fetching discussion board resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Search Logic Filter
  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.userName && q.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={classes.loaderWrapper}>
        <div className={classes.spinner}></div>
        <p>Loading discussions...</p>
      </div>
    );
  }

  return (
    <div className={classes.homeWrapper}>
      {/* Upper Interactive Area */}
      <div className={classes.dashboardHeader}>
        <div className={classes.titleBlock}>
          <h1 className={classes.mainHeading}>Community Dashboard</h1>
          <p className={classes.welcomeText}>
            Welcome, <span className={classes.userName}>{user ? user.userName : 'Guest'}</span>
          </p>
        </div>
        <Link to="/ask" className={classes.askBtn}>
          Ask Question
        </Link>
      </div>

      {/* Styled Interactive Search Block */}
      <div className={classes.searchContainer}>
        <FaSearch className={classes.searchIcon} />
        <input
          type="text"
          placeholder="Search for an engineering question or user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={classes.searchInput}
        />
      </div>

      <div className={classes.sectionLabelDivider}>
        <span>Recent Activity Discussions</span>
        <div className={classes.line}></div>
      </div>

      {/* Active Post Cards Queue */}
      <div className={classes.listContainer}>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => {
            // Feature Implementation: Detect if this item belongs to the active logged-in user
            // Checks user_id or username fallback match cleanly depending on your exact DB layout schema
            const isOwnQuestion = user && (user.user_id === q.user_id || user.userName === q.userName);

            return (
              <Link 
                to={`/question/${q.question_id}`} 
                key={q.question_id} 
                className={`${classes.questionCard} ${isOwnQuestion ? classes.ownQuestionCard : ''}`}
              >
                <div className={classes.cardLeftSection}>
                  <div className={classes.avatarWrapper}>
                     {q.profile_image ? (
                       <img src={q.profile_image} alt={`${q.userName} profile`} className={classes.userAvatarImg} />
                     ) : (
                       <FaUserCircle size={40} className={classes.defaultIconAvatar} />
                     )}
                  </div>
                  <div className={classes.metaDetails}>
                    <div className={classes.titleInlineGroup}>
                      <h3 className={classes.qTitle}>{q.title}</h3>
                      
                      {/* Brand-New Operational Feature Badge: Displays uniquely for ownership */}
                      {isOwnQuestion && (
                        <span className={classes.userOwnerBadge}>You Asked</span>
                      )}
                    </div>
                    <span className={classes.authorStamp}>
                      Asked by <strong className={classes.authorHighlight}>{isOwnQuestion ? 'You' : q.userName}</strong>
                    </span>
                  </div>
                </div>
                
                <div className={classes.arrowIconWrapper}>
                  <FaChevronRight className={classes.actionChevron} />
                </div>
              </Link>
            );
          })
        ) : (
          <div className={classes.noDataCard}>
            <h3>No results found</h3>
            <p>{searchQuery ? "We couldn't find matches for your search. Double-check your spelling or look up another topic." : "The forum database queue is currently empty."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;