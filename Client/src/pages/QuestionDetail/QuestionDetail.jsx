import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import {
  FaEdit,
  FaTrash,
  FaReply,
  FaArrowLeft,
  FaEye,
  FaCheckCircle,
  FaRegCheckCircle,
  FaArrowUp,
} from 'react-icons/fa';
import classes from './QuestionDetail.module.css';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../../Components/CodeBlock/CodeBlock';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editQuestionTitle, setEditQuestionTitle] = useState('');
  const [editQuestionContent, setEditQuestionContent] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');

  const [pendingUpvoteId, setPendingUpvoteId] = useState(null);
  const [pendingAcceptId, setPendingAcceptId] = useState(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Tracks which question id's view has already been counted in this component instance.
  // Using the id itself (not a boolean) means it survives StrictMode's fake
  // unmount/remount cycle correctly, while still resetting naturally when the
  // component fully unmounts and remounts (e.g. a real page refresh).
  const countedIdRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Just fetches data — never has side effects on the server
  const fetchDetail = async () => {
    try {
      const quesRes = await axiosBase.get(`/questions/${id}`);
      const ansRes = await axiosBase.get(`/answers/question/${id}`);
      setQuestion(quesRes.data.question);
      setAnswers(ansRes.data.answers || []);

      setEditQuestionTitle(quesRes.data.question?.title || '');
      setEditQuestionContent(quesRes.data.question?.content || '');
    } catch (err) {
      console.error('Error retrieving question thread:', err);
      setActionError('Could not load this question. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();

    // Register exactly one view per real visit to this question id.
    // No cleanup function resets this ref — that was what caused the double count.
    if (countedIdRef.current !== id) {
      countedIdRef.current = id;
      axiosBase.post(`/questions/${id}/view`).catch((err) => {
        console.error('Failed to register view:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isQuestionOwner = user && Number(user.user_id) === Number(question?.user_id);

  // ---- Question operations -------------------------------------------
  const handleUpdateQuestion = async () => {
    if (!editQuestionTitle.trim() || !editQuestionContent.trim()) {
      setActionError('Title and details cannot be empty.');
      return;
    }
    try {
      setActionError('');
      await axiosBase.put(
        `/questions/${id}`,
        { title: editQuestionTitle.trim(), content: editQuestionContent.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditingQuestion(false);
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update the question.');
    }
  };

  const handleDeleteQuestion = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this question? This removes all of its answers too.'
      )
    )
      return;
    try {
      await axiosBase.delete(`/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error deleting this question.');
    }
  };

  // ---- Answer operations ------------------------------------------------
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      setIsSubmittingAnswer(true);
      setActionError('');
      await axiosBase.post(
        '/answers',
        { question_id: id, content: newAnswer.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAnswer('');
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error publishing your answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleUpdateAnswer = async (ansId) => {
    if (!editAnswerContent.trim()) return;
    try {
      await axiosBase.put(
        `/answers/${ansId}`,
        { content: editAnswerContent.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingAnswerId(null);
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update this answer.');
    }
  };

  const handleDeleteAnswer = async (ansId) => {
    if (!window.confirm('Delete this answer permanently?')) return;
    try {
      await axiosBase.delete(`/answers/delete/${ansId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete this answer.');
    }
  };

  const handleUpvote = async (ansId) => {
    if (!token) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      setPendingUpvoteId(ansId);
      await axiosBase.put(
        `/answers/${ansId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register your upvote.');
    } finally {
      setPendingUpvoteId(null);
    }
  };

  const handleToggleAccept = async (ansId) => {
    try {
      setPendingAcceptId(ansId);
      await axiosBase.put(
        `/answers/${ansId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update the accepted answer.');
    } finally {
      setPendingAcceptId(null);
    }
  };

  if (loading) {
    return (
      <div className={classes.loaderContainer}>
        <div className={classes.spinner} />
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <button type="button" onClick={() => navigate(-1)} className={classes.backBtn}>
        <FaArrowLeft aria-hidden="true" /> Back to Dashboard
      </button>

      {actionError && (
        <div className={classes.actionErrorBanner} role="alert">
          {actionError}
        </div>
      )}

      {/* Question */}
      <section className={classes.questionSection}>
        {isEditingQuestion ? (
          <div className={classes.editFormWrapper}>
            <input
              type="text"
              value={editQuestionTitle}
              onChange={(e) => setEditQuestionTitle(e.target.value)}
              className={classes.editInput}
              placeholder="Question title..."
            />
            <textarea
              value={editQuestionContent}
              onChange={(e) => setEditQuestionContent(e.target.value)}
              className={classes.textarea}
              placeholder="Provide context using markdown..."
              rows={8}
            />
            <div className={classes.controlActionGroup}>
              <button onClick={handleUpdateQuestion} className={classes.saveBtn}>
                Update Question
              </button>
              <button onClick={() => setIsEditingQuestion(false)} className={classes.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={classes.questionHeaderRow}>
              <div className={classes.statusGroup}>
                {question?.is_solved ? (
                  <span className={classes.solvedBadge}>
                    <FaCheckCircle aria-hidden="true" /> Solved
                  </span>
                ) : (
                  <span className={classes.openBadge}>Open</span>
                )}
                <span className={classes.metaStat}>
                  <FaEye aria-hidden="true" /> {question?.views ?? 0} views
                </span>
              </div>
              {isQuestionOwner && (
                <div className={classes.ownerControlCluster}>
                  <button
                    onClick={() => setIsEditingQuestion(true)}
                    className={classes.inlineEditAction}
                  >
                    <FaEdit aria-hidden="true" /> Edit
                  </button>
                  <button onClick={handleDeleteQuestion} className={classes.inlineDeleteAction}>
                    <FaTrash aria-hidden="true" /> Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className={classes.qTitle}>{question?.title}</h1>

            <div className={classes.qAuthorRow}>
              {question?.profile_image ? (
                <img src={question.profile_image} className={classes.smallAvatarImg} alt="" />
              ) : (
                <div className={classes.smallAvatarLetter}>
                  {question?.userName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span>
                Asked by <strong>{question?.userName}</strong>
              </span>
            </div>

            <div className={classes.qDescription}>
              <ReactMarkdown components={{ code: CodeBlock }}>
                {question?.content || ''}
              </ReactMarkdown>
            </div>
          </>
        )}
      </section>

      <div className={classes.sectionDividerLabel}>
        <span>Community Answers ({answers.length})</span>
        <div className={classes.labelLine} />
      </div>

      {/* Answers */}
      <div className={classes.answerList}>
        {answers.length > 0 ? (
          answers.map((ans) => {
            const isAnswerOwner = user && Number(user.user_id) === Number(ans.user_id);

            return (
              <div
                key={ans.answer_id}
                className={`${classes.answerCard} ${
                  ans.is_accepted ? classes.acceptedAnswerCard : ''
                }`}
              >
                {ans.is_accepted && (
                  <div className={classes.acceptedFlag}>
                    <FaCheckCircle aria-hidden="true" /> Accepted Answer
                  </div>
                )}

                <div className={classes.answerBodyRow}>
                  <div className={classes.userSide}>
                    {ans.profile_image ? (
                      <img
                        src={ans.profile_image}
                        className={classes.answerAvatarImg}
                        alt=""
                      />
                    ) : (
                      <div className={classes.userAvatarLetter}>
                        {ans.userName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className={classes.ansUserName}>{ans.userName}</span>

                    <button
                      type="button"
                      className={classes.upvoteBtn}
                      onClick={() => handleUpvote(ans.answer_id)}
                      disabled={pendingUpvoteId === ans.answer_id}
                      title="Upvote this answer"
                    >
                      <FaArrowUp aria-hidden="true" />
                      <span className={classes.upvoteCount}>{ans.upvotes ?? 0}</span>
                    </button>

                    {isQuestionOwner && (
                      <button
                        type="button"
                        className={`${classes.acceptBtn} ${
                          ans.is_accepted ? classes.acceptBtnActive : ''
                        }`}
                        onClick={() => handleToggleAccept(ans.answer_id)}
                        disabled={pendingAcceptId === ans.answer_id}
                        title={ans.is_accepted ? 'Unaccept this answer' : 'Accept this answer'}
                      >
                        {ans.is_accepted ? (
                          <FaCheckCircle aria-hidden="true" />
                        ) : (
                          <FaRegCheckCircle aria-hidden="true" />
                        )}
                        {ans.is_accepted ? 'Accepted' : 'Accept'}
                      </button>
                    )}
                  </div>

                  <div className={classes.ansBody}>
                    {editingAnswerId === ans.answer_id ? (
                      <div className={classes.inlineEditForm}>
                        <textarea
                          value={editAnswerContent}
                          onChange={(e) => setEditAnswerContent(e.target.value)}
                          className={classes.textarea}
                          rows={6}
                        />
                        <div className={classes.editBtns}>
                          <button
                            onClick={() => handleUpdateAnswer(ans.answer_id)}
                            className={classes.saveBtn}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingAnswerId(null)}
                            className={classes.cancelBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={classes.renderedOutputText}>
                        <ReactMarkdown components={{ code: CodeBlock }}>
                          {ans.content}
                        </ReactMarkdown>

                        {isAnswerOwner && (
                          <div className={classes.actionsBottom}>
                            <button
                              onClick={() => {
                                setEditingAnswerId(ans.answer_id);
                                setEditAnswerContent(ans.content);
                              }}
                              className={classes.actionLinkIcon}
                            >
                              <FaEdit aria-hidden="true" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(ans.answer_id)}
                              className={classes.actionLinkIconDelete}
                            >
                              <FaTrash aria-hidden="true" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={classes.emptyStateDeck}>
            <p>No answers yet. Be the first to help out below.</p>
          </div>
        )}
      </div>

      {/* Post an answer */}
      <div className={classes.formSection}>
        {token ? (
          <>
            <div className={classes.formIntroTitleRow}>
              <FaReply className={classes.replyGraphicIcon} aria-hidden="true" />
              <h3>Post Your Answer</h3>
            </div>
            <p className={classes.markdownTipLabel}>Markdown and code blocks (```) are supported.</p>
            <form onSubmit={handlePostAnswer} className={classes.submissionForm}>
              <textarea
                className={classes.textarea}
                placeholder="Share a clear, complete answer..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={6}
                required
              />
              <button
                type="submit"
                className={classes.postBtn}
                disabled={!newAnswer.trim() || isSubmittingAnswer}
              >
                {isSubmittingAnswer ? 'Posting...' : 'Post Your Answer'}
              </button>
            </form>
          </>
        ) : (
          <div className={classes.authCalloutCard}>
            <h3>Know the answer to this question?</h3>
            <p>Sign in to contribute your solution and help others in the community.</p>
            <button
              onClick={() => navigate('/login', { state: { from: location } })}
              className={classes.authRedirectBtn}
            >
              Sign In to Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;