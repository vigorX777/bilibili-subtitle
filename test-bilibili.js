import axios from 'axios'

async function testBilibiliAPI() {
  const bvid = 'BV1bK411x7ct'
  
  try {
    // Get video info
    console.log('Getting video info for BVID:', bvid)
    const videoInfo = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    console.log('Video info:', JSON.stringify(videoInfo.data, null, 2))
    
    const cid = videoInfo.data.data?.cid || videoInfo.data.data?.pages?.[0]?.cid
    console.log('Using CID:', cid)
    
    if (!cid) {
      console.log('No CID found!')
      return
    }
    
    // Get player subtitles
    console.log('Getting player subtitles...')
    const playerData = await axios.get(`https://api.bilibili.com/x/player/v2?cid=${cid}&bvid=${bvid}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    console.log('Player data:', JSON.stringify(playerData.data, null, 2))
    
    const subtitles = playerData.data.data?.subtitle?.subtitles || []
    console.log('Found subtitles:', subtitles)
    
    if (subtitles.length > 0) {
      console.log('Available subtitles:')
      subtitles.forEach((sub, index) => {
        console.log(`${index + 1}. Language: ${sub.lan}, Description: ${sub.lan_doc}, URL: ${sub.subtitle_url}`)
      })
    } else {
      console.log('No subtitles found in this video!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testBilibiliAPI()