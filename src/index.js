import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LaTeXCheckerApp from './LaTeXCheckerApp';
import SolutionReviewerApp from './SolutionReviewerApp';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check app mode
const appMode = process.env.REACT_APP_MODE;

let AppComponent;
if (appMode === 'checker') {
  AppComponent = LaTeXCheckerApp;
} else if (appMode === 'reviewer') {
  AppComponent = SolutionReviewerApp;
} else {
  AppComponent = App;
}

root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
