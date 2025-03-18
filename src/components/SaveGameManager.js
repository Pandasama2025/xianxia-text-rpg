import React from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import './SaveGameManager.css';

const SaveGameManager = ({ currentChapter, playerStatus, onLoad }) => {
  // 保存游戏函数
  const saveGame = async () => {
    try {
      const docRef = await addDoc(collection(db, "saveGames"), {
        playerStatus,
        currentChapterId: currentChapter.id,
        timestamp: new Date().toISOString()
      });
      console.log("游戏已保存，ID: ", docRef.id);
      alert("游戏已保存！");
      return docRef.id;
    } catch (error) {
      console.error("保存游戏失败: ", error);
      alert("保存失败，请稍后再试！");
      return null;
    }
  };

  // 加载游戏函数
  const loadGame = async () => {
    try {
      // 获取最新的存档
      const q = query(
        collection(db, "saveGames"),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const saveData = doc.data();
        
        // 调用父组件的onLoad函数，传递加载的数据
        onLoad(saveData.currentChapterId, saveData.playerStatus);
        console.log("游戏已加载，ID: ", doc.id);
        alert("游戏已加载！");
        return true;
      } else {
        console.log("没有找到存档");
        alert("没有找到存档！");
        return false;
      }
    } catch (error) {
      console.error("加载游戏失败: ", error);
      alert("加载失败，请稍后再试！");
      return false;
    }
  };

  return (
    <div className="save-load-controls">
      <button className="save-button" onClick={saveGame}>保存游戏</button>
      <button className="load-button" onClick={loadGame}>加载游戏</button>
    </div>
  );
};

export default SaveGameManager; 