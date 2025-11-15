import axios from 'axios'

async function testBilibiliAPI() {
  // Try some videos that are more likely to have subtitles
  const testVideos = [
    'BV1q4411R7t7', // 罗翔说刑法 (likely to have subtitles)
    'BV1k4411R7Vw', // 大仙视频
    'BV1GJ411x7h7', // Rick Astley
    'BV1bK411x7ct', // BMX video
    'BV1yK411x7ct'  // Another test
  ]
  
  for (const testBvid of testVideos) {
    console.log(`\n=== Testing BVID: ${testBvid} ===`)
    
    try {
      // Get video info
      console.log('Getting video info...')
      const videoInfo = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${testBvid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      
      const title = videoInfo.data.data?.title || 'Unknown'
      console.log('Video title:', title)
      
      const cid = videoInfo.data.data?.cid || videoInfo.data.data?.pages?.[0]?.cid
      console.log('Using CID:', cid)
      
      if (!cid) {
        console.log('No CID found!')
        continue
      }
      
      // Get player subtitles
      console.log('Getting player subtitles...')
      const playerData = await axios.get(`https://api.bilibili.com/x/player/v2?cid=${cid}&bvid=${testBvid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      
      const subtitles = playerData.data.data?.subtitle?.subtitles || []
      console.log('Found subtitles:', subtitles.length)
      
      if (subtitles.length > 0) {
        console.log('✅ SUCCESS - Found subtitles!')
        subtitles.forEach((sub, index) => {
          console.log(`  ${index + 1}. Language: ${sub.lan}, Description: ${sub.lan_doc}, URL: ${sub.subtitle_url}`)
        })
        
        // Let's actually download one subtitle to test
        console.log('\nTesting subtitle download...')
        const subtitleContent = await axios.get(subtitles[0].subtitle_url, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com' }
        })
        console.log('Subtitle content sample:', JSON.stringify(subtitleContent.data, null, 2).substring(0, 500) + '...')
        
        break // Found a video with subtitles, stop testing
      } else {
        console.log('❌ No subtitles found')
      }
      
      // Wait a bit between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Error testing this video:', error.message)
    }
  }
}

testBilibiliAPI()