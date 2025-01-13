<template>
  <div
    class="sidebar"
    :class="isOpened ? 'open' : ''"
    :style="cssVars"
  >
    <div class="logo-details" style="margin: 6px 14px 0 14px">
      <img
        v-if="menuLogo"
        src="../assets/logo.png"
        alt="menu-logo"
        class="menu-logo icon"
      />
      <i v-else class="bx icon" :class="menuIcon" />
      <div class="logo_name">
        {{ menuTitle }}
      </div>
      <i
        class="bx"
        :class="isOpened ? 'bx-menu-alt-right' : 'bx-menu'"
        id="btn"
        @click="isOpened = !isOpened"
      />
    </div>

    <div
      style="
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-grow: 1;
        max-height: calc(100% - 60px);
      "
    >
      <div id="my-scroll" style="margin: 6px 14px 0 14px">
        <ul class="nav-list" style="overflow: visible">
          <li v-for="(menuItem, index) in menuItems" :key="index" :id="'links_' + index">
            <router-link v-if="isUsedVueRouter" :to="menuItem.link">
              <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
              <span class="links_name">{{ menuItem.name }}</span>
            </router-link>
            <a
              v-else
              @click.stop.prevent="$emit('menuItemClcked', menuItem.link)"
              :href="menuItem.link"
            >
              <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
              <span class="links_name">{{ menuItem.name }}</span>
            </a>
            <span :data-target="'links_' + index" class="tooltip">
              {{ menuItem.tooltip || menuItem.name }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// Props
const props = defineProps({
  isMenuOpen: {
    type: Boolean,
    default: true,
  },
  isUsedVueRouter: {
    type: Boolean,
    default: true,
  },
  menuTitle: {
    type: String,
    default: 'Trading Journal',
  },
  menuLogo: {
    type: String,
    default: '../assets/logo.png',
  },
  menuIcon: {
    type: String,
    default: 'bxl-c-plus-plus',
  },
  isPaddingLeft: {
    type: Boolean,
    default: true,
  },
  menuOpenedPaddingLeftBody: {
    type: String,
    default: '250px',
  },
  menuClosedPaddingLeftBody: {
    type: String,
    default: '78px',
  },
  menuItems: {
    type: Array,
    default: () => [
      {
        link: '/',
        name: 'Dashboard',
        tooltip: 'Dashboard',
        icon: 'bxs-dashboard',
      },
      {
        link: '/Calculator',
        name: 'Calculator',
        tooltip: 'Calculator',
        icon: 'bxs-calculator',
      },
      {
        link: '/Spots',
        name: 'Spots',
        tooltip: 'Spots',
        icon: 'bx-objects-horizontal-left',
      },
      {
        link: '/Futures',
        name: 'Futures',
        tooltip: 'Futures',
        icon: 'bxs-objects-horizontal-left',
      },
      {
        link: '/Settings',
        name: 'Settings',
        tooltip: 'Spots',
        icon: 'bxs-cog',
      },
    ],
  },
  bgColor: {
    type: String,
    default: '#00000000',
  },
  secondaryColor: {
    type: String,
    default: '#1d1b31',
  },
  homeSectionColor: {
    type: String,
    default: '#e4e9f7',
  },
  logoTitleColor: {
    type: String,
    default: '#fff',
  },
  iconsColor: {
    type: String,
    default: '#fff',
  },
  itemsTooltipColor: {
    type: String,
    default: '#e4e9f7',
  },
  menuItemsHoverColor: {
    type: String,
    default: '#9D9D9D',
  },
  menuItemsTextColor: {
    type: String,
    default: '#fff',
  }
});

// States
const isOpened = ref(false);

// Computed
const cssVars = computed(() => ({
  '--bg-color': props.bgColor,
  '--secondary-color': props.secondaryColor,
  '--logo-title-color': props.logoTitleColor,
  '--icons-color': props.iconsColor,
  '--icons-hover-color': props.bgColor,
  '--items-tooltip-color': props.itemsTooltipColor,
  '--menu-items-hover-color': props.menuItemsHoverColor,
  '--menu-items-text-color': props.menuItemsTextColor,
}));

// Watchers
watch(isOpened, (val) => {
  document.body.style.paddingLeft = isOpened.value && props.isPaddingLeft
    ? props.menuOpenedPaddingLeftBody
    : props.menuClosedPaddingLeftBody;
});

// Methods
const tooltipAttached = () => {
  const tooltips = document.querySelectorAll('.tooltip');
  tooltips.forEach((tooltip) => {
    document.body.appendChild(tooltip);
  });
  document.querySelectorAll('.tooltip').forEach((tooltip) => {
    const targetID = tooltip.dataset.target;
    const target = document.querySelector(`#${targetID}`);
    if (!target) return;
    target.addEventListener('mouseenter', () => {
      const targetPosition = target.getBoundingClientRect();
      if (isOpened.value) return;
      tooltip.style.top = `${targetPosition.top + window.scrollY}px`;
      tooltip.style.left = `${targetPosition.left + targetPosition.width + 20}px`;
      tooltip.classList.add('active');
    });
    target.addEventListener('mouseleave', () => {
      tooltip.classList.remove('active');
    });
  });
};

// Lifecycle Hooks
onMounted(() => {
  isOpened.value = props.isMenuOpen;
  tooltipAttached();
});
</script>
  
<style scoped>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      transition: all 0.5s ease;
    }
    .menu-logo {
      width: 30px;
      margin: 0 10px 0 0px;
    }
    .sidebar {
      position: relative;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      max-height: 100vh;
      min-height: min-content;
      /* overflow-y: auto; */
      width: 78px;
      background-color: var(--bg-color);
      /* padding: 6px 14px 0 14px; */
      z-index: 99;
      transition: all 0.5s ease;
    }
    .sidebar.open {
      width: 250px;
    }
    .sidebar .logo-details {
      height: 60px;
      display: flex;
      align-items: center;
      align-content: center;
      position: relative;
    }
    .sidebar .logo-details .icon {
      opacity: 0;
      transition: all 0.5s ease;
    }
    .sidebar .logo-details .logo_name {
      color: var(--logo-title-color);
      font-size: 1.4rem;
      font-weight: 600;
      opacity: 0;
      transition: all 0.5s ease;
      white-space: nowrap;
      padding-top: 0.4rem;
    }
    .sidebar.open .logo-details .icon,
    .sidebar.open .logo-details .logo_name {
      opacity: 1;
    }
    .sidebar .logo-details #btn {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      font-size: 22px;
      transition: all 0.4s ease;
      font-size: 23px;
      text-align: center;
      cursor: pointer;
      transition: all 0.5s ease;
    }
    .sidebar.open .logo-details #btn {
      text-align: right;
    }
    .sidebar i {
      color: var(--icons-color);
      height: 60px;
      min-width: 50px;
      font-size: 1.6rem;
      text-align: center;
      line-height: 60px;
    }
    .sidebar .nav-list {
      margin-top: 20px;
      /* margin-bottom: 60px; */
      /* height: 100%; */
      /* min-height: min-content; */
    }
    .sidebar li {
      position: relative;
      margin: 8px 0;
      list-style: none;
    }
    .tooltip {
      display: none;
      position: absolute;
      /* top: -20px; */
      /* left: calc(100% + 15px); */
      z-index: 3;
      background: var(--items-tooltip-color);
      background-color: azure;
      color: rgb(0, 0, 0);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 400;
      opacity: 0;
      white-space: nowrap;
      pointer-events: none;
      transition: 0s;
    }
    .tooltip.active {
      display: block;
      opacity: 1;
      pointer-events: auto;
      transition: all 0.4s ease;
      /* top: 50%; */
      transform: translateY(25%);
    }
    .sidebar.open li .tooltip {
      display: none;
    }
    .sidebar li a {
      display: flex;
      height: 100%;
      width: 100%;
      border-radius: 12px;
      align-items: center;
      text-decoration: none;
      transition: all 0.4s ease;
      background: var(--bg-color);
    }
    .sidebar li a:hover {
      background: var(--menu-items-hover-color);
    }
    .sidebar li a .links_name {
      color: var(--menu-items-text-color);
      font-size: 1.1rem;
      font-weight: 600;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: 0.4s;
    }
    .sidebar.open li a .links_name {
      opacity: 1;
      pointer-events: auto;
    }
    .sidebar li a:hover .links_name,
    .sidebar li a:hover i {
      transition: all 0.5s ease;
      color: var(--menu-items-text-color);
    }
    .sidebar li router-link {
      display: flex;
      height: 100%;
      width: 100%;
      border-radius: 12px;
      align-items: center;
      text-decoration: none;
      transition: all 0.4s ease;
    }
    .sidebar li router-link:hover {
      background: var(--menu-items-hover-color);
      color: var(--menu-items-text-color);
    }
    .sidebar li router-link .links_name {
      color: var(--menu-items-text-color);
      font-size: 15px;
      font-weight: 400;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: 0.4s;
    }
    .sidebar.open li router-link .links_name {
      opacity: 1;
      pointer-events: auto;
    }
    .sidebar li router-link:hover .links_name,
    .sidebar li router-link:hover i {
      transition: all 0.5s ease;
      color: #000000;
    }
    .sidebar li i {
      height: 50px;
      line-height: 50px;
      font-size: 1.4rem;
      font-weight: 500;
      border-radius: 12px;
    }
    .sidebar div img {
      height: 45px;
      width: 45px;
      object-fit: cover;
      border-radius: 6px;
      margin-right: 10px;
    }
    .my-scroll-active {
      overflow-y: auto;
    }
    #my-scroll {
      overflow-y: auto;
      height: calc(100% - 60px);
    }
    #my-scroll::-webkit-scrollbar {
      display: none;
      /* background-color: rgba(255, 255, 255, 0.2); 
      width: 10px;
      border-radius:5px  */
    }
    @media (max-width: 420px) {
      .sidebar li .tooltip {
        display: none;
      }
    }
</style>