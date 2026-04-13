import './NumberBarControl.css'
import React, { useState, useEffect, useRef } from 'react'

function NumberBarControl({ onComplete }) 
{
  const [ angle, setAngle       ] = useState(0);
  const [ ballPos, setBallPos   ] = useState(300);
  const [ velocity, setVelocity ] = useState(0);
  const [ showPopup, setShowPopup ] = useState(false);
  
  const requestRef  = useRef();
  const isDragging  = useRef(false);
  const lastY       = useRef(0);
  
  const animate = () => {
    setBallPos((prev) => {
      const acceleration = angle * 0.002;
      const newVelocity = (velocity + acceleration) * 0.92;
      setVelocity(newVelocity);
      
      let nextPos = prev + newVelocity;
      if(nextPos <= 350) 
      { 
        nextPos = 350; 
        setVelocity(v => Math.abs(v) * 0.3); 
      }
      if(nextPos >= 450) 
      { 
        nextPos = 450; 
        setVelocity(v => -Math.abs(v) * 0.3); 
      }
      
      return nextPos;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [angle, velocity]);

  useEffect(() => {
    const currentPos = Math.round(ballPos);
    if(currentPos === 415 && !showPopup)
    {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2000);   // 3s

      return () => clearTimeout(timer);
    }
  }, [ballPos, showPopup]);

  const handleStart = (y) => {
    isDragging.current = true;
    lastY.current = y;
  };

  const handleMove = (y) => {
    if(!isDragging.current)
      return;

    const deltaY = y - lastY.current;
    setAngle(prev => {
      const nextAngle = prev + (deltaY * 0.5);
      return Math.max(-20, Math.min(20, nextAngle));
    });
    lastY.current = y;
  };

  const handleEnd = () => {
    isDragging.current = false;
  }

  return (
    <div
      className='control-root'
      onMouseMove={(e) => handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      <h1>박희은의 생일을 맞춰라</h1>
      <h1>Current: {Math.round(ballPos)}</h1>
      
      <div 
        className='control-bar'
        onMouseDown={(e) => handleStart(e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div 
          className='control-dot'
          style={{ left: `calc(${(ballPos - 350)}% - 20px)` }}/>
      </div>
      
      <p className='small-text'>막대를 잡고 위아래로 흔들어 기울기를 조절하세요.</p>
      <p className='small-text'>(맞춘 후 3초 대기)</p>
      <button onClick={() => {setAngle(0); setVelocity(0); setBallPos(400);}}>리셋</button>

      {/* Success Popup */}
      {showPopup && (
        <div className='popup-overlay'>
          <div className='popup-content'>
            <h2>성공!</h2>
            <p>진짜 생일 장소와 시간을 알고 싶다면 다음 게임으로~</p>
            <button onClick={onComplete}>게임 시작하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NumberBarControl;
