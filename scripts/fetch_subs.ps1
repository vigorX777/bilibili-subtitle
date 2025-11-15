param(
  [string]$Url
)
$ua = @{ "User-Agent" = "Mozilla/5.0" }
$ref = @{ "User-Agent" = "Mozilla/5.0"; "Referer" = "https://www.bilibili.com/video/$bv" }
$bv = [regex]::Match($Url, "BV[0-9A-Za-z]+").Value
if (-not $bv) { Write-Output "NO_BVID"; exit 1 }
$uview = "https://api.bilibili.com/x/web-interface/view?bvid=$bv"
$view = (Invoke-WebRequest -Headers $ua $uview).Content | ConvertFrom-Json
$data = $view.data
$cid = if ($data.pages) { $data.pages[0].cid } else { $data.cid }
$playerUrl = "https://api.bilibili.com/x/player/v2?cid=$cid`&bvid=$bv"
$player = (Invoke-WebRequest -Headers $ref $playerUrl).Content | ConvertFrom-Json
$subs = $player.data.subtitle.subtitles
if (-not $subs) { Write-Output "NO_SUBS"; exit 2 }
$chosen = $subs | Where-Object { $_.lan_doc -like "*中文*" -or $_.lan -eq "zh-CN" } | Select-Object -First 1
if (-not $chosen) { $chosen = $subs[0] }
$suburl = $chosen.subtitle_url
$body = (Invoke-WebRequest -Headers $ref $suburl).Content | ConvertFrom-Json
$dir = "output"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
$file = Join-Path $dir "$bv.md"
function FormatTs([double]$s) {
  $ts = [TimeSpan]::FromSeconds([int]$s)
  if ($ts.Hours -eq 0 -and $ts.Days -eq 0) { return ("{0:00}:{1:00}:{2:00}" -f 0,$ts.Minutes,$ts.Seconds) }
  return ("{0:00}:{1:00}:{2:00}" -f $ts.Hours,$ts.Minutes,$ts.Seconds)
}
$title=$data.title
$owner=$data.owner.name
$src="https://www.bilibili.com/video/$bv"
$lines = @()
$lines += "# $title"
$lines += ""
$lines += "- 来源: $src"
$lines += "- 作者: $owner"
$lines += "- BV号: $bv"
$lines += "- 字幕来源: $($chosen.lan_doc)"
$lines += ""
$lines += "## 正文"
foreach ($seg in $body.body) {
  $lines += "- [" + (FormatTs($seg.from)) + "]-[" + (FormatTs($seg.to)) + "] " + ($seg.content).ToString().Trim()
}
$lines | Out-File -FilePath $file -Encoding utf8
Write-Output $file