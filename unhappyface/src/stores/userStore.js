import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    username: null,
    email: null,
    token: null,
    address: null,
    phone: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    getUserInfo: (state) => ({
      userId: state.userId,
      username: state.username,
      email: state.email,
      address: state.address,
      phone: state.phone,
    }),
    getToken: (state) => state.token,
  },
  actions: {
    setUser(userData) {
      this.userId = userData.userId;
      this.username = userData.username;
      this.email = userData.email;
      this.token = userData.token;
      this.address = userData.address;
      this.phone = userData.phone;
    },
    clearUser() {
      this.userId = null;
      this.username = null;
      this.email = null;
      this.token = null;
      this.address = null;
      this.phone = null;
      // 清除 localStorage 中持久化的 state
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('token');
      localStorage.removeItem('address');
      localStorage.removeItem('phone');
    },
  },
  persist: {
    storage: localStorage, // 使用 localStorage 進行持久化
    paths: ['userId', 'username', 'email', 'token', 'address', 'phone'], // 指定需要持久化的 state 屬性
  },
});