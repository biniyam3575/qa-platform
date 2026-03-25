import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './QuestionDetail.module.css';

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');

  // Move fetchDetail outside so it can be reused after posting
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
  
  // 1. Validation: Don't even send the request if the box is empty
  if (!newAnswer.trim()) {
    return alert("Please type an answer before posting.");
  }

  try {
    // 2. The Request
    // Ensure 'question_id' matches exactly what your backend 'req.body' looks for
    await axiosBase.post('/answers', {
      question_id: id,   // This 'id' comes from useParams()
      content: newAnswer // This comes from your textarea state
    });

    // 3. Success Actions
    setNewAnswer(''); // Clear the box
    fetchDetail();    // Reload the answers list
    
  } catch (err) {
    // This is where your current error is being caught
    console.log("Full Error Object:", err.response?.data);
    alert("Error posting answer: " + (err.response?.data?.message || "Server Error"));
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
            <div className={classes.userAvatar}>
              {ans.userName?.[0].toUpperCase()}
            </div>
            <div className={classes.ansBody}>
              <strong>{ans.userName}</strong>
              <p>{ans.content}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No answers yet.</p>
      )}
    </div>

    <div className={classes.formSection}>
      <h3>Answer The Top Question</h3>
      <form onSubmit={handlePostAnswer}>
        <textarea
          className={classes.textarea}
          placeholder="Your answer..."
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