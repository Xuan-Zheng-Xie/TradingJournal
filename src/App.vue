<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import Sidebar from './components/Sidebar.vue';
import { useI18n } from 'vue-i18n';
import { supported_languages, localStorageName } from '@/globals/globals.js';
const { t, locale } = useI18n();

const sideBar = ref([
    {
      link: '/',
      name: t('sidebar.dashboard'),
      tooltip: t('sidebar.dashboard'),
      icon: 'bxs-dashboard',
    },
    {
      link: '/Calculator',
      name: t('sidebar.calculator'),
      tooltip: t('sidebar.calculator'),
      icon: 'bxs-calculator'
    },
    {
      link: '/Spots',
      name: t('sidebar.spots'),
      tooltip: t('sidebar.spots'),
      icon: 'bx-objects-horizontal-left',
    },
    {
      link: '/Futures',
      name: t('sidebar.futures'),
      tooltip: t('sidebar.futures'),
      icon: 'bxs-objects-horizontal-left',
    },
    {
      link: '/Settings',
      name: t('sidebar.settings'),
      tooltip: t('sidebar.settings'),
      icon: 'bxs-cog',
    }
  ]
)

watchEffect(() => {
  sideBar.value = sideBar.value.map(item => {
    const key = item.link === '/' 
      ? 'dashboard' 
      : item.link.split('/').pop().toLowerCase();

    return {
      ...item,
      name: t(`sidebar.${key}`),
      tooltip: t(`sidebar.${key}`)
    };
  });
});

const changeLanguage = (lang) => {
    locale.value = lang;
    document.title=t('appTitle');
}

const getLanguageFromSetting = () => {
  const settings_string = localStorage.getItem(localStorageName.settings);
  const language = settings_string ? JSON.parse(settings_string).language : null;
  return language
}

const detectLanguage = () => {
  const languages = navigator.languages || [navigator.language];
  const detected_lang = languages.find(lang => 
    supported_languages.some(supported => supported.code === lang)
  );
  return detected_lang
}

onMounted(() => {
  const language = getLanguageFromSetting();
  console.log(language);
  if(language){
    changeLanguage(language);
    return
  }

  const languageToUse = detectLanguage();
  if(languageToUse) {
    const selectedLanguage = supported_languages.find(supported => supported.code === languageToUse);
    changeLanguage(selectedLanguage.code);
  }
  else {
    changeLanguage('en');
  }
});
</script>

<template>
    <div class="app-wrap">
      <Sidebar :menuTitle="t('sidebar.trading_journal')" :menuItems="sideBar" />
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
</template>


<style>
  .app-wrap {
      display: flex;
      height: 100vh;
  }
</style>