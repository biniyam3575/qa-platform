import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// --- CHANGE 1: Change 'oneDark' to 'atomDark' ---
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

import { FaRegCopy, FaCheck } from 'react-icons/fa';
import classes from './CodeBlock.module.css';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className={classes.codeContainer}>
      <div className={classes.codeHeader}>
        <span className={classes.languageName}>{match ? match[1] : 'code'}</span>
        <button 
          type="button" 
          onClick={handleCopy} 
          className={classes.copyBtn}
        >
          {copied ? (
            <><FaCheck style={{ color: '#4BB543' }} /> Copied!</>
          ) : (
            <><FaRegCopy /> Copy</>
          )}
        </button>
      </div>
      
      {/* --- CHANGE 2: Apply 'atomDark' style --- */}
      <SyntaxHighlighter
        style={atomDark} 
        language={match ? match[1] : 'javascript'}
        PreTag="div"
        customStyle={{ margin: 0, padding: '15px', borderRadius: '0 0 8px 8px' }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;