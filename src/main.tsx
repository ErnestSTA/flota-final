import React from 'react'
import ReactDOM from 'react-dom/client'
// Ważne: usuń rozszerzenie .tsx z importu, czasem to myli Vite
import App from './App' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Na razie bez CssBaseline, żeby wykluczyć błąd biblioteki stylów */}
    <App />
  </React.StrictMode>,
)