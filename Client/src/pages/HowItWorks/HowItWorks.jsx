import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaLightbulb, FaCheckCircle, FaCode } from 'react-icons/fa';
import classes from './HowItWorks.module.css';

const HowItWorks = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in
  const token = localStorage.getItem('token');

  const steps = [
    {
      id: 1,
      icon: <FaQuestionCircle />,
      title: "Ask a Question",
      description: "Stuck on a bug? Post your question to the community. Include code snippets for better answers!",
      color: "#fe8402"
    },
    {
      id: 2,
      icon: <FaLightbulb />,
      title: "Share Knowledge",
      description: "Help others by answering questions. Use Markdown to format your code blocks beautifully.",
      color: "#007bff"
    },
    {
      id: 3,
      icon: <FaCode />,
      title: "Code Formatting",
      description: "Use triple backticks to trigger our professional syntax highlighter with copy functionality.",
      color: "#28a745"
    },
    {
      id: 4,
      icon: <FaCheckCircle />,
      title: "Mark as Solved",
      description: "Once you find the solution, mark the best answer as accepted to help future developers.",
      color: "#6f42c1"
    }
  ];

  return (
    <div className={classes.howContainer}>
      <header className={classes.header}>
        <h1>How <span className={classes.highlight}>DevStack</span> Works</h1>
        <p>A community-driven platform for developers to learn and grow.</p>
      </header>

      <div className={classes.stepsGrid}>
        {steps.map((step) => (
          <div key={step.id} className={classes.stepCard}>
            <div className={classes.iconWrapper} style={{ color: step.color }}>
              {step.icon}
            </div>
            <div className={classes.stepNumber}>0{step.id}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <section className={classes.ctaSection}>
        {/* Change text based on login status */}
        <h2>{token ? "Ready to help someone today?" : "Ready to join the community?"}</h2>
        
        <button 
          className={classes.startBtn} 
          onClick={() => navigate(token ? '/' : '/login')}
        >
          {token ? "Back to Home" : "Get Started Now"}
        </button>
      </section>
    </div>
  );
};

export default HowItWorks;