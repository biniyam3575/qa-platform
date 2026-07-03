import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import { FaArrowLeft } from 'react-icons/fa';
import classes from './AskQuestion.module.css';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return alert("Please fill in both fields with valid context.");
    }

    try {
      setIsSubmitting(true);
      
      await axiosBase.post('/questions', {
        title: title.trim(),
        content: content.trim()
      });

      alert("Question posted successfully!");
      navigate('/'); 
    } catch (err) {
      console.error("Failed to commit question node payload:", err);
      alert("Error: " + (err.response?.data?.message || "Could not publish question thread"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.container}>
      {/* Interactive Navigation Link Layer */}
      <div className={classes.navigationHeader}>
        <button onClick={() => navigate(-1)} className={classes.backBtn} title="Return to previous node">
          <FaArrowLeft className={classes.arrowIcon} /> Back to Dashboard
        </button>
      </div>

      {/* Instructional Header */}
      <section className={classes.instructions}>
        <h2>Steps to write a good question</h2>
        <ul>
          <li>Summarize your problem in a one-line title.</li>
          <li>Describe your problem in more detail.</li>
          <li>Explain what you tried and what you expected to happen.</li>
          <li>Review your question layout and post it to the community grid.</li>
        </ul>
      </section>

      {/* Public Question Submission Form */}
      <div className={classes.formCard}>
        <h3 className={classes.formTitle}>Ask a public question</h3>
        <form onSubmit={handleSubmit} className={classes.formLayout}>
          <div className={classes.inputGroup}>
            <input 
              type="text" 
              placeholder="Title (e.g., 'STP port transition stuck in listening state')" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required 
            />
          </div>
          <div className={classes.inputGroup}>
            <textarea 
              placeholder="Provide clean context or markdown syntax configurations here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className={classes.submitBtn} 
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? "Publishing Transaction..." : "Post Your Question"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;