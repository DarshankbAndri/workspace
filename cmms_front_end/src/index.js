import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './shared/context/AuthContext';
import { DateTimeProvider } from './shared/context/DateTimeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <DateTimeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </DateTimeProvider>
);
