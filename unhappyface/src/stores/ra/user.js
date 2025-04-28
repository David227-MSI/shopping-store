import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: 1001, // 假資料，正式版記得串登入
  }),
  persist: true, // pinia-plugin-persistedstate 自動存 localStorage
});