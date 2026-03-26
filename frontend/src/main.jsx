import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { AuthProvider } from './context'
import { SocketProvider } from './context/SocketContext'
import { Provider } from 'react-redux'
import { store } from './redux'

import { PublicClientApplication } from "@azure/msal-browser"
import { MsalProvider } from "@azure/msal-react"
import { msalConfig } from "./config/msalConfig"

const msalInstance = new PublicClientApplication(msalConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </MsalProvider>
    </Provider>
  </StrictMode>,
)