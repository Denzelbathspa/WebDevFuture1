import { useState } from 'react'
import './App.css'

// Main
function App() {
  const [isPageChanging, setIsPageChanging] = useState(false);

  function pageChanging(bool_val) {
    setIsPageChanging(bool_val)
    
    // If starting animation, automatically stop it after delay
    if (bool_val === true) {
      setTimeout(() => {
        setIsPageChanging(false);
      }, 1000);
    }
  }

  return (
    <div className="App">
      <NavigationBar pageChanging={pageChanging} />
      <GameDescription />
      <RobloxLogo />
      <BGRects pageChanging={isPageChanging} />
    </div>
  )
}

// Navigation Bar
function NavigationBar({ pageChanging }) {
  return (
    <div className="class_NavBar">
      <nav>
          <button onClick={() => pageChanging(true)}>HOME</button>
          <button onClick={() => pageChanging(true)}>LEADERBOARDS</button>
          <button onClick={() => pageChanging(true)}>USERNAME1234</button>
          <button className='class_AdminButton' onClick={() => pageChanging(true)}>ADMIN PANEL</button>
      </nav>
    </div>
  )
}

// Game Description
function GameDescription() {
  const text = "Sometimes, the simple act of walking can be surprisingly therapeutic. Here, that calm experience is taken to the next level — combining relaxation with fun, competition, and a touch of creativity. Enjoy the scenery, climb the leaderboards, and unwind as you walk your way to victory. Are you ready for a relaxing yet competitive adventure? Come and ";

  const words = text.split(" ");

  return (
    <div className="class_GameDesc">
      <p>
        {words.map((word, index) => (
          <span
            key={index}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="wordAnimation"
          >
            {word}&nbsp; 
          </span>
        ))}
      <button className="class_PlayNow">PLAY NOW!</button>
      </p>
    </div>
  )
}

// Roblox Logo
function RobloxLogo() {
  return (
    <div className='class_RobloxLogo'>
      <img className='rbx_logo_upper' src='\src\assets\RobloxLogo_Upper.png'></img><br></br>
      <img className='rbx_logo_lower' src='\src\assets\RobloxLogo_Lower.png'></img>
    </div>
  )
}

// Background Rects
function BGRects({ pageChanging }) {
  return (
    <div className={`simple-grid-bg ${pageChanging ? 'animate-exit' : ''}`}>
      <div className="rect_1"></div>
      <div className="rect_2"></div>
      <div className="rect_3"></div>
      <div className="rect_4"></div>
    </div>
  );
}

export default App;