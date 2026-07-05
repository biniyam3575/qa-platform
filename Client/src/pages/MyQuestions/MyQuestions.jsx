import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './MyQuestions.module.css';
import {
  FaArrowLeft,
  FaEye,
  FaCircleCheck,
  FaRegCommentDots,
  FaRegClock,
  FaTrashCan,

} from 'react-icons/fa6';
import { FaRegQuestionCircle } from 'react-icons/fa';
const SkeletonCard = () => (
  <div className={classes.skeletonCard}>
    <div className={classes.skeletonLines}>
      <div className={`${classes.skeletonLine} ${classes.skeletonLineWide} ${classes.shimmer}`} />
      <div className={`${classes.skeletonLine} ${classes.skeletonLineFull} ${classes.shimmer}`} />
      <div className={`${classes.skeletonLine} ${classes.skeletonLineNarrow} ${classes.shimmer}`} />
    </div>
  </div>
);

const MyQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchMyQuestions = async () => {
      try {
        const { data } = await axiosBase.get('/questions/user/me');
        if (data && data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error('Error pulling user questions:', err);
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
      setDeletingId(questionId);
      const { data } = await axiosBase.delete(`/questions/${questionId}`);
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q.question_id !== questionId));
      }
    } catch (err) {
      console.error('Delete request failed:', err);
      setError('Could not complete deletion. Please try again later.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={classes.pageContainer}>
      <button type="button" onClick={() => navigate('/')} className={classes.backBtn}>
        <FaArrowLeft aria-hidden="true" /> Back to Dashboard
      </button>

      {/* Header */}
      <section className={classes.pageHeader}>
        <p className={classes.eyebrow}>Your activity</p>
        <h1 className={classes.mainHeading}>My Questions</h1>
        <p className={classes.subheading}>
          Review, manage, and track activity on discussions you started.
        </p>
      </section>

      {error && (
        <div className={classes.errorBanner} role="alert">
          {error}
        </div>
      )}

      {/* Section divider with live count */}
      {!loading && questions.length > 0 && (
        <div className={classes.sectionLabelDivider}>
          <span className={classes.sectionLabel}>Your Discussions</span>
          <span className={classes.countPill}>
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
          </span>
          <div className={classes.line} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className={classes.listContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className={classes.emptyState}>
          <FaRegQuestionCircle size={40} className={classes.emptyIcon} aria-hidden="true" />
          <h3>No questions asked yet</h3>
          <p>When you post a question on the platform, it will show up right here.</p>
          <button type="button" onClick={() => navigate('/ask')} className={classes.askBtn}>
            Ask Your First Question
          </button>
        </div>
      ) : (
        <div className={classes.listContainer}>
          {questions.map((question) => (
            <div
              key={question.question_id}
              className={`${classes.questionCard} ${
                question.is_solved ? classes.solvedQuestionCard : ''
              }`}
              onClick={() => navigate(`/question/${question.question_id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/question/${question.question_id}`);
              }}
            >
              <div className={classes.cardMainContent}>
                <div className={classes.titleInlineGroup}>
                  {question.is_solved ? (
                    <span className={classes.solvedBadge}>
                      <FaCircleCheck aria-hidden="true" /> Solved
                    </span>
                  ) : (
                    <span className={classes.openBadge}>Open</span>
                  )}
                  <h3 className={classes.qTitle}>{question.title}</h3>
                </div>

                <p className={classes.qDescription}>
                  {question.content?.length > 160
                    ? `${question.content.substring(0, 160)}...`
                    : question.content}
                </p>

                <div className={classes.metadataRow}>
                  <span className={classes.metaDetail}>
                    <FaRegClock aria-hidden="true" />
                    {new Date(question.created_at).toLocaleDateString()}
                  </span>
                  <span className={classes.metaDetail}>
                    <FaRegCommentDots aria-hidden="true" />
                    {question.answer_count ?? 0} answers
                  </span>
                  <span className={classes.metaDetail}>
                    <FaEye aria-hidden="true" />
                    {question.views ?? 0} views
                  </span>
                </div>
              </div>

              <div className={classes.cardActions}>
                <button
                  type="button"
                  className={classes.deleteActionBtn}
                  onClick={(e) => handleDelete(question.question_id, e)}
                  disabled={deletingId === question.question_id}
                  title="Delete question"
                >
                  <FaTrashCan aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuestions;