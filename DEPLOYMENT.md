# B站视频字幕提取工具 - Vercel 部署指南

## 前置要求

1. **Node.js 和 npm**
   - 安装 Node.js（推荐 v18 或更高版本）
   - 下载地址: https://nodejs.org/

2. **Vercel 账号**
   - 注册账号: https://vercel.com/signup
   - 可以使用 GitHub、GitLab 或 Bitbucket 账号登录

## 部署步骤

### 方法一：通过 Vercel 网页界面部署（推荐）

1. **准备 Git 仓库**
   ```powershell
   # 初始化 Git 仓库（如果还没有）
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   ```

2. **推送到 GitHub**
   - 在 GitHub 上创建一个新仓库
   - 推送代码到 GitHub:
   ```powershell
   git remote add origin <你的GitHub仓库URL>
   git branch -M main
   git push -u origin main
   ```

3. **在 Vercel 上导入项目**
   - 访问 https://vercel.com/new
   - 选择 "Import Git Repository"
   - 选择你刚才推送的 GitHub 仓库
   - Vercel 会自动检测到这是一个 Vite 项目

4. **配置部署设置**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   
5. **点击 "Deploy"**
   - Vercel 会自动构建和部署你的应用
   - 部署完成后会获得一个 `.vercel.app` 域名

### 方法二：使用 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```powershell
   vercel login
   ```

3. **部署项目**
   ```powershell
   # 进入项目目录
   cd "c:\Users\Vigor\OneDrive\Obsidian\个人工作台\Vibe Coding\B站视频字幕提取\Subtitle acquisition"
   
   # 首次部署（会引导你配置项目）
   vercel
   
   # 生产环境部署
   vercel --prod
   ```

4. **配置问题回答**
   - Set up and deploy? `Y`
   - Which scope? 选择你的账号
   - Link to existing project? `N`
   - What's your project's name? `bilibili-subtitle-extractor`
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

## 项目配置说明

### 文件结构
```
.
├── api/
│   ├── index.ts          # Vercel Serverless API 入口
│   └── server.ts         # 原本地开发服务器
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── dist/                 # 构建输出目录
├── package.json
├── vercel.json          # Vercel 配置文件
├── vite.config.ts
└── .gitignore
```

### vercel.json 配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 环境变量配置（可选）

如果你的应用需要 API 密钥或其他敏感信息：

1. **在 Vercel 网页界面**
   - 进入项目 → Settings → Environment Variables
   - 添加需要的环境变量

2. **使用 CLI**
   ```powershell
   vercel env add VARIABLE_NAME
   ```

## 本地测试

在部署前，确保本地构建成功：

```powershell
# 安装依赖
npm install

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 常见问题

### 1. 构建失败
- 检查 Node.js 版本（推荐 v18+）
- 删除 `node_modules` 和 `package-lock.json`，重新安装依赖
- 检查 TypeScript 类型错误

### 2. API 路由不工作
- 确保 `vercel.json` 配置正确
- 检查 API 路由路径是否以 `/api/` 开头
- 查看 Vercel 部署日志

### 3. 环境变量未生效
- 在 Vercel 项目设置中添加环境变量
- 重新部署项目

## 自动部署

连接 Git 仓库后，Vercel 会自动：
- 监听 `main` 分支的推送
- 每次推送自动触发部署
- 生成预览链接用于测试

## 自定义域名

1. 在 Vercel 项目设置中选择 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 监控和日志

- 访问 Vercel 项目仪表板查看：
  - 部署状态
  - 构建日志
  - 运行时日志
  - 访问统计

## 更新项目

推送代码到 Git 仓库即可触发自动部署：
```powershell
git add .
git commit -m "Update features"
git push
```

## 资源链接

- Vercel 文档: https://vercel.com/docs
- Vite 文档: https://vitejs.dev/
- Node.js 下载: https://nodejs.org/

## 技术支持

如遇问题，可以：
1. 查看 Vercel 部署日志
2. 查阅 Vercel 文档
3. 在 GitHub Issues 中提问
