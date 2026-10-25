import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import './footer.css'
import favicon from './Dialog_Axiata_logo.svg.webp'

const icon = document.querySelector('link[rel="icon"]') ?? document.createElement('link')
icon.rel = 'icon'
icon.type = 'image/webp'
icon.href = favicon
document.head.append(icon)

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
