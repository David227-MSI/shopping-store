import { useRouter } from 'vue-router';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

export function useAuth() {
  const router = useRouter();
  const userStore = useUserStore();

  const logout = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/secure/logout`);
      console.log(response.data?.data?.message);
    } catch (error) {
      console.error('登出失敗', error);
    } finally {
      // 清除 localStorage 中的使用者資訊
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('phone');
      localStorage.removeItem('address');

      // 清除 Pinia store 中的使用者資訊
      userStore.clearUser();

      router.push('/secure/login');
    }
  };

  return {
    logout
  };
}