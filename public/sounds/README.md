# 仙侠文字RPG 音效目录

此目录包含游戏中使用的所有音效文件。

## 目录结构

- `/background` - 背景音乐
  - `main_theme.mp3` - 主菜单和一般场景背景音乐
  - `battle_theme.mp3` - 战斗场景背景音乐
  - `meditation.mp3` - 修炼场景背景音乐

- `/ui` - 界面音效
  - `click.mp3` - 点击按钮音效
  - `hover.mp3` - 鼠标悬停音效
  - `select.mp3` - 选择选项音效

- `/effects` - 游戏效果音效
  - `level_up.mp3` - 修为提升音效
  - `achievement.mp3` - 成就达成音效
  - `sword.mp3` - 剑气音效
  - `magic.mp3` - 法术音效

## 音效要求

1. 所有音效文件应为MP3格式
2. 背景音乐应循环流畅，无明显断点
3. UI音效应简短清脆
4. 效果音效应契合游戏主题和场景

## 添加新音效

1. 将新音效文件放在对应目录下
2. 在 `src/audio/soundManager.js` 中添加对应路径
3. 在需要的地方调用相应的播放函数

## 音效来源

音效文件应为无版权音效或获得正确授权的音效。建议使用以下资源：

- [Free Sound](https://freesound.org/)
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/)
- [ZapSplat](https://www.zapsplat.com/) 