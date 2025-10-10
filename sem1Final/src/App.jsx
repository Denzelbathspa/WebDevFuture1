import { useState } from 'react'
import './App.css'

var themeColor = "rgb(0, 140, 255)"

// Navigation Bar
function NavigationBar({nameColor, strokeColor, setStrokeColor}) {
  const changeColor = (pageLabel) => {
    setStrokeColor(nameColor[pageLabel]);
    themeColor = nameColor[pageLabel]
  };

  return (
    <nav className="nav-bar" 
      style={{ 
        borderRight: `4px solid ${themeColor}`, 
        padding: '20px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease-in-out'
      }}>
      <ul>
        <li onClick={() => changeColor("HOME")}>HOME</li>
        <li onClick={() => changeColor("WIKI")}>WIKI</li>
      </ul>
    </nav>
  );
}

// Pages
function WikiPage({imgUrl, description, stats}) {
  return (
    <div className="Wiki">
      <div className="LeftPage"
      style={{ 
        border: `4px solid ${themeColor}`, 
        padding: '20px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease-in-out'
      }}>
        <img className='leftPageImage'
          src={imgUrl}
          alt="Item Image"
        />
        <p>
          DESCRIPTION: <br></br>
          {description}
        </p>
      </div>

      <div className="RightPage"
      style={{ 
        border: `4px solid ${themeColor}`, 
        padding: '20px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease-in-out'
      }}>
        <h1>Stats:</h1>
        <p>
          {stats}
        </p>
      </div>
    </div>
  );
}

// Add req and rec here for the roblox API

// Final output
function App({imgUrl, description, stats})  {
  const [strokeColor, setStrokeColor] = useState("rgb(0, 140, 255)");
  const nameColor = {
    HOME: "rgb(0, 140, 255)",
    WIKI: "rgba(208, 255, 0, 1)",
  }
  return (
    <div>
        <NavigationBar nameColor={nameColor} strokeColor={strokeColor} setStrokeColor={setStrokeColor} />
        <WikiPage imgUrl={"https://images.all-free-download.com/images/thumbjpg/camera_test_apple_517290.jpg"} description={"It is an apple bru"} stats={"Its got a lot of nutrients and stuff"}/>

    </div>
  );
}

export default App;