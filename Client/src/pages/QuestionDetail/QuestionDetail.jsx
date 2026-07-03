import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import { FaEdit, FaTrash, FaUserCircle, FaReply } from 'react-icons/fa';
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

  // Editing Actions States
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editQuestionTitle, setEditQuestionTitle] = useState('');
  const [editQuestionContent, setEditQuestionContent] = useState('');

  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchDetail = async () => {
    try {
      const quesRes = await axiosBase.get(`/questions/${id}`);
      const ansRes = await axiosBase.get(`/answers/question/${id}`);
      setQuestion(quesRes.data.question);
      setAnswers(ansRes.data.answers || []);
      
      setEditQuestionTitle(quesRes.data.question?.title || '');
      setEditQuestionContent(quesRes.data.question?.content || '');
    } catch (err) {
      console.error("Error retrieving conversation metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Question Management Core Operations
  const handleUpdateQuestion = async () => {
    if (!editQuestionTitle.trim() || !editQuestionContent.trim()) return alert("Fields cannot be empty.");
    try {
      await axiosBase.put(`/questions/${id}`, {
        title: editQuestionTitle,
        content: editQuestionContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditingQuestion(false);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to modify question properties.");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm("Are you completely sure you want to delete this question? This removes all associated answers.")) return;
    try {
      await axiosBase.delete(`/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting question payload.");
    }
  };

  // Answer Management Core Operations
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      await axiosBase.post('/answers', {
        question_id: id,
        content: newAnswer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewAnswer('');
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || "Error publishing community solution.");
    }
  };

  const handleUpdateAnswer = async (ansId) => {
    if (!editAnswerContent.trim()) return;
    try {
      await axiosBase.put(`/answers/${ansId}`, 
        { content: editAnswerContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingAnswerId(null);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || "Answer update transaction failed.");
    }
  };

  const handleDeleteAnswer = async (ansId) => {
    if (!window.confirm("Delete this answer permanently?")) return;
    try {
      await axiosBase.delete(`/answers/delete/${ansId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDetail();
    } catch (err) {
      // Direct diagnostic check alerts the actual system payload response (e.g., 403 Forbidden)
      alert(err.response?.data?.message || "Failed to clear answer node.");
    }
  };

  if (loading) {
    return (
      <div className={classes.loaderContainer}>
        <div className={classes.spinner}></div>
        <p>Parsing conversation node...</p>
      </div>
    );
  }

  // Cross-reference data safely converting types down to primitive numbers if necessary
  const isQuestionOwner = user && Number(user.user_id) === Number(question?.user_id);

  return (
    <div className={classes.container}>
      {/* Question Container Grid Layer */}
      <section className={classes.questionSection}>
        {isEditingQuestion ? (
          <div className={classes.editFormWrapper}>
            <input 
              type="text"
              value={editQuestionTitle}
              onChange={(e) => setEditQuestionTitle(e.target.value)}
              className={classes.editInput}
              placeholder="Question headline Title..."
            />
            <textarea
              value={editQuestionContent}
              onChange={(e) => setEditQuestionContent(e.target.value)}
              className={classes.textarea}
              placeholder="Provide context using markdown..."
            />
            <div className={classes.controlActionGroup}>
              <button onClick={handleUpdateQuestion} className={classes.saveBtn}>Update Question</button>
              <button onClick={() => setIsEditingQuestion(false)} className={classes.cancelBtn}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className={classes.questionHeaderRow}>
              <span className={classes.sectionLabel}>Technical Thread</span>
              {isQuestionOwner && (
                <div className={classes.ownerControlCluster}>
                  <button onClick={() => setIsEditingQuestion(true)} className={classes.inlineEditAction} title="Edit Thread">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={handleDeleteQuestion} className={classes.inlineDeleteAction} title="Drop Thread">
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </div>
            <h1 className={classes.qTitle}>{question?.title}</h1>
            <div className={classes.qDescription}>
              <ReactMarkdown components={{ code: CodeBlock }}>{question?.content}</ReactMarkdown>
            </div>
          </>
        )}
      </section>

      <div className={classes.sectionDividerLabel}>
        <span>Community Solutions ({answers.length})</span>
        <div className={classes.labelLine}></div>
      </div>

      {/* Answers System Layout Stack */}
      <div className={classes.answerList}>
        {answers.length > 0 ? (
          answers.map((ans) => {
            const isAnswerOwner = user && Number(user.user_id) === Number(ans.user_id);

            return (
              <div key={ans.answer_id} className={classes.answerCard}>
                <div className={classes.userSide}>
                  {ans.profile_image ? (
                    <img src={ans.profile_image} className={classes.answerAvatarImg} alt={`${ans.userName}`} />
                  ) : (
                    <div className={classes.userAvatarLetter}>
                      {ans.userName?.[0].toUpperCase() || '?'}
                    </div>
                  )}
                  <span className={classes.ansUserName}>{ans.userName}</span>
                </div>

                <div className={classes.ansBody}>
                  {editingAnswerId === ans.answer_id ? (
                    <div className={classes.inlineEditForm}>
                      <textarea
                        value={editAnswerContent}
                        onChange={(e) => setEditAnswerContent(e.target.value)}
                        className={classes.textarea}
                      />
                      <div className={classes.editBtns}>
                        <button onClick={() => handleUpdateAnswer(ans.answer_id)} className={classes.saveBtn}>Save Modifications</button>
                        <button onClick={() => setEditingAnswerId(null)} className={classes.cancelBtn}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={classes.renderedOutputText}>
                      <ReactMarkdown components={{ code: CodeBlock }}>{ans.content}</ReactMarkdown>
                      
                      {isAnswerOwner && (
                        <div className={classes.actionsBottom}>
                          <button onClick={() => { setEditingAnswerId(ans.answer_id); setEditAnswerContent(ans.content); }} className={classes.actionLinkIcon}>
                            <FaEdit /> Modify
                          </button>
                          <button onClick={() => handleDeleteAnswer(ans.answer_id)} className={classes.actionLinkIconDelete}>
                            <FaTrash /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className={classes.emptyStateDeck}>
            <p>No architecture solutions provided yet. Be the first to start the engineering discussion below.</p>
          </div>
        )}
      </div>

      {/* Public vs Private Protected Dynamic Submit Container */}
      <div className={classes.formSection}>
        {token ? (
          <>
            <div className={classes.formIntroTitleRow}>
              <FaReply className={classes.replyGraphicIcon} />
              <h3>Contribute Your Professional Insight</h3>
            </div>
            <p className={classes.markdownTipLabel}>Supports markdown syntax snippets (```) seamlessly.</p>
            <form onSubmit={handlePostAnswer} className={classes.submissionForm}>
              <textarea
                className={classes.textarea}
                placeholder="Compose complete architectural instructions or code solution modules..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                required
              />
              <button type="submit" className={classes.postBtn} disabled={!newAnswer.trim()}>
                Publish Solution
              </button>
            </form>
          </>
        ) : (
          <div className={classes.authCalloutCard}>
            <h3>Know the answer to this thread?</h3>
            <p>Join our open academic engineering community platform to contribute your development solutions and track technical code insights.</p>
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