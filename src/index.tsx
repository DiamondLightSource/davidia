import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// import { createRoot } from 'react-dom/client';
// const container = document.getElementById('App');
// const root = createRoot(container!); 
// root.render(<App />);

const container = document.getElementById('root') as HTMLElement;
render(
    <App />, container);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
