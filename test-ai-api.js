// 测试阿里云DashScope API
const API_KEY = 'sk-9c4d89982a6a4bd3b7494d94751fe81c';
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const MODEL = 'qwen3-max-preview';

async function testAI() {
  console.log('Testing AI API...');
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  console.log('URL:', API_URL);
  console.log('Model:', MODEL);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-DashScope-SSE': 'enable'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: '你好' }
        ],
        stream: false // 先测试非流式
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Success! Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testAI();
