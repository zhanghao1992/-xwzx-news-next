// 测试收藏API
const axios = require('axios');

async function testFavoriteAPI() {
  const API_BASE = 'http://127.0.0.1:8000';

  // 先登录获取token
  console.log('1. 测试登录...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/api/user/login`, {
      username: 'test',
      password: '123456'
    });

    console.log('登录响应:', JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.data.code !== 200) {
      console.log('登录失败，请先创建测试用户');
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('Token:', token.substring(0, 30) + '...');

    // 测试获取收藏列表
    console.log('\n2. 测试获取收藏列表...');
    const favResponse = await axios.get(`${API_BASE}/api/favorite/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        page_size: 20
      }
    });

    console.log('收藏列表响应:', JSON.stringify(favResponse.data, null, 2));

    // 添加一个测试收藏
    console.log('\n3. 测试添加收藏...');
    try {
      const addFavResponse = await axios.post(`${API_BASE}/api/favorite/add`, {
        newsId: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('添加收藏响应:', JSON.stringify(addFavResponse.data, null, 2));
    } catch (err) {
      console.log('添加收藏失败（可能新闻ID不存在）:', err.message);
    }

    // 再次获取收藏列表
    console.log('\n4. 再次获取收藏列表...');
    const favResponse2 = await axios.get(`${API_BASE}/api/favorite/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        page_size: 20
      }
    });

    console.log('收藏列表响应2:', JSON.stringify(favResponse2.data, null, 2));

  } catch (error) {
    console.error('请求失败:', error.response?.data || error.message);
  }
}

testFavoriteAPI();
