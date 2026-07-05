import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import { FaArrowLeft, FaLightbulb, FaSpinner } from 'react-icons/fa';
import classes from './AskQuestion.module.css';

const TITLE_MAX = 150;

const GUIDELINES = [
  'Summarize your problem in a one-line title.',
  'Describe your problem in more detail.',
  'Explain what you tried and what you expected to happen.',
  'Review your question layout and post it to the community.',
];

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Give your question a title.';
    if (!content.trim()) nextErrors.content = 'Add some detail so the community can help.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await axiosBase.post('/questions', {
        title: title.trim(),
        content: content.trim(),
      });
      navigate('/');
    } catch (err) {
      console.error('Failed to publish question:', err);
      setServerError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.container}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={classes.backBtn}
      >
        <FaArrowLeft aria-hidden="true" /> Back to Dashboard
      </button>

      <div className={classes.layout}>
        {/* Guidelines */}
        <aside className={classes.instructions}>
          <div className={classes.instructionsIcon}>
            <FaLightbulb aria-hidden="true" />
          </div>
          <h2 className={classes.instructionsTitle}>Write a good question</h2>
          <ol className={classes.instructionsList}>
            {GUIDELINES.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        </aside>

        {/* Form */}
        <div className={classes.formCard}>
          <h1 className={classes.formTitle}>Ask a public question</h1>
          <p className={classes.formSubtitle}>
            Your question will be visible to the whole community.
          </p>

          <form onSubmit={handleSubmit} className={classes.formLayout} noValidate>
            <div className={classes.inputGroup}>
              <div className={classes.labelRow}>
                <label htmlFor="question-title" className={classes.label}>
                  Title
                </label>
                <span className={classes.charCount}>
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                id="question-title"
                type="text"
                placeholder="e.g. STP port stuck in listening state"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                maxLength={TITLE_MAX}
                className={`${classes.textInput} ${errors.title ? classes.inputError : ''}`}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className={classes.fieldError}>
                  {errors.title}
                </p>
              )}
            </div>

            <div className={classes.inputGroup}>
              <label htmlFor="question-content" className={classes.label}>
                Details
              </label>
              <textarea
                id="question-content"
                placeholder="Provide context, what you tried, and what you expected to happen..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                }}
                className={`${classes.textArea} ${errors.content ? classes.inputError : ''}`}
                aria-invalid={!!errors.content}
                aria-describedby={errors.content ? 'content-error' : undefined}
                rows={8}
              />
              {errors.content && (
                <p id="content-error" className={classes.fieldError}>
                  {errors.content}
                </p>
              )}
            </div>

            {serverError && (
              <div className={classes.serverError} role="alert">
                {serverError}
              </div>
            )}

            <div className={classes.formFooter}>
              <button
                type="button"
                className={classes.cancelBtn}
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className={classes.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className={classes.spinnerIcon} aria-hidden="true" />
                    Posting...
                  </>
                ) : (
                  'Post Your Question'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;