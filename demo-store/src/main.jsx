import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// GitHub Pages SPA redirect: 404.html redirects /demo/quick-order → /demo/?p=/quick-order.
// Restore the real path so React Router sees it.
const sp = new URLSearchParams(window.location.search);
const redirectPath = sp.get('p');
if (redirectPath) {
  sp.delete('p');
  const remaining = sp.toString();
  const url = import.meta.env.BASE_URL + redirectPath.replace(/^\//, '') + (remaining ? '?' + remaining : '') + window.location.hash;
  window.history.replaceState(null, '', url);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
