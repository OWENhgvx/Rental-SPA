// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css'; 
import App from './App.jsx';

// Render the main application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="light" theme={{ primaryColor: 'blue', defaultRadius: 'md' }}>
      <Notifications position="top-right" />
      <BrowserRouter basename="/airbrb">
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
