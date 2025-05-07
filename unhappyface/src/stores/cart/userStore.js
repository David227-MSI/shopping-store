import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/services/order/orderAxios.js';

export const useUserStore = defineStore('user', () => {
    const user = ref({});        // 會員基本資料 (address, phone, name...)
    const isLoaded = ref(false); // 資料是否載入成功

    async function fetchUserInfo() {
        try {
            const res = await axios.get('/ajax/secure/memberinfo');
            if (res.success) {
                user.value = res.data;
                isLoaded.value = true;
            } else {
                user.value = {};
                isLoaded.value = false;
            }
        } catch (error) {
            user.value = {};
            isLoaded.value = false;
        }
    }

    function setUser(data) {
        user.value = data;
        isLoaded.value = true;
    }

    function clearUser() {
        user.value = {};
        isLoaded.value = false;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    }

    return {
        user,
        isLoaded,
        fetchUserInfo,
        setUser,
        clearUser,
    };
}, {
    persist: true,
});
