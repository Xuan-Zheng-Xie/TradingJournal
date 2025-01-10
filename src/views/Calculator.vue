<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const localStorageName = 'calculatedHistory';
const entries = ref([]);
const exits = ref([]);

const windowHeight = ref(window.innerHeight - 180);
const updatewindowHeight = () => {
    windowHeight.value = window.innerHeight - 180;
    
}

onMounted(() => {
    window.addEventListener('resize', updatewindowHeight);
    // initialize exits and entries array
    entries.value = Array.from(
        {length: 1},
        () => { 
            const template = {
                "price": 0,
                "qty": 0,
                "isUSDT": true,
                "is_increase": true
            }
            return template
        }
    )
    exits.value = Array.from(
        {length: 3},
        () => { 
            const template = {
                "price": 0,
                "qtyRatio": 0,
                "isUSDT": true,
                "is_decrease": true
            }
            return template
        }
    )
    // setup History
    const josnString = localStorage.getItem(localStorageName);

    History.value = josnString ? JSON.parse(josnString): [];
});

onUnmounted(() => {
    window.removeEventListener('resize', updatewindowHeight);
})

const increase_entry_cell = () => {
    const template = {
        "price": 0,
        "qty": 0,
        "isUSDT": true,
        "is_increase": true
    }
    entries.value.push(template);
}

const increase_exit_cell = () => {
    const template = {
        "price": 0,
        "qtyRatio": 0,
        "isUSDT": true,
        "is_decrease": true
    }
    exits.value.push(template);
}

const del_entry_cell = (index) => {
    entries.value.splice(index, 1);
}

const del_exit_cell = (index) => {
    exits.value.splice(index, 1);
}
const side = ref(null);
const avg_price = ref(0);
const total_qty = ref(0);
const stop_loss = ref(0);

const expected_loss = ref(0);
const expected_profits = ref([]);

const isNumber = (value) => typeof value === 'number' && !isNaN(value);

const calculate_average_price = () => {
    let _avg_qty = 0;
    let _qty = 0;

    for(let i=0; i<entries.value.length; i++){
        if (entries.value[i].qty === null) entries.value[i].qty = 0;
        if (entries.value[i].price === null) entries.value[i].price = 0;
        _avg_qty += entries.value[i].price * entries.value[i].qty;
        _qty += entries.value[i].qty;
    }

    let res = [_avg_qty / _qty, _qty];
    avg_price.value = isNumber(res[0]) ? res[0] : 0;
    total_qty.value = isNumber(res[1]) ? res[1] : 0;
}

const detect_side = () => {
    // true for long
    // false for short
    if(stop_loss.value < avg_price.value){
        side.value = true;
    }
    else if(stop_loss.value > avg_price.value){
        side.value = false;
    }
    console.log(side.value);
}

const calculate_expected_loss = () => {
    const price_diff = side.value ? avg_price.value - stop_loss.value : stop_loss.value - avg_price.value
    expected_loss.value = total_qty.value * price_diff;
};

const calculate_expected_profits = () => {
    let qty = total_qty.value;
    let res = [];
    let realized_profit = 0;
    for (let i=0; i<exits.value.length; i++){

        if(exits.value[i].price!==0 && exits.value[i].qtyRatio!==0){
            const price_diff = side.value ? (exits.value[i].price - avg_price.value) : (avg_price.value - exits.value[i].price);

            realized_profit += (qty * exits.value[i].qtyRatio / 100) * price_diff;

            qty = qty * (1- exits.value[i].qtyRatio / 100);
            const unrealized_profit = qty * price_diff;
            const profit_risk_ratio = (realized_profit + unrealized_profit) / expected_loss.value;
            res.push({
                'r_p': realized_profit,
                'ur_p': unrealized_profit,
                'prr': profit_risk_ratio
            })
        }
    }
    expected_profits.value = res;
};

watch(entries, () => {
    if(side.value){
        entries.value.sort((a, b) => {
            if (a.price === 0 || b.price === 0) {
                return 0;
            }
            return b.price - a.price;
        });
        
    }
    else{
        entries.value.sort((a, b) => {
            if (a.price === 0 || b.price === 0) {
                return 0;
            }
            return a.price - b.price;
        });
    }
    calculate_average_price();
    detect_side();
    calculate_expected_loss();
    calculate_expected_profits();
},
{ deep: true }
);

watch(exits, () => {
    if(side.value){
        exits.value.sort((a, b) => {
            if (a.price === 0 || b.price === 0) {
                return 0;
            }
            return a.price - b.price;
        });
        
    }
    else{
        exits.value.sort((a, b) => {
            if (a.price === 0 || b.price === 0) {
                return 0;
            }
            return b.price - a.price;
        });
    }
    calculate_expected_profits();
},
{ deep: true }
);

watch(stop_loss, () => {
    detect_side();
    calculate_expected_loss();
}
);

// scripts for show history data
const showHistoryDialog = ref(false);
const toggleHistoryData = (record) => {
    stop_loss.value = record.stop_loss;
    record.entries.forEach((entry, index) => {
        if (entries.value[index]) {
            entries.value[index] = entry;
        } else {
            entries.value.push(entry);
        }
    });
    record.exits.forEach((entry, index) => {
        if (exits.value[index]) {
            exits.value[index] = entry;
        } else {
            exits.value.push(entry);
        }
    });
    avg_price.value = record.avg_price;
    total_qty.value = record.total_qty;
    side.value = record.side;
    expected_loss.value = record.expected_loss;
    expected_profits.value = record.expected_profits;
};
const deleteHistoryData = (id) => {
    History.value = History.value.filter(item => item.id !== id);
    localStorage.setItem(localStorageName, JSON.stringify(History.value));
}


// scripts for save calulated data
const showSaveResultDialog = ref(false);
const saveResultName = ref('')
const History = ref([]);

const onHideSaveResultDialog = () => {
    saveResultName.value = '';
}

const saveResultToLocalStorage = (name) => {
    const res = {
        'id': crypto.randomUUID(),
        'name': name,
        'stop_loss': stop_loss.value,
        'entries': entries.value,
        'exits': exits.value,
        'avg_prive': avg_price.value,
        'total_qty': total_qty.value,
        'side': side.value,
        'expected_loss': expected_loss.value,
        'expected_profits': expected_profits.value
    }
    History.value.push(res);
    localStorage.setItem(localStorageName, JSON.stringify(History.value));
    showSaveResultDialog.value = false;
};
</script>

<template>
    <div class="w-full h-full flex">
        <div class="w-6 pt-2">
            <Card>
                <template #title>
                    <h2>
                        {{ t('calculator.calculator') }}
                    </h2>
                </template>
                <template #content>
                    <div class="formgrid grid gap-3 mt-3">
                        <div class="field col-12 flex flex-wrap">            
                            <div class="w-5">
                                <label for="risk_tol">{{ t('calculator.stop_loss') }}</label>
                                <InputNumber v-model="stop_loss"  id="risk_tol" :min="0" :maxFractionDigits="8" fluid />
                            </div>
                        </div>
                        
                        <div class="field col-12">
                            <label for="entries" class="pt-5">{{ t('calculator.entries') }}</label>
                            <div id="entries">
                                <div v-for="(value, index) in entries" :key="index" class="flex justify-content-between pb-3">
                                    <div class="w-5">
                                        <FloatLabel variant="on">
                                            <InputNumber id="price" v-model="value.price" :min="0" :maxFractionDigits="8" fluid />
                                            <label for="price">{{ t('calculator.price') }} {{ index+1 }}</label>
                                        </FloatLabel>
                                    </div>
                                    <div class="w-5 justify-content-between">
                                        <FloatLabel variant="on">
                                            <InputNumber id="qty" v-model="value.qty" :min="0" :maxFractionDigits="8" fluid />
                                            <label for="qty">{{ t('calculator.quantity') }} {{ index+1 }}</label>
                                        </FloatLabel>
                                    </div>
                                    <Button severity="danger" icon="pi pi-trash" @click="del_entry_cell(index)" />
                                </div>
                                <div class="w-full flex">
                                    <Button severity="success" icon="pi pi-plus" @click="increase_entry_cell" style="margin-left: auto;" />
                                </div>
                            </div>
                            
                            <label for="exits" class="pt-7">{{ t('calculator.exits') }}</label>
                            <div id="exits">
                                <div v-for="(value, index) in exits" :key="index" class="flex justify-content-between pb-3">
                                    <div class="w-5">
                                        <FloatLabel variant="on">
                                            <InputNumber id="price" v-model="value.price" :min="0" :maxFractionDigits="8" fluid />
                                            <label for="price">{{ t('calculator.price') }} {{ index+1 }}</label>
                                        </FloatLabel>
                                    </div>
                                    <div class="w-5 flex flex-wrap align-items-center justify-content-between" style="margin-left: 1.5vw;">
                                        <Slider v-model="value.qtyRatio" style="width: 75%;" fluid />
                                        <span style="padding-right: 5%;">{{ value.qtyRatio }}%</span>
                                    </div>
                                    <Button severity="danger" icon="pi pi-trash" @click="del_exit_cell(index)" />
                                </div>
                                <div class="w-full flex">
                                    <Button severity="success" icon="pi pi-plus" @click="increase_exit_cell" style="margin-left: auto;" />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        
        <div class="w-6 h-full pl-5 pt-2">
            <Card>
                <template #title>
                    <h2>
                        {{ t('calculator.result') }}
                    </h2>
                </template>
                <template #content>
                    <ScrollPanel class="w-full" :style="{ height: `${windowHeight}px` }">
                        <div class="flex flex-wrap justify-content-between pb-2" style="width: 85%;">
                            <div>
                                <h3>{{ t('calculator.side') }}</h3>
                                <span v-if="side===true">{{ t('calculator.long') }}</span>
                                <span v-if="side===false">{{ t('calculator.short') }}</span>
                            </div>
                            <div>
                                <h3>{{ t('calculator.average_price') }}</h3>
                                <span>{{ avg_price }}</span>
                            </div>
                            <div class="mr-6">
                                <h3>{{ t('calculator.quantity') }}</h3>
                                <span>{{ total_qty }}</span>
                            </div>
                        </div>
                        <Divider />
                        <div class="pb-2">
                            <h3>{{ t('calculator.expected_loss') }}</h3>
                            <span>{{ expected_loss }}</span>
                        </div>
                        <Divider />
                        <div class="pb-2">
                            <h3>{{ t('calculator.expected_profits') }}</h3>
                            <Fieldset v-for="(value, index) in expected_profits" :key="index">
                                <template #legend>
                                    {{ t('calculator.tp') }}{{ index+1 }}
                                </template>
                                <div>
                                    {{ t('calculator.realized_profit') }}: {{ value.r_p }}
                                </div>
                                <div>
                                    {{ t('calculator.unrealized_profit') }}: {{ value.ur_p }}
                                </div>
                                <div>
                                    {{ t('calculator.profit_risk_ratio') }}: {{ value.prr }}
                                </div>
                            </Fieldset>
                        </div>
                    </ScrollPanel>
                    <div class="flex flex-wrap gap-3 justify-content-end mr-5">
                        <Button @click="showHistoryDialog = true">{{ t('calculator.use_records') }}</Button>
                        <Button @click="showSaveResultDialog = true;">{{ t('calculator.save_result') }}</Button>
                    </div>
                    
                </template>
            </Card>
        </div>
    </div>

    <Dialog v-model:visible="showHistoryDialog" :modal="true">
        <template #header>
            <h2>{{ t('calculator.records') }}</h2>
        </template>
        <div class="RecordsDialogContent flex flex-column gap-2">
            <DataTable :value="History">
                <Column field="name" style="width: 60%">
                    <template #header>
                        {{ t('calculator.title') }}
                    </template>
                </Column>
                <Column>
                    <template #body="slotProps" style="width: 40%">
                        <div class="flex gap-2">
                            <Button  severity="secondary" variant="outlined" rounded icon="pi pi-arrow-up-right-and-arrow-down-left-from-center" @click="toggleHistoryData(History[slotProps.index])" />
                            <Button  severity="danger" variant="outlined" rounded icon="pi pi-trash" @click="deleteHistoryData(slotProps.data.id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <template #footer>
            <Button type="submit" severity="secondary" @click="showHistoryDialog=false">{{ t('calculator.close') }}</Button>
        </template>
    </Dialog>

    <Dialog v-model:visible="showSaveResultDialog" :modal="true" @hide="onHideSaveResultDialog">
        <template #header>
            <h2>{{ t('calculator.save_result') }}</h2>
        </template>
        <div class="saveResultDialogContent flex flex-column gap-2">
            <span>{{ t('calculator.title') }}</span>
            <InputText v-model:model-value="saveResultName" fluid />
        </div>
        <template #footer>
            <Button type="submit" severity="secondary" @click="showSaveResultDialog=false">{{ t('calculator.cancel') }}</Button>
            <Button type="submit" @click="saveResultToLocalStorage(saveResultName)">{{ t('calculator.save') }}</Button>
        </template>
    </Dialog>
    
</template>

<style scoped>
.RecordsDialogContent{
    width: 30vw;
    height: 25vh;
}
.saveResultDialogContent{
    width: 30vw;
    height: 14vh;
}
</style>