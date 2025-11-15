# B站视频字幕提取工具

一个用于提取B站视频字幕并生成学习笔记的 Web 应用。支持内置字幕提取和通义听悟 API 语音转写。

## 功能特点

- ✅ 自动提取B站视频内置字幕（支持 AI 字幕和人工字幕）
- ✅ 通义听悟 API 集成（用于无字幕视频的语音转写）
- ✅ AI 智能排版（使用通义千问优化笔记格式）
- ✅ Markdown 格式输出，保留时间戳
- ✅ 一键复制和下载功能
- ✅ 响应式设计，支持移动端

## 技术栈

- **前端**: React + TypeScript + Vite + TailwindCSS
- **后端**: Express.js (Serverless Functions on Vercel)
- **部署**: Vercel
- **API**: Bilibili API, 通义听悟, 通义千问

## 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd "Subtitle acquisition"
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   - 前端: http://localhost:5173
   - 后端 API: http://localhost:9090

4. **构建项目**
   ```bash
   npm run build
   ```

## 部署到 Vercel

### 方法 1: 使用部署脚本（推荐）

```powershell
.\deploy.ps1
```

### 方法 2: 手动部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md) 文件。

### 方法 3: GitHub 集成（最推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 上导入 GitHub 仓库
3. Vercel 自动检测配置并部署
4. 每次推送代码自动触发重新部署

## 项目结构

```
.
├── api/                    # Serverless API 函数
│   ├── index.ts           # Vercel 部署入口
│   └── server.ts          # 本地开发服务器
├── src/                   # 前端源代码
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 样式文件
├── dist/                  # 构建输出目录
├── package.json          # 项目配置
├── vercel.json           # Vercel 配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # TailwindCSS 配置
├── deploy.ps1            # 部署脚本
├── DEPLOYMENT.md         # 详细部署指南
└── README.md             # 项目说明
```

## API 端点

### `POST /api/process-video`

提取视频内置字幕并处理

**请求体:**
```json
{
  "url": "https://www.bilibili.com/video/BV1234567890",
  "accessKey": "your-api-key"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "title": "视频标题",
    "markdown": "# 学习笔记\n...",
    "videoUrl": "原视频链接"
  }
}
```

### `POST /api/download-video`

获取视频下载链接

**请求体:**
```json
{
  "bilibiliUrl": "https://www.bilibili.com/video/BV1234567890"
}
```

### `POST /api/tingwu-process`

使用通义听悟进行语音转写

**请求体:**
```json
{
  "videoUrl": "视频文件URL",
  "accessKey": "通义听悟 API Key",
  "language": "auto"
}
```

### `GET /api/health`

健康检查端点

## 环境变量（可选）

如需配置环境变量，在 Vercel 项目设置中添加：

- `TINGWU_APP_KEY`: 通义听悟应用密钥
- `QIANWEN_API_KEY`: 通义千问 API 密钥

## 使用说明

### 提取内置字幕

1. 在输入框中粘贴B站视频链接
2. 输入通义千问 API Key（用于 AI 排版）
3. 点击"提取字幕"按钮
4. 等待处理完成，查看生成的 Markdown 笔记
5. 使用"复制"或"下载"按钮保存结果

### 使用通义听悟（无字幕视频）

1. 如果视频没有内置字幕，系统会提示使用通义听悟
2. 点击"获取视频链接"获取视频文件 URL
3. 在"通义听悟"区域填写：
   - 视频 URL
   - 通义听悟 API Key
   - 选择语言（默认自动检测）
4. 点击"开始转写"
5. 等待转写完成，将结果复制到 AI 排版区域
6. 使用通义千问优化笔记格式

## 常见问题

### 1. 为什么有些视频无法提取字幕？

部分视频没有上传者提供的内置字幕，需要使用通义听悟进行语音转写。

### 2. API Key 在哪里获取？

- 通义千问/通义听悟: https://dashscope.aliyun.com/

### 3. 部署后 API 不工作？

检查 `vercel.json` 配置和 Vercel 部署日志，确保 API 路由正确配置。

### 4. 如何自定义域名？

在 Vercel 项目设置中的 "Domains" 选项添加自定义域名，并按提示配置 DNS。

## 开发计划

- [ ] 支持更多视频平台
- [ ] 批量处理视频
- [ ] 字幕翻译功能
- [ ] 用户账号系统
- [ ] 字幕编辑器
- [ ] 导出更多格式（PDF、Word 等）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题或建议，请在 GitHub 上提交 Issue。

---

**注意**: 使用本工具时请遵守相关平台的服务条款和版权规定。
