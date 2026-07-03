import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './MyQuestions.module.css';
import { FaRegMessage, FaRegClock, FaTrashCan, FaArrowLeft } from 'react-icons/fa6';
import { FaRegQuestionCircle } from 'react-icons/fa'; // Fixed icon import bundle

const MyQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyQuestions = async () => {
      try {
        // FIXED: URL changed to match your backend path exactly (/user/me)
        const { data } = await axiosBase.get('/questions/user/me'); 
        if (data && data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Error pulling user questions:", err);
        setError('Failed to load your questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyQuestions();
  }, []);

  const handleDelete = async (questionId, e) => {
    e.stopPropagation(); 
    if (!window.confirm('Are you sure you want to permanently delete this question?')) return;

    try {
      const { data } = await axiosBase.delete(`/questions/${questionId}`);
      if (data.success) {
        setQuestions(questions.filter((q) => q.question_id !== questionId));
      }
    } catch (err) {
      console.error("Delete request failed:", err);
      alert('Could not complete deletion. Please try again later.');
    }
  };

  if (loading) return <div className={classes.loader}>Loading your questions...</div>;

  return (
    <div className={classes.pageContainer}>
      <div className={classes.topNavRow}>
        <button onClick={() => navigate('/')} className={classes.backDashboardBtn}>
          <FaArrowLeft /> Back to Home
        </button>
      </div>

      <div className={classes.contentCard}>
        <div className={classes.cardHeader}>
          <h2>My Questions</h2>
          <p>Review, manage, and track activity on discussions you started</p>
        </div>

        {error && <div className={classes.errorBanner}>{error}</div>}

        {questions.length === 0 ? (
          <div className={classes.emptyState}>
            <FaRegQuestionCircle size={48} className={classes.emptyIcon} />
            <h3>No questions asked yet</h3>
            <p>When you post a question on the platform, it will show up right here.</p>
            <button onClick={() => navigate('/ask')} className={classes.askBtn}>
              Ask Your First Question
            </button>
          </div>
        ) : (
          <div className={classes.questionsList}>
            {questions.map((question) => (
              <div 
                key={question.question_id} 
                className={classes.questionItem}
                onClick={() => navigate(`/question/${question.question_id}`)}
              >
                <div className={classes.questionMainContent}>
                  <h3 className={classes.questionTitle}>{question.title}</h3>
                  {/* FIXED: Changed question.description to question.content */}
                  <p className={classes.questionDescription}>
                    {question.content?.length > 160 
                      ? `${question.content.substring(0, 160)}...` 
                      : question.content}
                  </p>
                  
                  <div className={classes.metadataRow}>
                    <span className={classes.metaDetail}>
                      <FaRegClock /> {new Date(question.created_at).toLocaleDateString()}
                    </span>
                    {/* FIXED: your custom route returns total answers as answer_count, or default to 0 */}
                    <span className={classes.metaDetail}>
                      <FaRegMessage /> {question.answer_count || 0} answers
                    </span>
                  </div>
                </div>

                <div className={classes.questionActions}>
                  <button 
                    className={classes.deleteActionBtn}
                    onClick={(e) => handleDelete(question.question_id, e)}
                    title="Delete Question"
                  >
                    <FaTrashCan />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuestions;