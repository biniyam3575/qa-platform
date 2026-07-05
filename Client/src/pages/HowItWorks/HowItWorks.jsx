import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaLightbulb, FaCheckCircle, FaCode, FaArrowRight } from 'react-icons/fa';
import classes from './HowItWorks.module.css';

const STEPS = [
  {
    id: 1,
    icon: <FaQuestionCircle />,
    title: 'Ask a Question',
    description:
      'Stuck on a bug? Post your question to the community. Include code snippets for better answers.',
  },
  {
    id: 2,
    icon: <FaLightbulb />,
    title: 'Share Knowledge',
    description:
      'Help others by answering questions. Use Markdown to format your code blocks beautifully.',
  },
  {
    id: 3,
    icon: <FaCode />,
    title: 'Code Formatting',
    description:
      'Use triple backticks to trigger our professional syntax highlighter with copy functionality.',
  },
  {
    id: 4,
    icon: <FaCheckCircle />,
    title: 'Mark as Solved',
    description:
      'Once you find the solution, mark the best answer as accepted to help future developers.',
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <div className={classes.pageContainer}>
      {/* Header */}
      <header className={classes.pageHeader}>
        <p className={classes.eyebrow}>Getting started</p>
        <h1 className={classes.mainHeading}>
          How <span className={classes.brandHighlight}>DevStack</span> Works
        </h1>
        <p className={classes.subheading}>
          A community-driven platform for developers to learn and grow.
        </p>
      </header>

      {/* Steps */}
      <div className={classes.stepsGrid}>
        {STEPS.map((step) => (
          <div key={step.id} className={classes.stepCard}>
            <div className={classes.stepNumber}>0{step.id}</div>
            <div className={classes.iconWrapper}>{step.icon}</div>
            <h3 className={classes.stepTitle}>{step.title}</h3>
            <p className={classes.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className={classes.ctaSection}>
        <h2 className={classes.ctaHeading}>
          {token ? 'Ready to help someone today?' : 'Ready to join the community?'}
        </h2>
        <p className={classes.ctaSubtext}>
          {token
            ? 'Head back to the dashboard and find a question you can answer.'
            : 'Create an account to start asking and answering questions.'}
        </p>
        <button
          type="button"
          className={classes.ctaBtn}
          onClick={() => navigate(token ? '/' : '/login')}
        >
          {token ? 'Back to Home' : 'Get Started Now'}
          <FaArrowRight aria-hidden="true" />
        </button>
      </section>
    </div>
  );
};

export default HowItWorks;