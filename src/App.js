import React, { useState, useEffect } from 'react';
import './App.css';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import storyData from './data/story.json';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  
  useEffect(() => {
    // 初始化时加载第一个章节
    setCurrentChapter(storyData.chapters[0]);
  }, []);
  
  // 处理选项选择
  const handleOptionSelect = (option) => {
    // 查找下一个章节
    const nextChapter = storyData.chapters.find(
      chapter => chapter.id === option.nextId
    );
    
    if (nextChapter) {
      setCurrentChapter(nextChapter);
    } else {
      console.error('找不到章节:', option.nextId);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>仙侠文字RPG</h1>
      </header>
      <main>
        <StoryDisplay chapter={currentChapter} />
        {currentChapter && (
          <Options 
            options={currentChapter.options} 
            onSelect={handleOptionSelect}
          />
        )}
      </main>
    </div>
  );
}

export default App;
