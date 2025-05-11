<template>
  <main>
    <h2>這是首頁</h2>
    <!-- back -->
    <!-- <AdminCreateCouponTemplate /> -->
    <!-- <AdminCouponTemplateList /> -->
    <!-- <AdminEventList /> -->
    <!-- <AdminNotificationTemplateList /> -->
    <!-- <AdminAddPrizeToEvent /> -->
    <!-- <AdminCreateEvent /> -->

    <!-- front -->
    <UserEventList2 />

  </main>
</template>

<script setup>
  
  import UserEventList2 from '@/views/pages/ttpp/front/UserEventList2.vue';


  // back create
  import AdminCreateCouponTemplate from '@/views/pages/ttpp/back/AdminCreateCouponTemplate.vue';
  import AdminCreateEvent from '@/views/pages/ttpp/back/AdminCreateEvent.vue';
  import AdminAddPrizeToEvent from '@/views/pages/ttpp/back/AdminAddPrizeToEvent.vue';
  
  // back list
  import AdminCouponTemplateList from '@/views/pages/ttpp/back/AdminCouponTemplateList.vue';
  import AdminEventList from '@/views/pages/ttpp/back/AdminEventList.vue';
  
  import AdminNotificationTemplateList from '@/views/pages/ttpp/back/AdminNotificationTemplateList.vue';


</script>
