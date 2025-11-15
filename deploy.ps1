# Vercel 快速部署脚本
# 使用方法: .\deploy.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "B站视频字幕提取工具 - Vercel 部署脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未检测到 Node.js" -ForegroundColor Red
    Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 npm 是否可用
Write-Host "检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm 已安装: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm 不可用" -ForegroundColor Red
    exit 1
}

# 检查 Vercel CLI 是否安装
Write-Host "检查 Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✓ Vercel CLI 已安装: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Vercel CLI 未安装" -ForegroundColor Yellow
    Write-Host "正在安装 Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Vercel CLI 安装成功" -ForegroundColor Green
    } else {
        Write-Host "✗ Vercel CLI 安装失败" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "开始部署流程" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 安装依赖
Write-Host "1. 安装项目依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 构建项目
Write-Host "2. 构建项目..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 项目构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 项目构建完成" -ForegroundColor Green
Write-Host ""

# 部署到 Vercel
Write-Host "3. 部署到 Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "选择部署模式:" -ForegroundColor Cyan
Write-Host "  1. 预览部署 (Preview)" -ForegroundColor White
Write-Host "  2. 生产部署 (Production)" -ForegroundColor White
Write-Host ""
$deployMode = Read-Host "请输入选项 (1 或 2)"

if ($deployMode -eq "2") {
    Write-Host "正在执行生产部署..." -ForegroundColor Yellow
    vercel --prod
} else {
    Write-Host "正在执行预览部署..." -ForegroundColor Yellow
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "✓ 部署成功!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "查看部署详情:" -ForegroundColor Cyan
    Write-Host "  - 访问 Vercel 仪表板: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "  - 查看项目设置: 在仪表板中选择你的项目" -ForegroundColor White
    Write-Host "  - 配置自定义域名: Settings -> Domains" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ 部署失败" -ForegroundColor Red
    Write-Host "请检查错误信息并重试" -ForegroundColor Yellow
    exit 1
}
