# GitHub 推送指南

## 步骤 1：安装 Git

### 下载 Git
访问 Git 官方网站下载 Windows 版本：
**https://git-scm.com/download/win**

### 安装步骤
1. 运行下载的安装程序
2. 安装过程中保持默认选项即可
3. 安装完成后，**重启 PowerShell**（重要！）

### 验证安装
打开新的 PowerShell 窗口，运行：
```powershell
git --version
```

如果显示版本号，说明安装成功。

---

## 步骤 2：配置 Git（首次使用）

```powershell
# 设置你的用户名
git config --global user.name "你的名字"

# 设置你的邮箱（使用 GitHub 注册时的邮箱）
git config --global user.email "your.email@example.com"

# 验证配置
git config --list
```

---

## 步骤 3：在 GitHub 上创建仓库

1. 登录 GitHub (https://github.com)
2. 点击右上角的 "+" 按钮
3. 选择 "New repository"
4. 填写仓库信息：
   - Repository name: `bilibili-subtitle-extractor` （或你喜欢的名字）
   - Description: `B站视频字幕提取工具`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"
6. **复制**仓库的 URL（类似 `https://github.com/你的用户名/bilibili-subtitle-extractor.git`）

---

## 步骤 4：推送代码到 GitHub

在项目目录下运行以下命令（请先完成上述步骤）：

```powershell
# 进入项目目录
cd "c:\Users\Vigor\OneDrive\Obsidian\个人工作台\Vibe Coding\B站视频字幕提取\Subtitle acquisition"

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 查看待提交的文件
git status

# 提交代码
git commit -m "Initial commit: B站视频字幕提取工具 - 已配置 Vercel 部署"

# 添加远程仓库（替换为你的 GitHub 仓库 URL）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 重命名分支为 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 如果推送时要求登录

#### 方法 1：使用 Personal Access Token（推荐）

1. 在 GitHub 上生成 Token：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 给 Token 命名，如 "Vercel Deploy"
   - 选择权限：至少勾选 `repo` （所有仓库权限）
   - 点击 "Generate token"
   - **复制生成的 Token**（只显示一次！）

2. 推送时输入：
   - Username: 你的 GitHub 用户名
   - Password: 刚才复制的 Token（不是你的 GitHub 密码！）

#### 方法 2：使用 GitHub Desktop（更简单）

1. 下载 GitHub Desktop：https://desktop.github.com/
2. 安装并登录你的 GitHub 账号
3. 在 GitHub Desktop 中：
   - File → Add Local Repository
   - 选择你的项目文件夹
   - 点击 "Publish repository" 推送到 GitHub

---

## 步骤 5：在 Vercel 上部署

代码推送到 GitHub 后：

1. 访问 **https://vercel.com**
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 找到你刚才推送的仓库 `bilibili-subtitle-extractor`
5. 点击 "Import"
6. Vercel 会自动检测配置：
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. 点击 **"Deploy"**
8. 等待 2-3 分钟，部署完成！

---

## 完整命令清单（复制粘贴）

安装 Git 并重启 PowerShell 后，依次运行：

```powershell
# 1. 配置 Git（首次）
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"

# 2. 进入项目目录
cd "c:\Users\Vigor\OneDrive\Obsidian\个人工作台\Vibe Coding\B站视频字幕提取\Subtitle acquisition"

# 3. 初始化并提交
git init
git add .
git commit -m "Initial commit: B站视频字幕提取工具"

# 4. 连接远程仓库（替换为你的仓库 URL）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 5. 推送
git branch -M main
git push -u origin main
```

---

## 常见问题

### Q: git 命令提示找不到？
**A:** 需要先安装 Git，并重启 PowerShell。

### Q: 推送时提示 "Authentication failed"？
**A:** 使用 Personal Access Token 代替密码，或使用 GitHub Desktop。

### Q: 推送很慢或卡住？
**A:** 可能是网络问题，可以：
- 尝试使用 GitHub Desktop
- 或配置 Git 代理（如果有）

### Q: 提示 "remote origin already exists"？
**A:** 运行以下命令：
```powershell
git remote remove origin
git remote add origin https://github.com/你的用户名/你的仓库名.git
```

### Q: 推送后如何更新代码？
**A:** 以后修改代码后运行：
```powershell
git add .
git commit -m "更新说明"
git push
```

---

## 下一步

推送成功后：
1. ✅ 在 GitHub 上查看你的代码仓库
2. ✅ 在 Vercel 上一键部署
3. ✅ 获得一个可访问的网站链接
4. ✅ 以后每次 `git push` 都会自动重新部署

---

## 快速链接

- Git 下载：https://git-scm.com/download/win
- GitHub Desktop：https://desktop.github.com/
- GitHub：https://github.com
- Vercel：https://vercel.com
- Personal Access Token 设置：https://github.com/settings/tokens

---

**提示**：如果你觉得命令行太复杂，强烈推荐使用 **GitHub Desktop**，它提供图形界面，操作更直观！
