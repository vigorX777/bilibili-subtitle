import axios from 'axios'

async function testBilibiliAPI() {
  // Test with a video that's likely to have subtitles - a documentary or educational content
  const bvid = 'BV1yK411x7ct' // This is the same video, let me try a different one
  
  try {
    // Let me try a popular tech video or educational content
    const testVideos = [
      'BV1yK411x7ct', // Original test video
      'BV1GJ411x7h7', // Rick Astley video
      'BV1k4411R7Vw', // Another test video
      'BV1bK411x7ct'  // BMX video
    ]
    
    for (const testBvid of testVideos) {
      console.log(`\n=== Testing BVID: ${testBvid} ===`)
      
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
        break // Found a video with subtitles, stop testing
      } else {
        console.log('❌ No subtitles found')
      }
      
      // Wait a bit between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testBilibiliAPI()