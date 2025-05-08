import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/services/order/orderAxios.js';

export const useUserStore = defineStore('user', () => {
    const user = ref({});        // 會員基本資料 (address, phone, name...)
    const isLoaded = ref(false); // 資料是否載入成功

    function setUser(data) {
        user.value = data;
        isLoaded.value = true;
    }

    function clearUser() {
        user.value = {};
        isLoaded.value = false;
        localStorage.removeItem('token');
    }

    return {
        user,
        isLoaded,
        setUser,
        clearUser,
    };
}, {
    persist: true,
});
