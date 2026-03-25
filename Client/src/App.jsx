import React from 'react';
import Router from './Components/Router/Router'; // Import the router you created

function App() {
  return (
    <div className="App">
      {/* We don't put Header/Footer here because 
        the Layout component inside Router.jsx handles them.
      */}
      <Router />
    </div>
  );
}

export default App;