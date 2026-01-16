import '../App.css'

export default function HomePage() {
  return (
    <>
      <GameDescription />
      <RobloxLogo />
      <BGRects />
    </>
  );
}


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
      <button className="class_PlayNow"><a href='https://www.roblox.com/games/110035627916808/pizza-walk-gaem-BUG-FIXES'>PLAY NOW!</a></button>
      </p>
    </div>
  )
}

function RobloxLogo() {
  return (
    <div className='class_RobloxLogo'>
      <img className='rbx_logo_upper' src='\src\assets\RobloxLogo_Upper.png'></img><br></br>
      <img className='rbx_logo_lower' src='\src\assets\RobloxLogo_Lower.png'></img>
    </div>
  )
}

function BGRects() {
  return (
    <div className="imple-grid-bg">
      <div className="rect_1"></div>
      <div className="rect_2"></div>
      <div className="rect_3"></div>
      <div className="rect_4"></div>
    </div>
  );
}