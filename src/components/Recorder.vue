<script setup>
// utility setup
import { ref, onMounted } from 'vue';
import { useToast } from "primevue/usetoast";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
    historyDataLocalStorageName: {
        type: String,
        required: true
    }
});

const toast = useToast();
const historyDataLocalStorageName = props.historyDataLocalStorageName;

/* =========== Utility Functions =========== */

// change to loal utc
const formatter = new Intl.DateTimeFormat(
    'en-US', {
        timaZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }
)

// descriptions template
const descriptionsTemplate = `descriptions:
1. 
2. 
3. 
`;

/* =========== Frontend Functions =========== */
onMounted(() => {
    try {
        setupHistoryData();
    }
    catch (error) {

    }
}
);

const setupHistoryData = () => {
    const HistoryData = localStorage.getItem(historyDataLocalStorageName);
    History.value = HistoryData ? JSON.parse(HistoryData) : [];
}

// scripts for history table
const History = ref([]);
const showEditHistoryDialog = ref(false);
const is_image_edited = ref(false);
const edit_image = ref(null);
const edit_historyData = ref({});

const onShowEditHistoryDataDialog = (historyData) => {
    edit_historyData.value = {...historyData};
    edit_historyData.value.date = new Date(edit_historyData.value.date);
    edit_image.value = historyData.image;
    showEditHistoryDialog.value = true;
};

const flushEditHistoryData = () => {
    edit_image.value = null;
    edit_historyData.value = {};
    is_image_edited.value = false;
}

const onSubmitEditHistoryData = () => {
    if (edit_historyData.value.date===''){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.date_is_null'), life: 3000 });
        return
    }
    if (edit_historyData.value.symbol===''){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.symbol_is_null'), life: 3000 });
        return
    }
    if (edit_historyData.value.quantity===null){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.quantity_is_null'), life: 3000 });
        return
    }
    if (edit_historyData.value.risk===null){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.risk_is_null'), life: 3000 });
        return
    }
    if (edit_historyData.value.profit===null){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.profit_is_null'), life: 3000 });
        return
    }

    const target_idx = History.value.findIndex(item => item.id === edit_historyData.value.id);
    edit_historyData.value.image = edit_image.value;
    History.value[target_idx] = edit_historyData.value;

    History.value = History.value.sort((a,b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem(historyDataLocalStorageName, JSON.stringify(History.value));

    flushEditHistoryData();
    toast.add({ severity: 'success', summary: t('toast.success'), detail: t('toast.successfully_edit_records'), life: 3000 });
    
    showEditHistoryDialog.value = false;
}

const onDeleteHistoryData = (historyData) => {
    History.value = History.value.filter(item => item.id !== historyData.id);
    localStorage.setItem(historyDataLocalStorageName, JSON.stringify(History.value));
}

const exportTXTHistoryData = (historyStorageName) => {
    const josnString = localStorage.getItem(historyStorageName);

    if(!josnString){
        toast.add({ severity: 'warn', summary: t('toast.warning'), detail: t('toast.no_history_data'), life: 3000 });
    }

    const blob = new Blob([josnString], { type: "type/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = historyDataLocalStorageName + '.txt';

    link.click();

    URL.revokeObjectURL(link.href);
}

const importTXTHistoryData = (event) => {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        const txtContent = e.target.result;
        localStorage.setItem(historyDataLocalStorageName, txtContent);

        const parsedContent = JSON.parse(txtContent);
        History.value = parsedContent.sort((a,b) => new Date(a.date) - new Date(b.date));
    };

    reader.readAsText(file);
};

// scripts for img upload in add history dialog
const showAddHistoryDialog = ref(false);

const today = new Date();
const history_date = ref(today);
const history_symbol = ref('');
const history_profit = ref(null);
const history_risk = ref(1);
const history_quantity = ref(null);
const history_image = ref(null);
const history_descriptions = ref(descriptionsTemplate);

function flushHistoryInput() {
    history_date.value = new Date();
    history_symbol.value = '';
    history_quantity.value = null;
    history_profit.value = null;
    history_risk.value = 1;
    history_image.value = '';
    history_descriptions.value = descriptionsTemplate;
}

function onSubmitHistory() {
    if (history_date.value===''){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.date_is_null'), life: 3000 });
        return
    }
    if (history_symbol.value===''){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.symbol_is_null'), life: 3000 });
        return
    }
    if (history_quantity.value===null){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.quantity_is_null'), life: 3000 });
        return
    }
    if (history_risk.value===null){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.risk_is_null'), life: 3000 });
        return
    }
    if (history_profit.value===null){
        toast.add({ severity: 'warn', summary: t('toast.invalide_data'), detail: t('toast.profit_is_null'), life: 3000 });
        return
    }

    const newHistoryData = {
        "id": crypto.randomUUID(),
        "date": history_date.value,
        "dateLabel": formatter.format(new Date(history_date.value)),
        "symbol": history_symbol.value,
        "image": history_image.value,
        "quantity": history_quantity.value,
        "risk": history_risk.value,
        "profit": history_profit.value,
        "description": history_descriptions.value,
    }
    
    History.value.push(newHistoryData);
    History.value = History.value.sort((a,b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem(historyDataLocalStorageName, JSON.stringify(History.value));

    flushHistoryInput();

    toast.add({ severity: 'success', summary: t('toast.success'), detail: t('toast.succesfully_saved_data'), life: 3000 });
    showAddHistoryDialog.value = false;
}
</script>

<template>
    <div class="card w-full h-full text-base">
        <Toolbar class="m-2">
            <template #start>
                <Button :label="t('recorder.new')" icon="pi pi-plus" class="mr-2" @click="showAddHistoryDialog=true" />
            </template>

            <template #end>
                <FileUpload mode="basic" accept=".txt" @select="importTXTHistoryData" customUpload :chooseLabel="t('recorder.import')" class="mr-2" auto :chooseButtonProps="{ severity: 'secondary' }" />
                <Button icon="pi pi-upload" severity="secondary" :label="t('recorder.export')" @click="exportTXTHistoryData(historyDataLocalStorageName)" />
            </template>
        </Toolbar>
        <DataTable
            :value="History"
            :paginator="true"
            :alwaysShowPaginator="false"
            :rows="10"
            :first="(History.length / 10) | 0"
        >
            <Column field="date"  style="width: 10%;">
                <template #header>
                    <span>{{ t('recorder.date') }}</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.dateLabel }}</span>
                </template>
            </Column>
            <Column field="symbol" style="width: 10%;">
                <template #header>
                    <span>{{ t('recorder.symbol') }}</span>
                </template>
                <template #editor="{ data, field }">
                    <div class="w-full h-full">
                        <InputText v-model:model-value="data[field]" suffix="USDT" fluid class="focus:border-primary"/>
                    </div>
                </template>
            </Column>
            <Column field="image" style="width: 20%;">
                <template #header>
                    {{ t('recorder.image') }}
                </template>
                <template #body="slotProps">
                    <img v-if="slotProps.data.image" :src="slotProps.data.image" class="trading-img"/>
                    <i v-else class="pi pi-image" />
                </template>
            </Column>
            <Column field="risk" header="Risk" style="width: 7%;">
                <template #body="slotProps">
                    {{ slotProps.data.risk }}%
                </template>
            </Column>
            <Column field="quantity" style="width: 10%;">
                <template #header>
                    <span>{{ t('recorder.quantity') }}</span>
                </template>
                <template #body="slotProps">
                    {{ slotProps.data.quantity }}
                </template>
            </Column>
            <Column field="profit" style="width: 10%;">
                <template #header>
                    <span>{{ t('recorder.profit') }}</span>
                </template>
                <template #body="slotProps">
                    <span class="profit-gain" v-if="slotProps.data.profit>0">
                        +{{ slotProps.data.profit }}
                    </span>
                    <span class="profit-loss" v-else-if="slotProps.data.profit<0">
                        {{ slotProps.data.profit }}
                    </span>
                    <span v-else="slotProps.data.profit==0">
                        {{ slotProps.data.profit }}
                    </span>
                </template>
            </Column>
            <Column field="description" style="width: 23%;">
                <template #header>
                    <span>{{ t('recorder.descriptios') }}</span>
                </template>
                <template #body="slotProps">
                    <div v-html="slotProps.data.description.replace(/\n/g, '<br>')"></div>
                </template>
                <template #editor="{ data, field }" >
                    <div class="h-full w-full">
                        <Textarea id="descriptionInput" v-model="data[field]" fluid autoResize rows="5" />
                    </div>
                </template>
            </Column>
            <Column style="width: 10%; min-width: 8rem" bodyStyle="text-align:center justify-content-center" :exportable="false">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="onShowEditHistoryDataDialog(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="onDeleteHistoryData(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>

    <Dialog v-model:visible="showAddHistoryDialog" @hide="flushHistoryInput">
        <template #header>
            <h3>{{ t('recorder.add_historical_data') }}</h3>
        </template>
        <div class="addHistoryDialogContent">
            <div class="formgrid grid">
                <div class="field col-12 md:col-6">
                    <label for="dateInput">{{ t('recorder.date') }}</label>
                    <div class="p-2">
                        <DatePicker v-model:model-value="history_date" id="dateInput" class="focus:border-primary w-full" />
                    </div>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="symbolInput">{{ t('recorder.symbol') }}</label>
                    <div class="p-2">
                        <InputText v-model:model-value="history_symbol" suffix="USDT" id="symbolInput" class="focus:border-primary w-full"/>
                    </div>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="profitInput">{{ t('recorder.quantity') }}</label>
                    <div class="p-2">
                        <InputNumber v-model:model-value="history_quantity" suffix="USDT" id="profitInput" :min="0" :maxFractionDigits="4"  fluid class="focus:border-primary" />
                    </div>
                </div>
                <div class="field col-12 md:col-3">
                    <label for="riskInput">{{ t('recorder.risk') }}</label>
                    <div class="p-2">
                        <InputNumber v-model:model-value="history_risk" suffix="%" id="riskInput" :min="0" :maxFractionDigits="2"  fluid class="focus:border-primary"/>
                    </div>
                </div>
                
                <div class="field col-12 md:col-3">
                    <label for="profitInput">{{ t('recorder.profit') }}</label>
                    <div class="p-2">
                        <InputNumber v-model:model-value="history_profit" :min="0" :maxFractionDigits="4"  suffix="USDT" id="profitInput" fluid class="focus:border-primary" />
                    </div>
                </div>
                <div class="field col-12">
                    <label for="imageInput">{{ t('recorder.imageURL') }}</label>
                    <div class="p-2">
                        <InputText id="imageInput" v-model:model-value="history_image" class="w-full"/>
                        <img v-if="history_image" :src="history_image" alt="Image" class="w-full" />
                    </div>
                </div>
                <div class="field col-12">
                    <label for="descriptionInput">{{ t('recorder.descriptios') }}</label>
                    <div class="p-2">
                        <Textarea id="descriptionInput" v-model="history_descriptions" fluid rows="10" />
                    </div>
                </div>
                
            </div>
        </div>
        <template #footer>
            <div class="pt-2">
                <Toast />
                <Button type="submit" severity="secondary" :label="t('recorder.save')" @click="onSubmitHistory"/>
            </div>
        </template>
    </Dialog>
    
    <Dialog v-model:visible="showEditHistoryDialog" @hide="flushHistoryInput">
        <template #header>
            <h3>{{ t('recorder.edit_historical_data') }}</h3>
        </template>
        <div class="addHistoryDialogContent">
            <div class="formgrid grid">
                <div class="field col-12 md:col-6">
                    <label for="dateInput">{{ t('recorder.date') }}</label>
                    <div class="p-2">
                        <DatePicker v-model:model-value="edit_historyData.date" id="dateInput" class="focus:border-primary w-full" />
                    </div>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="symbolInput">{{ t('recorder.symbol') }}</label>
                    <div class="p-2">
                        <InputText v-model:model-value="edit_historyData.symbol" suffix="USDT" id="symbolInput" class="focus:border-primary w-full"/>
                    </div>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="profitInput">{{ t('recorder.quantity') }}</label>
                    <div class="p-2">
                        <InputNumber v-model:model-value="edit_historyData.quantity" :min="0" :maxFractionDigits="4"  suffix="USDT" id="profitInput" fluid class="focus:border-primary" />
                    </div>
                </div>
                <div class="field col-12 md:col-3">
                    <label for="riskInput">{{ t('recorder.risk') }}</label>
                    <div class="p-2">
                        <InputNumber v-model:model-value="edit_historyData.risk" :min="0" :maxFractionDigits="2"  suffix="%" id="riskInput" fluid class="focus:border-primary"/>
                    </div>
                </div>
                <div class="field col-12 md:col-3">
                    <label for="profitInput">{{ t('recorder.profit') }}</label>
                    <div class="p-2">
                        <InputNumber v-model:model-value="edit_historyData.profit" :min="0" :maxFractionDigits="4"  suffix="USDT" id="profitInput" fluid class="focus:border-primary" />
                    </div>
                </div>
                <div class="field col-12">
                    <label for="imageInput">{{ t('recorder.image') }}</label>
                    <div class="p-2">
                        <InputText id="imageInput" v-model:model-value="edit_historyData.image" class="w-full"/>
                        <img v-if="edit_image" :src="edit_image" alt="Image" class="w-full" />
                    </div>
                </div>
                <div class="field col-12">
                    <label for="descriptionInput">{{ t('recorder.descriptios') }}</label>
                    <div class="p-2">
                        <Textarea id="descriptionInput" v-model="edit_historyData.description" fluid rows="10" />
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="pt-2">
                <Toast />
                <Button type="submit" severity="secondary" :label="t('recorder.save')" @click="onSubmitEditHistoryData" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.profit-gain{
    color: greenyellow;
}
.profit-loss{
    color: red;
}
.trading-img{
    width: 16rem;
    height: 9rem;
}
.addHistoryDialogContent{
    width: 40rem;
    height: 50vh;
}
</style>