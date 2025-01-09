<script setup>
import Recorder from '@/components/Recorder.vue';
import { ref } from "vue";
const historyDataLocalStorageName = ref('spotsHistory')
</script>

<template>
    <Recorder :historyDataLocalStorageName="historyDataLocalStorageName" />
</template>