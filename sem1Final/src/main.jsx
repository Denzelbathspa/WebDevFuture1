import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {NavigationBar, WikiPage } from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NavigationBar />
    <WikiPage imgUrl={"https://images.all-free-download.com/images/thumbjpg/camera_test_apple_517290.jpg"} description={"It is an apple bru"} stats={"Its got a lot of nutrients and stuff"}/>

  </StrictMode>,
)
