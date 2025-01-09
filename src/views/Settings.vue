<script setup>
import { ref, watch, onMounted } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useI18n } from 'vue-i18n';
import { supported_languages, localStorageName } from '@/globals/globals.js';
const { t, locale } = useI18n();

const localStorageSettingsName = localStorageName.settings;

const confirm = useConfirm();
const toast = useToast();

const selectedLanguage = ref('en')
const languages = ref(supported_languages);

const confirmFlushfuturesHistoryData = (dataName) => {
    confirm.require({
        message: t('settings.confirmMsg'),
        header:  t('settings.confirmHeader'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('settings.rejectText'),
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: t('settings.acceptText')
        },
        accept: () => {
            flushHistoryData(dataName);
        },
        reject: () => {
            
        }
    });
};

const flushHistoryData = (dataName) => {
    const flushedData = [];
    localStorage.setItem(dataName, JSON.stringify(flushedData));
    toast.add({ severity: 'success', summary: 'Success', detail: 'Successfully clear the history data.', life: 3000 });
};

watch(selectedLanguage, () => {
    changeLanguage(selectedLanguage.value);
    saveSettings();
})

const changeLanguage = (lang) => {
    locale.value = lang;
    document.title=t('appTitle');
}

const getSettings = () => {
    const jsonString = localStorage.getItem(localStorageSettingsName);
    let res = jsonString ? JSON.parse(jsonString) : {language: 'en'};
    return res
}

const saveSettings = () => {
    const settings = {
        'language': selectedLanguage.value,
    }
    localStorage.setItem(localStorageSettingsName, JSON.stringify(settings));
}

const showDonateAddress = ref(false);

onMounted(() => {
    const settings = getSettings();

    selectedLanguage.value = settings.language;
    changeLanguage(settings.language);
})
</script>

<template>
    <div class="w-full h-full flex flex-wrap flex-column">
        <div class="content pt-3">
            <div class="w-full h-full">
                <div class="w-full flex flex-column gap-3 mt-3 ml-4">
                    <h1 class="settings-header">{{ t('settings.clear_history_data') }}</h1>
                    <Toast />
                    <ConfirmDialog style="min-width: 19vw;" />
                    <div class="flex flex-wrap gap-2">
                        <Button severity="secondary" @click="confirmFlushfuturesHistoryData('spotsHistory')">{{ t('settings.spots') }}</Button>
                        <Button severity="secondary" @click="confirmFlushfuturesHistoryData('futuresHistory')">{{ t('settings.perpetual_futures') }}</Button>
                    </div>
                </div>
                
                <Divider />

                <div class="w-full flex flex-column gap-3 pt-3 ml-4">
                    <h1 class="settings-header">{{ t('settings.languages') }}</h1>
                    <Select v-model="selectedLanguage" :options="languages" optionLabel="name" optionValue="code" checkmark :highlightOnSelect="false" style="width: 20vw;" size="small" :pt="{
                        root: 'selector-bg'
                    }"/>
                </div>
            </div>
        </div>
        <Divider />
        <footer class="footer">
            <div class="footer-content flex flex-wrap justify-content-center align-items-center flex-column">
                <div class="flex gap-3 mt-2">
                    <a class="pi pi-github icon" style="font-size: 2rem;" href="https://github.com/Xuan-Zheng-Xie/TradingJournal" target="_blank" rel="noopener noreferrer"></a>
                    <i class="bx bxs-donate-heart icon" style="font-size: 2rem;" @click="showDonateAddress=true"></i>
                </div>
                <div class="footer-text mt-2">
                    <p>&copy; {{ t('settings.copyright') }}</p>
                </div>
            </div>
        </footer>

        <Dialog v-model:visible="showDonateAddress" :modal="true">
            <template #header>
                <span class="dialog-header">{{ t('settings.donation') }}</span>
            </template>
            <img src="../assets/binance_address.jpg" style="width: 20vw;" alt="">
        </Dialog>
    </div>
</template>

<style scoped>
.settings-header{
    color: #fff;
}
.selector-bg{
    background-color: rgba(43, 43, 43, 0.425);
}

.content {
    flex-grow: 1; /* This ensures content takes up all available space */
}

.footer {
    width: 100%;
    height: 10vh;
    position: relative;
    bottom: 0;
}

.dialog-header{
    font-size: 1.4rem;
    font-weight: 600;
}

.icon{
    cursor: pointer;
    text-decoration: none;
    color: inherit;
}

.icon:visited {
    color: inherit;
}

.icon:hover {
    color: inherit;
}
</style>