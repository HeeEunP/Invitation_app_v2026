import './MainGame.css'
import React, { useState, useEffect, useRef } from 'react';
import PestControlIcon from '@mui/icons-material/PestControl';

const GAME_TIME = 60;
const TOTAL_SPIDERS = 100;
const RED_SPIDERS_GOAL = 19;

function MainGame()
{
    const [ gameState, setGameState ] = useState('READY');
    const [ timeLeft, setTimeLeft   ] = useState(GAME_TIME);
    const [ redCount, setRedCount   ] = useState(0);
    const [ spiders, setSpiders     ] = useState([]);
    const [ isShaking, setIsShaking ] = useState(false);

    const requestRef = useRef();
    const timerRef = useRef();

    // init spiders
    const initSpiders = () => {
        const newSpiders = Array.from({ length: TOTAL_SPIDERS }).map((_, i) => ({
            id: i,
            isRed: i < RED_SPIDERS_GOAL,
            x: Math.random() * (window.innerWidth - 50),
            y: Math.random() * (window.innerHeight - 50),
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            captured: false
        }));
        setSpiders(newSpiders);
    };

    // game start handler
    const startGame = () => {
        initSpiders();
        setRedCount(0);
        setTimeLeft(GAME_TIME);
        setGameState('PLAYING');
    };

    // game loop
    const updatePhysics = () => {
        if(gameState !== 'PLAYING') 
            return;

        setSpiders((prevSpiders) => {
            if(prevSpiders.length === 0)
                return prevSpiders;

            return prevSpiders.map((s) => {
                if(s.captured)
                    return s;

                // speed increases over time
                const speedMultiplier = 1 + (GAME_TIME - timeLeft) * 0.02;
                let nextX = s.x + (s.vx * speedMultiplier);
                let nextY = s.y + (s.vy * speedMultiplier);
                
                let nextVx = s.vx;
                let nextVy = s.vy;

                if(nextX <= 0 || nextX >= window.innerWidth-40)
                    nextVx *= -1;
                if(nextY <= 0 || nextY >= window.innerHeight-40)
                    nextVy *= -1;
                
                return { ...s, x: nextX, y: nextY, vx: nextVx, vy: nextVy};
            });
        });
        requestRef.current = requestAnimationFrame(updatePhysics);
    };

    useEffect(() => {
        if(gameState === 'PLAYING') 
        {
            requestRef.current = requestAnimationFrame(updatePhysics);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if(prev <= 1) 
                    {
                        setGameState('FAIL');
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        else
        {
            cancelAnimationFrame(requestRef.current);
            clearInterval(timerRef.current)
        }

        
        return () => {
            cancelAnimationFrame(requestRef.current);
            clearInterval(timerRef.current);
        };
    }, [gameState]);

    // click event
    const handleCapture = (id, isRed) => {
        if(gameState !== 'PLAYING') 
            return;

        if(isRed) 
        {
            setSpiders((prev) =>
                prev.map((s) => (s.id === id ? { ...s, captured: true } : s))
            );

            setRedCount((prev) => {
                const next = prev + 1;
                if(next >= RED_SPIDERS_GOAL) 
                    setGameState('SUCCESS');
                return next;
            });
        }
        else
        {
            triggerShake();
        }
    };
    
    const triggerShake = () => {
        if(isShaking) 
            return;
        
        setIsShaking(true);
        
        setTimeout(() => {
            setIsShaking(false);
        }, 400);
    };

    return (
        <div className={`main-game-root ${isShaking ? 'shake-effect' : ''}`}>
            <div className='game-hud'>
                <span>Time: {timeLeft}s</span>
                <span style={{color: '#ff4757'}}>Target: {redCount} / {RED_SPIDERS_GOAL}</span>
            </div>

            {spiders.map((s) => (
                !s.captured && (
                    <div
                        key={s.id}
                        className={`spider-box ${s.isRed ? 'red' : 'black'}`}
                        style={{ 
                        left: `${s.x}px`, 
                        top: `${s.y}px`,
                        position: 'absolute',
                        transform: `rotate(${Math.atan2(s.vy, s.vx) * (180 / Math.PI) + 90}deg)`
                        }}
                        onMouseDown={() => handleCapture(s.id, s.isRed)}
                    >
                        <PestControlIcon
                            sx={{ 
                                fontSize: 60, 
                                color: s.isRed ? '#ff4757' : '#000',
                                filter: s.isRed ? 'drop-shadow(0 0 5px #ff4757)' : 'none'
                            }}
                        />
                    </div>
                )
            ))}

            {gameState !== 'PLAYING' && (
                <div className='popup-overlay'>
                    <div className='popup-content'>
                        {gameState === 'READY' && (
                        <>
                            <h2>거미 사냥꾼</h2>
                            <p style={{color: 'white'}}>빨간 거미 19개를 잡으세요!</p>
                            <button onClick={startGame}>시작하기</button>
                        </>
                        )}
                        {gameState === 'SUCCESS' && (
                        <>
                            <h2>CLEAR!</h2>
                            <p style={{color: 'white'}}>2026.04.17, 미미(문지점), 오후 7시 30분에 봐요~</p>
                            <p style={{color: 'white'}}>Dress Code: 제발 밝게 (어두운 새끼 출입금지)</p>
                            <button onClick={startGame}>다시 하기</button>
                        </>
                        )}
                        {gameState === 'FAIL' && (
                        <>
                            <h2>GAME OVER</h2>
                            <p style={{color: 'white'}}>생일 파티에 올 자격이 없습니다...</p>
                            <button onClick={startGame}>재도전</button>
                        </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainGame;