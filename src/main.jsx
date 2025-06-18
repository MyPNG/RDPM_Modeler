import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './frontend/src/App'
import { BrowserRouter } from "react-router-dom";

/* 
•	Purpose:
This file is the entry point of your React application.
•	Key Points:
	•	It imports React and ReactDOM.
	•	It renders the <App /> component within a <BrowserRouter> (for routing) and <React.StrictMode> (for highlighting potential problems in an application).
	•	The rendered content is attached to the DOM element with the ID root. 
*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
