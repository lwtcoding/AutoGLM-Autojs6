# AutoGLM-AutoJS6

基于 AutoJS6 和无障碍服务的 AI 手机自动化助手,复刻自 [Open-AutoGLM](https://github.com/THUDM/Open-AutoGLM) 项目。

## 项目简介

AutoGLM-AutoJS6 是 Open-AutoGLM 的 AutoJS6 版本实现,使用 Android 无障碍服务替代 ADB 进行手机自动化操作。通过 AI 视觉语言模型理解屏幕内容,自动执行用户指定的任务。

### 主要特性

- ✅ **无需 ADB**: 使用无障碍服务,无需 PC 连接
- ✅ **本地运行**: 直接在 Android 设备上运行
- ✅ **AI 驱动**: 使用视觉语言模型进行智能决策
- ✅ **图形界面**: 提供友好的 UI 界面
- ✅ **多种操作**: 支持点击、滑动、输入、启动应用等
- ✅ **任务编排**: 自动化复杂的多步骤任务

### 与原项目的区别

| 特性 | Open-AutoGLM | AutoGLM-AutoJS6 |
|-----|-------------|-----------------|
| 运行环境 | PC (Python) | Android (JavaScript) |
| 连接方式 | USB/WiFi ADB | 本地运行 |
| 权限要求 | USB 调试 | 无障碍服务 + 截图权限 |
| 用户界面 | 命令行 | 图形界面 |
| 便携性 | 需要 PC | 仅需手机 |

## 系统要求

- Android 5.0+ (API Level 21+)
- [AutoJS6](https://github.com/SuperMonster003/AutoJs6) 已安装
- 无障碍服务权限
- 截图权限
- 网络连接 (访问模型 API)

## 安装步骤

### 1. 安装 AutoJS6

从 [AutoJS6 Releases](https://github.com/SuperMonster003/AutoJs6/releases) 下载并安装最新版本。

### 2. 导入项目

1. 将 `AutoGLM-AutoJS6` 文件夹复制到手机存储
2. 在 AutoJS6 中打开项目文件夹
3. 运行 `main.js`

### 3. 授予权限

首次运行时需要授予以下权限:

1. **无障碍服务**: 设置 → 无障碍 → AutoJS6 → 开启
2. **截图权限**: 运行时会自动请求,点击"立即开始"

### 4. 配置 API

点击"设置"按钮,配置模型 API:

- **API 地址**: 模型服务的 URL (例如: `https://open.bigmodel.cn/api/paas/v4`)
- **模型名称**: 使用的模型名称 (默认: `autoglm-phone`)
- **API Key**: API 密钥 (默认: `EMPTY`)
- **语言**: 系统提示词语言 (中文/English)

## 使用方法

### 基本使用

1. 打开 AutoGLM-AutoJS6 应用
2. 在任务输入框中输入任务描述,例如:
   - "打开微信"
   - "打开淘宝,搜索手机壳"
   - "打开抖音,点赞前三个视频"
3. 点击"执行任务"按钮
4. 观察执行过程和日志输出

### 任务示例

```
# 简单任务
打开微信

# 多步骤任务
打开淘宝,搜索"手机壳",点击第一个商品

# 复杂任务
打开小红书,搜索"留学",点赞前五个笔记,并关注作者
```

### 停止任务

如果需要中途停止任务,点击"停止"按钮。

## 项目结构

```
AutoGLM-AutoJS6/
├── project.json              # AutoJS6 项目配置
├── main.js                   # 主入口
├── ui/
│   ├── main_ui.js           # 主界面
│   └── settings.js          # 设置界面
├── core/
│   ├── agent.js             # PhoneAgent 核心
│   ├── model_client.js      # 模型客户端
│   ├── action_handler.js    # 动作处理器
│   └── message_builder.js   # 消息构建器
├── accessibility/
│   ├── screen_capture.js    # 截图功能
│   ├── device_control.js    # 设备控制
│   ├── text_input.js        # 文本输入
│   └── app_detector.js      # 应用检测
├── config/
│   ├── apps.js              # 应用包名映射
│   ├── timing.js            # 时间配置
│   ├── system_prompt.js     # 系统提示词
│   └── storage.js           # 本地存储
└── utils/
    ├── http_client.js       # HTTP 客户端
    └── logger.js            # 日志工具
```

## 核心模块说明

### PhoneAgent (core/agent.js)

任务编排核心,负责:
- 任务循环控制
- 截图获取
- 模型请求
- 动作执行

### ModelClient (core/model_client.js)

模型 API 客户端,负责:
- 调用 OpenAI 兼容 API
- 解析模型响应
- 提取 thinking 和 action

### ActionHandler (core/action_handler.js)

动作处理器,支持以下动作:
- `launch`: 启动应用
- `tap`: 点击
- `double_tap`: 双击
- `long_press`: 长按
- `type`: 输入文本
- `swipe`: 滑动
- `back`: 返回键
- `home`: 主页键
- `wait`: 等待
- `finish`: 完成任务

### 无障碍服务层

- **screen_capture.js**: 使用 `images.captureScreen()` 截图
- **device_control.js**: 使用 `click()`, `swipe()` 等进行操作
- **text_input.js**: 支持 `setText()`, 剪贴板, `input()` 三种输入方式
- **app_detector.js**: 使用 `currentPackage()` 检测当前应用

## 配置说明

### 模型 API 配置

支持任何 OpenAI 兼容的 API:

```javascript
{
  baseUrl: "https://open.bigmodel.cn/api/paas/v4",
  modelName: "autoglm-phone",
  apiKey: "your-api-key",
  lang: "cn"  // 或 "en"
}
```

### Agent 配置

```javascript
{
  maxSteps: 100,      // 最大执行步数
  verbose: true       // 是否显示详细日志
}
```

## 常见问题

### 1. 无法截图

**问题**: 提示"请授予截图权限"

**解决方案**:
- 确保已授予截图权限
- 某些设备可能需要在设置中手动开启
- 重启 AutoJS6 应用

### 2. 无法点击

**问题**: 动作执行但没有效果

**解决方案**:
- 检查无障碍服务是否开启
- 某些应用可能阻止无障碍服务
- 尝试手动点击确认坐标是否正确

### 3. 无法输入文本

**问题**: 文本输入失败

**解决方案**:
- 检查输入框是否获得焦点
- 尝试先点击输入框
- 某些应用的输入框可能需要特殊处理

### 4. API 连接失败

**问题**: 提示"API 请求失败"

**解决方案**:
- 检查 API 地址是否正确
- 尝试使用 `curl` 测试 API 连接

### 5. 应用未识别

**问题**: 当前应用显示为包名而非应用名

**解决方案**:
- 在 `config/apps.js` 中添加应用包名映射
- 格式: `"应用名": "包名"`

## 开发指南

### 添加新的应用支持

编辑 `config/apps.js`:

```javascript
const APP_PACKAGES = {
  // ... 现有应用
  "新应用名": "com.example.newapp"
};
```

### 自定义系统提示词

编辑 `config/system_prompt.js`:

```javascript
const SYSTEM_PROMPTS = {
  cn: `你的自定义提示词...`,
  en: `Your custom prompt...`
};
```

### 调整时间延迟

编辑 `config/timing.js`:

```javascript
const TIMING_CONFIG = {
  device: {
    default_tap_delay: 0.5,  // 点击后延迟
    // ... 其他配置
  }
};
```

## 技术限制

1. **系统界面限制**: 某些系统界面(如锁屏、设置)可能无法访问
2. **应用兼容性**: 部分应用可能阻止无障碍服务
3. **性能差异**: 相比 ADB 方案,性能可能略低
4. **权限要求**: 需要用户手动授予多项权限

## 贡献指南

欢迎提交 Issue 和 Pull Request!

### 开发环境

- AutoJS6 最新版
- Android 测试设备
- 模型 API 服务

### 提交规范

- 代码风格: 遵循项目现有风格
- 注释: 使用 JSDoc 格式
- 测试: 在真机上测试功能

## 许可证

本项目基于 Apache 2.0 许可证开源。

## 致谢

- [Open-AutoGLM](https://github.com/THUDM/Open-AutoGLM) - 原始项目
- [AutoJS6](https://github.com/SuperMonster003/AutoJs6) - AutoJS6 框架
- [知谱模型](https://docs.bigmodel.cn/cn/api/introduction) - AI 模型

## 联系方式

- Issue: [GitHub Issues](https://github.com/lwtcoding/AutoGLM-Autojs6/issues)
- 讨论: [GitHub Discussions](https://github.com/lwtcoding/AutoGLM-Autojs6/discussions)

---

**注意**: 本项目仅供学习和研究使用,请遵守相关法律法规和应用服务条款。
