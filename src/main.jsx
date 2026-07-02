import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/tanay-portfolio-v2">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
