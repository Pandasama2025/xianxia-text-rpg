import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/WaterInkTheme.css';
import './SaveLoadScreen.css';

const SaveLoadScreen = ({ currentChapter, playerStatus, onLoad, onClose }) => {
  const [saveGames, setSaveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 加载存档列表
  useEffect(() => {
    const fetchSaveGames = async () => {
      try {
        const q = query(
          collection(db, "saveGames"),
          orderBy("timestamp", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const saves = [];
        querySnapshot.forEach((doc) => {
          saves.push({
            id: doc.id,
            ...doc.data(),
            timestamp: new Date(doc.data().timestamp)
          });
        });
        
        setSaveGames(saves);
        setLoading(false);
      } catch (error) {
        console.error("获取存档失败:", error);
        setLoading(false);
      }
    };
    
    fetchSaveGames();
  }, []);
  
  // 保存游戏函数
  const saveGame = async () => {
    try {
      const saveData = {
        playerStatus,
        currentChapterId: currentChapter.id,
        timestamp: new Date().toISOString(),
        chapterTitle: currentChapter.title
      };
      
      const docRef = await addDoc(collection(db, "saveGames"), saveData);
      
      // 更新存档列表
      setSaveGames([
        {
          id: docRef.id,
          ...saveData,
          timestamp: new Date(saveData.timestamp)
        },
        ...saveGames
      ]);
      
      alert("游戏已保存！");
    } catch (error) {
      console.error("保存游戏失败:", error);
      alert("保存失败，请稍后再试！");
    }
  };
  
  // 加载游戏函数
  const loadGame = async (saveId) => {
    try {
      const saveRef = doc(db, "saveGames", saveId);
      const saveSnap = await getDoc(saveRef);
      
      if (saveSnap.exists()) {
        const saveData = saveSnap.data();
        onLoad(saveData.currentChapterId, saveData.playerStatus);
        onClose();
        alert("游戏已加载！");
      } else {
        alert("存档不存在或已被删除！");
      }
    } catch (error) {
      console.error("加载游戏失败:", error);
      alert("加载失败，请稍后再试！");
    }
  };
  
  // 删除存档
  const deleteSaveGame = async (saveId, event) => {
    event.stopPropagation(); // 防止触发父元素的点击事件
    
    if (window.confirm("确定要删除这个存档吗？")) {
      try {
        await deleteDoc(doc(db, "saveGames", saveId));
        setSaveGames(saveGames.filter(save => save.id !== saveId));
        alert("存档已删除！");
      } catch (error) {
        console.error("删除存档失败:", error);
        alert("删除失败，请稍后再试！");
      }
    }
  };
  
  // 格式化日期
  const formatDate = (date) => {
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="save-load-screen water-ink-container">
      <h2 className="water-ink-title">游戏存档</h2>
      
      <button 
        className="new-save-button ink-button" 
        onClick={saveGame}
      >
        创建新存档
      </button>
      
      <div className="save-list ink-scroll-area">
        {loading ? (
          <p className="water-ink-text">加载存档列表中...</p>
        ) : saveGames.length === 0 ? (
          <p className="water-ink-text">暂无存档</p>
        ) : (
          saveGames.map(save => (
            <div 
              key={save.id} 
              className="ink-save-slot"
              onClick={() => loadGame(save.id)}
            >
              <div className="save-info">
                <h3 className="save-title">{save.chapterTitle || "未知章节"}</h3>
                <p className="save-date">{formatDate(save.timestamp)}</p>
                <div className="save-status">
                  {save.playerStatus && Object.entries(save.playerStatus)
                    .filter(([key]) => !key.startsWith('current'))
                    .map(([key, value]) => (
                      <span key={key} className="save-status-item">
                        {key}: {value}
                      </span>
                    ))
                  }
                </div>
              </div>
              <button 
                className="delete-save-button ink-button"
                onClick={(e) => deleteSaveGame(save.id, e)}
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
      
      <button 
        className="close-button ink-button"
        onClick={onClose}
      >
        返回游戏
      </button>
    </div>
  );
};

export default SaveLoadScreen; 