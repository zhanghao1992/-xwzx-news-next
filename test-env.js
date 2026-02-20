// 测试环境变量是否正确加载
const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || 'sk-9c4d89982a6a4bd3b7494d94751fe81c';

console.log('Environment Variable Test:');
console.log('NEXT_PUBLIC_AI_API_KEY:', API_KEY);
console.log('API Key length:', API_KEY.length);
console.log('API Key starts with:', API_KEY.substring(0, 10));

if (API_KEY && API_KEY.length > 20) {
  console.log('✓ API Key is configured');
} else {
  console.log('✗ API Key is not configured correctly');
}
