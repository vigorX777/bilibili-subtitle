import axios from 'axios';

async function testTingwuAPI() {
  try {
    console.log('Testing Tongyi Tingwu processing...');
    
    // First, download the video
    console.log('Step 1: Downloading video...');
    const downloadResponse = await axios.post('http://localhost:9090/api/download-video', {
      bilibiliUrl: 'https://www.bilibili.com/video/BV1GdCsBPEvE/?share_source=copy_web&vd_source=eb46e9ffc765ae89070146d6c4acb4e7'
    });
    
    console.log('Download response:', downloadResponse.data);
    
    if (downloadResponse.data.success) {
      // Then process with Tongyi Tingwu
      console.log('Step 2: Processing with Tongyi Tingwu...');
      const tingwuResponse = await axios.post('http://localhost:9090/api/tingwu-process', {
        videoUrl: downloadResponse.data.videoUrl,
        accessKey: 'sk-a9c7af3a35d14b32af8278201f4d5970',
        language: 'auto'
      });
      
      console.log('Tingwu response:', JSON.stringify(tingwuResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

testTingwuAPI();