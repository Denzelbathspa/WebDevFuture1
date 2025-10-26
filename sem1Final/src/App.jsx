import { useState } from 'react'
import './App.css'

function App() {
  const [bgColor, setBgColor] = useState("white")

  function setBGColor(color) {
    setBgColor(color)
  }

  return (
    <div className="App">
      <NavigationBar setBGColor={setBGColor} />
      <GameDescription />
      <RobloxLogo />
    </div>
  )
}

// Navigation Bar
function NavigationBar({ setBGColor }) {
  return (
    <div className="class_NavBar">
      <nav>
          <button onClick={() => setBGColor("rgb(0, 140, 255)")}>HOME</button>
          <button onClick={() => setBGColor("rgb(255, 140, 255)")}>LEADERBOARDS</button>
          <button onClick={() => setBGColor("rgb(0, 140, 0)")}>USERNAME1234</button>
          <button className='class_AdminButton' onClick={() => setBGColor("rgb(0, 140, 0)")}>ADMIN PANEL</button>
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

export default App;