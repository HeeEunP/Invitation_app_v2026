import './App.css'
import NumberBarControl from './NumberBarControl';
import MainGame from './MainGame';
import { useState } from 'react';


function App() 
{
  const [ screen, setScreen ] = useState('control');

  return (
    <div className='app-root'>
      { screen === 'control' ? (
          <NumberBarControl onComplete={() => setScreen('main')}/>
        ): ( 
        <MainGame/> 
      )}
    </div>
  );
}

export default App
