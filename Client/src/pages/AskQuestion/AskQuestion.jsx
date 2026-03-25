import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './AskQuestion.module.css';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      return alert("Please fill in both fields.");
    }

    try {
      // The Interceptor in axiosConfig handles the Authorization header
      await axiosBase.post('/questions', {
        title: title,
        content: content
      });

      alert("Question posted successfully!");
      navigate('/'); // Go back to Home to see the new question
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || "Could not post question"));
    }
  };

  return (
    <div className={classes.container}>
      {/* 1. Instructional Header */}
      <div className={classes.instructions}>
        <h2>Steps to write a good question</h2>
        <ul>
          <li>Summarize your problem in a one-line title.</li>
          <li>Describe your problem in more detail.</li>
          <li>Explain what you tried and what you expected to happen.</li>
          <li>Review your question and post it to the site.</li>
        </ul>
      </div>

      {/* 2. The Form */}
      <div className={classes.formCard}>
        <h3 style={{textAlign: 'center', marginBottom: '20px'}}>Ask a public question</h3>
        <form onSubmit={handleSubmit}>
          <div className={classes.inputGroup}>
            <input 
              type="text" 
              placeholder="Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          <div className={classes.inputGroup}>
            <textarea 
              placeholder="Question Description..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={classes.submitBtn}>
            Post Your Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;