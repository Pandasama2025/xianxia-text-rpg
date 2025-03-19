# 仙侠文字RPG项目架构

## 项目结构概述
```
xianxia-rpg/
├── public/            # 静态资源目录
├── src/               # 源代码目录
│   ├── audio/         # 音频管理
│   ├── components/    # React组件
│   ├── data/          # 游戏数据
│   ├── firebase/      # Firebase配置
│   ├── styles/        # 样式文件
│   ├── App.js         # 主应用组件
│   ├── App.css        # 主应用样式
│   └── index.js       # 应用入口
└── package.json       # 项目依赖
```

## 核心文件说明

### 样式系统
- **`src/styles/WaterInkTheme.css`**: 水墨画风格主题，定义了全局样式变量、组件样式和交互效果。使用CSS变量机制实现统一的视觉风格，包括颜色、纹理、字体和动画效果。

### 组件
- **`src/components/StoryDisplay.js`**: 故事内容展示组件，负责渲染剧情章节的标题和文本。集成了水墨风格和滚动区域效果。

- **`src/components/Options.js`**: 选项按钮组件，展示并处理玩家可选择的剧情分支。按钮采用水墨风格设计，有墨迹晕染的悬停效果。

- **`src/components/PlayerStatus.js`**: 玩家状态展示组件，以水墨风格显示修为、灵力等属性值。使用类似竹简的布局风格。

- **`src/components/SaveGameManager.js`**: 简单的存档管理组件，提供保存和加载游戏状态的基本功能。

- **`src/components/SaveLoadScreen.js`**: 高级存档管理界面，提供存档列表、创建新存档、加载和删除存档功能。以模态窗口形式展示，有背景遮罩。

- **`src/components/SoundControls.js`**: 音频控制组件，允许玩家控制背景音乐和音效。

### 数据管理
- **`src/data/story.json`**: 游戏剧情数据，采用树状结构定义章节、选项和状态影响。每个章节包含ID、标题、文本描述和可选项数组。

### 音频系统
- **`src/audio/soundManager.js`**: 音频管理模块，使用Howler.js实现背景音乐和音效的加载和播放控制。

### Firebase集成
- **`src/firebase/config.js`**: Firebase配置文件，设置数据库连接，用于存档功能。

### 主应用
- **`src/App.js`**: 主应用组件，整合所有组件并管理游戏状态。处理章节切换、玩家状态更新和存档/读档逻辑。

- **`src/App.css`**: 主应用样式，定义整体布局和响应式设计规则。

## 数据流
1. **游戏初始化**: App.js加载第一个章节和初始玩家状态
2. **用户选择**: 玩家点击Options组件中的选项
3. **状态更新**: App.js根据选项的effects更新playerStatus
4. **章节切换**: App.js根据选项的nextId加载新章节
5. **存档/读档**: SaveGameManager/SaveLoadScreen与Firebase交互，保存或读取游戏状态

## 响应式设计
所有组件都实现了响应式设计，通过媒体查询在不同屏幕尺寸下提供最佳体验：
- 桌面设备: 完整布局，两列状态栏
- 平板设备: 调整间距，优化按钮尺寸
- 移动设备: 单列布局，垂直排列控制元素

## 水墨画风格实现
- 使用CSS变量定义颜色主题
- SVG背景纹理模拟纸张和墨迹
- 伪元素和渐变效果实现墨水晕染
- 中国传统字体增强视觉主题
- 微妙的过渡动画提升交互体验 