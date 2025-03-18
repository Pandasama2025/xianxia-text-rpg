import React, { useState, useEffect } from 'react';
import './App.css';
import StoryDisplay from './components/StoryDisplay';
import storyData from './data/story.json';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  
  useEffect(() => {
    // 初始化时加载第一个章节
    setCurrentChapter(storyData.chapters[0]);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>仙侠文字RPG</h1>
      </header>
      <main>
        <StoryDisplay chapter={currentChapter} />
      </main>
    </div>
  );
}

export default App;
