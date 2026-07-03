import React from 'react';
import Router from './Components/Router/Router'; // Verified relative path matching

function App() {
  return (
    <div className="App">
      {/* The top-level Layout component inside Router.jsx manages persistent 
        shared interface views such as the Header and Footer seamlessly.
      */}
      <Router />
    </div>
  );
}

export default App;