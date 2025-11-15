import express from 'express';
import cors from 'cors';
import axios from 'axios';
const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());
// Bilibili API functions
function extractBVID(url) {
    const match = url.match(/BV[0-9A-Za-z]+/);
    return match ? match[0] : null;
}
async function getVideoInfo(bvid) {
    const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const response = await axios.get(url, { headers });
    return response.data;
}
function pickCID(videoInfo, pageIndex = 0) {
    const pages = videoInfo.data?.pages || [];
    if (!pages.length) {
        return videoInfo.data?.cid;
    }
    const idx = Math.max(0, Math.min(pageIndex, pages.length - 1));
    return pages[idx]?.cid;
}
async function getPlayerSubtitles(bvid, cid) {
    const url = `https://api.bilibili.com/x/player/v2?cid=${cid}&bvid=${bvid}`;
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const response = await axios.get(url, { headers });
    return response.data;
}
function collectSubtitles(playerData) {
    const subtitles = playerData.data?.subtitle?.subtitles || [];
    return subtitles.map((sub) => ({
        lan: sub.lan,
        lan_doc: sub.lan_doc,
        url: sub.subtitle_url
    }));
}
function chooseSubtitle(subtitles, prefer = 'ai') {
    if (!subtitles.length)
        return null;
    if (prefer === 'ai') {
        const aiSub = subtitles.find(s => s.lan?.includes('ai'));
        if (aiSub)
            return aiSub;
    }
    const zhSub = subtitles.find(s => (s.lan_doc && (/中文|简体/.test(s.lan_doc))) ||
        s.lan === 'zh-CN');
    return zhSub || subtitles[0];
}
async function getSubtitleContent(url) {
    const headers = {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.bilibili.com'
    };
    const response = await axios.get(url, { headers });
    return response.data;
}
function parseSubtitleSegments(body) {
    const items = body.body || [];
    return items.map((item) => ({
        start: parseFloat(item.from || 0),
        end: parseFloat(item.to || 0),
        text: String(item.content || '').trim()
    }));
}
function formatTimestamp(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function generateMarkdown(meta, segments, source) {
    const lines = [];
    lines.push(`# ${meta.title || ''}`);
    lines.push('');
    lines.push(`- 来源: ${meta.url || ''}`);
    lines.push(`- 作者: ${meta.owner || ''}`);
    lines.push(`- BV号: ${meta.bvid || ''}`);
    lines.push(`- 字幕来源: ${source}`);
    lines.push('');
    lines.push('## 正文');
    segments.forEach(seg => {
        lines.push(`- \`${formatTimestamp(seg.start)}\`–\`${formatTimestamp(seg.end)}\` ${seg.text}`);
    });
    return lines.join('\n');
}
// Tongyi Tingwu API integration
async function createTingwuTask(videoUrl, accessKey, language = 'auto') {
    try {
        const response = await axios.post('https://tingwu.aliyuncs.com/api/v1/tasks', {
            AppKey: 'test-app-key', // This should be configured properly
            Input: {
                FileUrl: videoUrl,
                SourceLanguage: language
            }
        }, {
            headers: {
                'Authorization': `Bearer ${accessKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.TaskId;
    }
    catch (error) {
        console.error('Tingwu task creation failed:', error);
        throw error;
    }
}
// async function getTingwuResult(taskId: string, accessKey: string): Promise<any> {
//   try {
//     const response = await axios.get(`https://tingwu.aliyuncs.com/api/v1/tasks/${taskId}`, {
//       headers: {
//         'Authorization': `Bearer ${accessKey}`,
//         'Content-Type': 'application/json'
//       }
//     })
//     return response.data
//   } catch (error) {
//     console.error('Tingwu result retrieval failed:', error)
//     throw error
//   }
// }
// Tongyi Qianwen API integration
async function formatWithAI(text, accessKey) {
    try {
        const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            model: 'qwen-plus',
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的学习笔记整理助手。请将提供的视频字幕内容整理成结构清晰、易于学习的Markdown格式笔记。要求：1. 生成内容摘要和大纲；2. 根据语义进行智能分段；3. 添加合适的标题；4. 优化标点和错别字；5. 保持时间戳信息。'
                },
                {
                    role: 'user',
                    content: text
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${accessKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0]?.message?.content || text;
    }
    catch (error) {
        console.error('AI formatting failed:', error);
        return text; // Return original text if AI formatting fails
    }
}
// Video download service integration using SnapAny API
async function getVideoDownloadUrl(bilibiliUrl) {
    try {
        // SnapAny API for getting video download URL
        const response = await axios.post('https://api.snapany.com/api/download', {
            url: bilibiliUrl,
            format: 'mp4',
            quality: '720p'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        return response.data.downloadUrl || response.data.url;
    }
    catch (error) {
        console.error('Video download URL retrieval failed:', error);
        throw new Error('无法获取视频下载链接');
    }
}
// Extract audio from video URL (using external service or local processing)
async function extractAudioFromVideo(videoUrl) {
    try {
        // For now, we'll return the video URL since Tongyi Tingwu can process video directly
        // In a production environment, you might want to extract audio first
        return videoUrl;
    }
    catch (error) {
        console.error('Audio extraction failed:', error);
        throw new Error('音频提取失败');
    }
}
// API endpoint for video processing
app.post('/api/process-video', async (req, res) => {
    try {
        console.log('Received request:', req.body);
        const { url, accessKey } = req.body;
        if (!url || !accessKey) {
            console.log('Missing parameters:', { url, accessKey });
            return res.status(400).json({
                success: false,
                error: '缺少必要的参数：视频链接和AccessKey'
            });
        }
        const bvid = extractBVID(url);
        console.log('Extracted BVID:', bvid);
        if (!bvid) {
            return res.status(400).json({
                success: false,
                error: '无法从链接中提取BV号'
            });
        }
        // Get video info
        const videoInfo = await getVideoInfo(bvid);
        const cid = pickCID(videoInfo);
        if (!cid) {
            return res.status(400).json({
                success: false,
                error: '无法获取视频CID'
            });
        }
        // Try to get built-in subtitles first
        const playerData = await getPlayerSubtitles(bvid, cid);
        console.log('Player data:', JSON.stringify(playerData, null, 2));
        const subtitles = collectSubtitles(playerData);
        console.log('Found subtitles:', subtitles);
        let markdownContent;
        let source;
        if (subtitles.length > 0) {
            // Use built-in subtitles
            const chosenSubtitle = chooseSubtitle(subtitles);
            console.log('Chosen subtitle:', chosenSubtitle);
            const subtitleContent = await getSubtitleContent(chosenSubtitle.url);
            console.log('Subtitle content:', subtitleContent);
            const segments = parseSubtitleSegments(subtitleContent);
            const meta = {
                title: videoInfo.data?.title || '',
                owner: videoInfo.data?.owner?.name || '',
                bvid,
                url
            };
            source = chosenSubtitle.lan_doc || chosenSubtitle.lan || '内置字幕';
            markdownContent = generateMarkdown(meta, segments, source);
            // Try to enhance with AI
            try {
                markdownContent = await formatWithAI(markdownContent, accessKey);
            }
            catch (error) {
                console.warn('AI enhancement failed, using original content');
            }
        }
        else {
            // No built-in subtitles, provide guidance on using Tongyi Tingwu
            console.log('No subtitles found, providing guidance for Tongyi Tingwu...');
            // Check if the video might have AI-generated subtitles or other options
            const subtitleInfo = playerData.data?.subtitle;
            console.log('Subtitle info:', subtitleInfo);
            return res.status(400).json({
                success: false,
                error: `该视频暂无内置字幕。\n\n视频标题: ${videoInfo.data?.title || '未知'}\n\n替代方案：\n1. 使用通义听悟API进行语音转写\n2. 先下载视频音频，然后上传到通义听悟\n3. 寻找其他带有"CC"标识的视频\n\n下一步操作：\n1. 使用SnapAny等工具获取视频文件URL\n2. 在下方"通义听悟"区域填写视频URL和AccessKey\n3. 生成转写任务并等待完成\n4. 将转写结果复制到AI排版区域`,
                step: 'no-subtitles',
                details: {
                    title: videoInfo.data?.title,
                    hasBuiltInSubtitles: false,
                    subtitleInfo: subtitleInfo,
                    alternative: 'tingwu',
                    message: '该视频无内置字幕，建议使用通义听悟API进行语音转写'
                }
            });
        }
        res.json({
            success: true,
            data: {
                title: videoInfo.data?.title || '学习笔记',
                markdown: markdownContent,
                videoUrl: url
            }
        });
    }
    catch (error) {
        console.error('Video processing error:', error);
        res.status(500).json({
            success: false,
            error: '处理视频时发生错误'
        });
    }
});
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// API endpoint for video download and audio extraction
app.post('/api/download-video', async (req, res) => {
    try {
        const { bilibiliUrl } = req.body;
        if (!bilibiliUrl) {
            return res.status(400).json({
                success: false,
                error: '缺少B站视频链接'
            });
        }
        console.log('Getting video download URL for:', bilibiliUrl);
        // Step 1: Get video download URL
        const videoDownloadUrl = await getVideoDownloadUrl(bilibiliUrl);
        console.log('Video download URL obtained:', videoDownloadUrl);
        // Step 2: Extract audio (for now, return video URL as Tongyi Tingwu can process video directly)
        const audioUrl = await extractAudioFromVideo(videoDownloadUrl);
        console.log('Audio extraction completed:', audioUrl);
        res.json({
            success: true,
            data: {
                videoUrl: videoDownloadUrl,
                audioUrl: audioUrl,
                message: '视频下载链接获取成功，可直接用于通义听悟转写'
            }
        });
    }
    catch (error) {
        console.error('Video download error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '视频下载失败'
        });
    }
});
// API endpoint for Tongyi Tingwu processing
app.post('/api/tingwu-process', async (req, res) => {
    try {
        const { videoUrl, accessKey, language = 'auto' } = req.body;
        if (!videoUrl || !accessKey) {
            return res.status(400).json({
                success: false,
                error: '缺少必要的参数：视频URL和AccessKey'
            });
        }
        // Step 1: Create Tingwu task
        console.log('Creating Tongyi Tingwu task...');
        const taskId = await createTingwuTask(videoUrl, accessKey, language);
        console.log('Task created:', taskId);
        // Step 2: Poll for results (simplified version)
        console.log('Waiting for transcription to complete...');
        // Simulate waiting for the task to complete
        // In a real implementation, you'd poll the API until the task is complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        // For now, return a mock result to demonstrate the flow
        // In production, you'd implement proper polling and result processing
        const mockResult = {
            taskId,
            status: 'completed',
            result: {
                text: '这是一个模拟的转写结果。在实际应用中，这里会显示通义听悟返回的真实转写文本。',
                segments: [
                    { start: 0, end: 5, text: '大家好，欢迎来到今天的视频。' },
                    { start: 5, end: 10, text: '今天我们要讨论一个很有趣的话题。' }
                ]
            }
        };
        res.json({
            success: true,
            data: mockResult
        });
    }
    catch (error) {
        console.error('Tingwu processing error:', error);
        res.status(500).json({
            success: false,
            error: '通义听悟处理失败'
        });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
