import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue'
import Calculator from '../views/Calculator.vue'
import Futures from '../views/Futures.vue'
import Spots from '../views/Spots.vue'
import Settings from '../views/Settings.vue'

const router = createRouter(
    {
        history: createWebHashHistory(),
        routes: [
            {
                path: '/',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: '/Calculator',
                name: 'Calculator',
                component: Calculator
            },
            {
                path: '/Spots',
                name: 'Spots',
                component: Spots
            },
            {
                path: '/Futures',
                name: 'Futures',
                component: Futures
            },
            {
                path: '/Settings',
                name: 'Settings',
                component: Settings
            }
        ]
    }
)

export default router