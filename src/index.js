import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-nfesg3v6.us.auth0.com"
      clientId="tVeenTqdYSDYPI5P4DpaNKxAdoZ4ZFut"
      redirectUri={window.location.origin}
    >
    <App />
  </Auth0Provider>
  </React.StrictMode>
);
