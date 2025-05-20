import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import axios from '@/services/order/orderAxios.js';
import { useCartStore } from '@/stores/cart/cartStore.js';
import { useUserStore } from '@/stores/userStore';

export const useCouponStore = defineStore('coupon', () => {
    const couponList = ref([]);
    const selectedCouponId = ref(null);

    const cartStore = useCartStore();
    const userStore = useUserStore();

    // 取得商品ID陣列
    const productIds = computed(() =>
        cartStore.selectedCartItems.map((item) => item.product?.id ?? item.productId)
    );

    const totalAmount = computed(() => cartStore.selectedTotalAmount);

    // 計算已選優惠券的詳細資料
    const selectedCoupon = computed(() =>
        couponList.value.find(c => c.id === selectedCouponId.value) || null
    );

    const discountAmount = computed(() => {
        const coupon = selectedCoupon.value;
        const total = totalAmount.value;

        if (!coupon) return 0;
        if (coupon.discountType === 'VALUE') return coupon.discountValue;
        if (coupon.discountType === 'PERCENTAGE') {
            const discount = total * (1 - coupon.discountValue / 100);
            return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
        }
        return 0;
    });

    function setSelectedCoupon(id) {
        selectedCouponId.value = id;
    }

    // 載入符合條件的優惠券
    async function fetchValidCoupons() {
        if (!userStore.userId) return;

        const hasProducts = productIds.value.length > 0;
        const total = totalAmount.value;

        // 購物車為空，不送出請求，並清空優惠券資料
        if (!hasProducts || total === 0) {
            couponList.value = [];
            selectedCouponId.value = null;
            return;
        }

        try {
            const res = await axios.post('/api/user/coupons/getValidCoupon', {
                userId: userStore.userId,
                totalAmount: total,
                productIds: productIds.value,
            });
            couponList.value = res.data.couponList;
        } catch (err) {
            console.error('載入可用優惠券失敗', err);
        }
    }

    // 監聽勾選商品的變化與其總金額
    watch(
        () => [totalAmount.value, productIds.value],
        fetchValidCoupons,
        { immediate: true }
    );

    return {
        couponList,
        selectedCouponId,
        selectedCoupon,
        discountAmount,
        fetchValidCoupons,
        setSelectedCoupon,
    };
});
