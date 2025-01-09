import './assets/main.css'
import '/node_modules/primeflex/primeflex.css'
import "primeicons/primeicons.css";

import { createApp } from 'vue';
import App from './App.vue'
import i18n from './i18n';
import router from './router';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';


import AutoComplete from 'primevue/autocomplete';
import Sidebar from './components/Sidebar.vue'
import Button from 'primevue/button'

import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import DataTable from 'primevue/datatable';

import Chart from 'primevue/chart';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import Row from 'primevue/row';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Image from 'primevue/image';
import FileUpload from 'primevue/fileupload';
import Fluid from 'primevue/fluid';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';

import Badge from 'primevue/badge';
import OverlayBadge from 'primevue/overlaybadge';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Panel from 'primevue/panel';
import Fieldset from 'primevue/fieldset';
import FloatLabel from 'primevue/floatlabel';
import RadioButton from 'primevue/radiobutton';

import Slider from 'primevue/slider';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Menu from 'primevue/menu';
import Divider from 'primevue/divider';
import ScrollPanel from 'primevue/scrollpanel';

const app = createApp(App);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
    options: {
        darkModeSelector: '.my-app-dark',
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(i18n);
app.component('AutoComplete', AutoComplete);
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);
app.component('Textarea', Textarea);
app.component('Sidebar', Sidebar);
app.component('Button', Button);
app.component('Dialog', Dialog);
app.component('Drawer', Drawer);
app.component('DataTable', DataTable);
app.component('Chart', Chart);
app.component('Card', Card);
app.component('Checkbox', Checkbox);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.component('Tag', Tag);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('Image', Image);
app.component('Fluid', Fluid);
app.component('FileUpload', FileUpload);
app.component('Badge', Badge);
app.component('OverlayBadge', OverlayBadge);
app.component('DatePicker', DatePicker);
app.component('Select', Select);
app.component('Panel', Panel);
app.component('Fieldset', Fieldset);
app.component('FloatLabel', FloatLabel);
app.component('RadioButton', RadioButton);
app.component('Slider', Slider);
app.component('InputGroup', InputGroup);
app.component('InputGroupAddon', InputGroupAddon);
app.component('Menu', Menu);
app.component('Divider', Divider);
app.component('ScrollPanel', ScrollPanel);

app.use(router).mount('#app');