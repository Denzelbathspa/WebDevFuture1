import { useState } from 'react'
import './App.css'

// Navigation Bar
function NavigationBar() {
  const [strokeColor, setStrokeColor] = useState("rgb(0, 140, 255)");
  
  const nameColor = {
    HOME: "rgb(0, 140, 255)",
    WIKI: "rgba(208, 255, 0, 1)",
  }

  const changeColor = (pageLabel) => {
    setStrokeColor(nameColor[pageLabel]);
  };

  return (
    <nav className="nav-bar" 
      style={{ 
        borderRight: `4px solid ${strokeColor}`, 
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
      <div className="LeftPage">
        <img 
          src={imgUrl}
          alt="Item Image"
        />
        <p>
          DESCRIPTION: <br></br>
          {description}
        </p>
      </div>

      <div className="RightPage">
        <h1>Stats:</h1>
        <p>
          {stats}
        </p>
      </div>
    </div>
  );
}

export {NavigationBar, WikiPage };