import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import { FaUserCircle } from 'react-icons/fa';
import classes from './QuestionDetail.module.css';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../../Components/CodeBlock/CodeBlock'; // Assuming it is in the same folder

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');

  const fetchDetail = async () => {
    try {
      const quesRes = await axiosBase.get(`/questions/${id}`); 
      const ansRes = await axiosBase.get(`/answers/question/${id}`);
      setQuestion(quesRes.data.question);
      setAnswers(ansRes.data.answers);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) {
      return alert("Please type an answer before posting.");
    }

    try {
      await axiosBase.post('/answers', {
        question_id: id,
        content: newAnswer
      });

      setNewAnswer('');
      fetchDetail(); 
    } catch (err) {
      console.log("Error posting answer:", err.response?.data);
      alert("Error: " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className={classes.container}>
      <section className={classes.questionSection}>
        <h2 className={classes.headerTitle}>QUESTION</h2>
        <h3 className={classes.qTitle}>{question?.title}</h3>
        <p className={classes.qDescription}>{question?.content}</p>
      </section>

      <hr className={classes.divider} />

      <h2 className={classes.answerHeader}>Answers From The Community</h2>
      
      <div className={classes.answerList}>
        {answers.length > 0 ? (
          answers.map((ans) => (
            <div key={ans.answer_id} className={classes.answerCard}>
              <div className={classes.userSide}>
                {ans.profile_image ? (
                  <img src={ans.profile_image} className={classes.answer_avatar_img} alt="user" />
                ) : (
                  <div className={classes.userAvatarLetter}>
                    {ans.userName?.[0].toUpperCase()}
                  </div>
                )}
                <span className={classes.ansUserName}>{ans.userName}</span>
              </div>
              <div className={classes.ansBody}>
                {/* This part parses the text and uses your CodeBlock for code snippets */}
                <ReactMarkdown components={{ code: CodeBlock }}>
                  {ans.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        ) : (
          <p className={classes.noAnswers}>No answers yet.</p>
        )}
      </div>

      <div className={classes.formSection}>
        <h3>Answer The Top Question</h3>
        <form onSubmit={handlePostAnswer}>
          <textarea
            className={classes.textarea}
            placeholder="Your answer... (Use ``` for code blocks)"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            required
          />
          <button type="submit" className={classes.postBtn}>
            Post Answer
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionDetail;