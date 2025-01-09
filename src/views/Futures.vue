<script setup>
import Recorder from '@/components/Recorder.vue';
import { ref } from "vue";
const historyDataLocalStorageName = ref('futuresHistory')
</script>

<template>
    <Recorder :historyDataLocalStorageName="historyDataLocalStorageName" />
</template>