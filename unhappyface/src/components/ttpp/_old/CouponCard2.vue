<template>
    <div class="container">
        <div class="card">
            <div class="face face1">
                <div class="content">
                    <img src="https://media.istockphoto.com/id/2161406468/zh/%E5%90%91%E9%87%8F/golden-ticket-gold-vector-coupon-sticker-or-discount-tag-mockup-isolated-on-black-background.jpg?s=2048x2048&w=is&k=20&c=lnYHWwVF8vsdyMfmwjd0-Cvyc-erHe_GMbEn75-D6F4=">
                    <h3>{{ formatCouponTitle }}</h3>
                </div>
            </div>
            <div class="face face2">
                <div class="content">
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum cumque minus iste veritatis provident at.</p>
                        <a href="#">Read More</a>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="face face1">
                <div class="content">
                    <img src="https://github.com/Jhonierpc/WebDevelopment/blob/master/CSS%20Card%20Hover%20Effects/img/code_128.png?raw=true">
                    <h3>Code</h3>
                </div>
            </div>
            <div class="face face2">
                <div class="content">
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum cumque minus iste veritatis provident at.</p>
                        <a href="#">Read More</a>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="face face1">
                <div class="content">
                    <img src="https://github.com/Jhonierpc/WebDevelopment/blob/master/CSS%20Card%20Hover%20Effects/img/launch_128.png?raw=true">
                    <h3>Launch</h3>
                </div>
            </div>
            <div class="face face2">
                <div class="content">
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum cumque minus iste veritatis provident at.</p>
                        <a href="#">Read More</a>
                </div>
            </div>
        </div>
    </div>
</template>




<script setup>
import { computed } from 'vue';

const props = defineProps({
    coupon: {
        type: Object,
        required: true,
        default: () => ({}), // Provide a default empty object
    },
});

const emit = defineEmits(['open-detail']);

// 格式化優惠券標題
const formatCouponTitle = computed(() => {
    if (!props.coupon) {
        return '無折扣資訊'; // Fallback if coupon is undefined
    }
    const { discountType, discountValue, maxDiscount } = props.coupon;
    if (discountType === 'VALUE') {
        return `$${discountValue} 折扣`;
    }
    return `${discountValue}% 折扣${maxDiscount ? ` (最高 $${maxDiscount})` : ''}`;
});

// 格式化適用類型
const formatApplicableType = computed(() => {
    if (!props.coupon) {
        return '未知類型';
    }
    const types = {
        ALL: '全品項適用',
        BRAND: '特定品牌',
        PRODUCT: '特定商品',
        CATEGORY: '特定類別',
    };
    return types[props.coupon.applicableType] || props.coupon.applicableType || '未知';
});

// 格式化日期範圍
const formatDateRange = computed(() => {
    if (!props.coupon) {
        return '無日期';
    }
    const { startTime, endTime } = props.coupon;
    return `${formatDate(startTime)} - ${formatDate(endTime)}`;
});

// 格式化單個日期
const formatDate = (dateString) => {
    if (!dateString) return '無';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

// 判斷是否即將到期
const isExpiring = (endTime) => {
    if (!endTime) return false;
    const end = new Date(endTime);
    const now = new Date();
    const daysUntilExpiry = (end - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
};

// 判斷是否已過期
const isExpired = (endTime) => {
    if (!endTime) return false;
    const end = new Date(endTime);
    const now = new Date();
    return end < now;
};

// 格式化狀態
const formatStatus = computed(() => {
    if (!props.coupon) {
        return '未知狀態';
    }
    const { isUsed, endTime, tradeable } = props.coupon;
    if (isUsed) return '已使用';
    if (isExpiring(endTime)) return '即將到期';
    if (isExpired(endTime)) return '已過期';
    return tradeable ? '可交易' : '有效';
});
</script>






<style scoped>
body{
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: consolas;
}

.container{
    width: 1000px;
    position: relative;
    display: flex;
    justify-content: space-between;
}

.container .card{
    position: relative;
    cursor: pointer;
}

.container .card .face{
    width: 300px;
    height: 200px;
    transition: 0.5s;
}

.container .card .face.face1{
    position: relative;
    background: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    transform: translateY(100px);
}

.container .card:hover .face.face1{
    background: #ff0057;
    transform: translateY(0);
}

.container .card .face.face1 .content{
    opacity: 0.2;
    transition: 0.5s;
}

.container .card:hover .face.face1 .content{
    opacity: 1;
}

.container .card .face.face1 .content img{
    max-width: 100px;
}

.container .card .face.face1 .content h3{
    margin: 10px 0 0;
    padding: 0;
    color: #fff;
    text-align: center;
    font-size: 1.5em;
}

.container .card .face.face2{
    position: relative;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    transform: translateY(-100px);
}

.container .card:hover .face.face2{
    transform: translateY(0);
}

.container .card .face.face2 .content p{
    margin: 0;
    padding: 0;
}

.container .card .face.face2 .content a{
    margin: 15px 0 0;
    display:  inline-block;
    text-decoration: none;
    font-weight: 900;
    color: #333;
    padding: 5px;
    border: 1px solid #333;
}

.container .card .face.face2 .content a:hover{
    background: #333;
    color: #fff;
}
</style>
