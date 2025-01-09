<script setup>
import { ref, onMounted } from "vue";
import { localStorageName } from '@/globals/globals.js'

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const futuresHistoryDataLocalStorageName = localStorageName.futuresHistory;
const spotsHistoryDataLocalStorageName = localStorageName.spotsHistory;

onMounted(() => {
    const filtered_spots_historyData = filterHistoryData_by_days(spotsHistoryDataLocalStorageName, SelectedHistoryDays.value);
    const filtered_futuers_historyData = filterHistoryData_by_days(futuresHistoryDataLocalStorageName, SelectedHistoryDays.value);

    profitChartData.value = generateProfitsChartData(filtered_spots_historyData, filtered_futuers_historyData);
    profitChartOptions.value = setProfitsChartOptions();

    futuresDistributionsChartData.value = generateFuturesDistributionsChartData(filtered_futuers_historyData);
    spotsDistributionsChartData.value = generateSpotsDistributionsChartData(filtered_spots_historyData);
    distributionsChartOptions.value = setDistributionsChartOptions();

    portfolio_analytics(filtered_spots_historyData, filtered_futuers_historyData);
});

// functions to filter datas
const filterHistoryData_by_days = (historyDataName, maxDaysLimit) => {
    // generate the time gap
    const today  = new Date();
    today.setHours(0, 0, 0, 0);
    const max_history_date = new Date();
    max_history_date.setDate(today.getDate() - maxDaysLimit);
    max_history_date.setHours(0, 0, 0, 0);

    // filter the history items within max day limit
    let historyData = localStorage.getItem(historyDataName);
    historyData = historyData ? JSON.parse(historyData) : [];
    const filtered_historyData = historyData.filter(
        item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate >= max_history_date && itemDate <= today
        }
    )
    return filtered_historyData
};

// functions for portfolio analytics
const acc_profits = ref(0);
const max_drawdown = ref(0);
const portfolio_analytics = (spotsData, futuresData) => {
    let combinedData = spotsData.concat(futuresData);
    combinedData = combinedData.sort((a,b) => new Date(a.date) - new Date(b.date));

    let temp_drawdown = 0;
    combinedData.forEach(
        item => {
            // accumulative return
            acc_profits.value += item.profit;
            // max drawdown
            if (item.profit > 0){
                temp_drawdown = 0;
            }
            if (item.profit < 0){
                temp_drawdown += item.profit;
                if (temp_drawdown < max_drawdown.value){
                    max_drawdown.value = temp_drawdown;
                }
            }
        }
    )
};

// functions for profit chart
const profitChartData = ref(null);
const profitChartOptions = ref(null);

const generateProfitsChartData = (filtered_spots_historyData, filtered_futuers_historyData) =>  {
    const documentStyle = getComputedStyle(document.documentElement);
    let result = {};
    let groupedFuturesProfits = {};
    let groupedSpotsProfits = {};
    
    for (let i=SelectedHistoryDays.value-1; i>=0; i--){
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
        groupedFuturesProfits[dateKey] = 0;
        groupedSpotsProfits[dateKey] = 0;
    }
    
    filtered_futuers_historyData.forEach(
        item => {
            const date = new Date(item.date);
            const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            const dateKey = utcDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
            
            if (groupedFuturesProfits.hasOwnProperty(dateKey)){
                groupedFuturesProfits[dateKey] += item.profit;
            }
        }
    );

    filtered_spots_historyData.forEach(
        item => {
            const date = new Date(item.date);
            const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            const dateKey = utcDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
            
            if (groupedSpotsProfits.hasOwnProperty(dateKey)){
                groupedSpotsProfits[dateKey] += item.profit;
            }
        }
    );
    
    const futures_labels = Object.keys(groupedFuturesProfits);
    const spots_labels = Object.keys(groupedSpotsProfits);

    let total_labels = [];
    let max_day_len = 0;
    if (futures_labels.length >= spots_labels.length){
        max_day_len = futures_labels.length;
        total_labels = futures_labels;
    }
    else {
        max_day_len = spots_labels.length;
        total_labels = spots_labels;
    }

    const futures_data = Array(max_day_len - futures_labels.length).fill(0).concat(Object.values(groupedFuturesProfits));
    const spots_data = Array(max_day_len - spots_labels.length).fill(0).concat(Object.values(groupedSpotsProfits));

    const total_data = futures_data.map(
        (value, index) => value + spots_data[index]
    );

    result = {
        labels: total_labels,
        datasets: [
            {
                type: 'line',
                label: t('dashboard.total_profit'),
                borderColor: documentStyle.getPropertyValue('--p-orange-500'),
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                data: total_data
            },
            {
                type: 'bar',
                label: t('dashboard.perpetual_futures'),
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                data: futures_data
            },
            {
                type: 'bar',
                label: t('dashboard.spots'),
                backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
                data: spots_data
            },
        ]
    }

    return result
};

const setProfitsChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
};

const SelectedHistoryDays = ref(7);
const assetsHistoryDays = ref([
    {
        name: t('dashboard.days_7'),
        code: 7
    },
    {
        name: t('dashboard.days_30'),
        code: 30
    },
    {
        name: t('dashboard.days_90'),
        code: 90
    },
    {
        name: t('dashboard.days_180'),
        code: 180
    }
]);

// functions for distributions chart
const futuresDistributionsChartData = ref(null);
const futuresDistributionChartBackgroundColors = ref([]);
const spotsDistributionsChartData = ref(null);
const spotsDistributionChartBackgroundColors = ref([]);
const distributionsChartOptions = ref(null);


function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function isColorFarEnough(newColor, minDistance, colors) {
    for (const color of colors) {
        const [r1, g1, b1] = color;
        const [r2, g2, b2] = newColor;
        const distance = Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
        if (distance < minDistance) {
            return false;
        }
    }
    return true;
};

const generateFuturesDistributionsChartData = (filtered_futures_historyData) => {
    const distributions = {};
    filtered_futures_historyData.forEach(
        item => {
            if (!distributions.hasOwnProperty(item.symbol)){
                distributions[item.symbol]=item.quantity;
                for (let i = 0; i < 5; i++) {
                    let newColor;

                    do {
                        newColor = [randomInRange(0, 255), randomInRange(0, 255), randomInRange(0, 255)];
                    } while (!isColorFarEnough(newColor, 10, futuresDistributionChartBackgroundColors.value));

                    futuresDistributionChartBackgroundColors.value.push(`rgb(${newColor[0]},${newColor[1]},${newColor[2]})`);
                }
            }
            else{
                distributions[item.symbol]+=item.quantity;
            }
        }
    );

    const labels = Object.keys(distributions);
    const data = Object.values(distributions);
    return {
        labels: labels,
        datasets: [
            {
                data: data,
                backgroundColor: futuresDistributionChartBackgroundColors.value,
                hoverOffset: 6
            }
        ]
    };
};

const generateSpotsDistributionsChartData = (filtered_spots_historyData) => {
    const distributions = {};
    filtered_spots_historyData.forEach(
        item => {
            if (!distributions.hasOwnProperty(item.symbol)){
                distributions[item.symbol]=item.quantity;
                for (let i = 0; i < 5; i++) {
                    let newColor;

                    do {
                        newColor = [randomInRange(0, 255), randomInRange(0, 255), randomInRange(0, 255)];
                    } while (!isColorFarEnough(newColor, 10, futuresDistributionChartBackgroundColors.value));

                    spotsDistributionChartBackgroundColors.value.push(`rgb(${newColor[0]},${newColor[1]},${newColor[2]})`);
                }
            }
            else{
                distributions[item.symbol]+=item.quantity;
            }
        }
    );

    const labels = Object.keys(distributions);
    const data = Object.values(distributions);
    return {
        labels: labels,
        datasets: [
            {
                data: data,
                backgroundColor: spotsDistributionChartBackgroundColors.value,
                hoverOffset: 6
            }
        ]
    };
};

const setDistributionsChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    cutout: '60%',
                    padding: 12,
                    color: textColor
                }
            }
        }
    };
};
</script>

<template>
    <div class="flex flex-column w-full h-full">
        <div class="flex align-content-center p-2 w-full">
            <Card class="w-4 h-full" :pt="{ body: 'card-root' }">
                <template #title>
                    <div class="card flex flex-wrap">
                        <h2 class="align-items-center">
                            {{ t('dashboard.analytics') }}
                        </h2>
                    </div>
                </template>
                <template #content>
                    <div class="flex flex-wrap flex-column gap-2 pt-2">
                        <Fieldset>
                            <template #legend>
                                {{ t('dashboard.accumulative_profits') }}
                            </template>
                            {{ acc_profits }}
                        </Fieldset>
                        <Fieldset>
                            <template #legend>
                                {{ t('dashboard.max_drawdown') }}
                            </template>
                            {{ max_drawdown }}
                        </Fieldset>
                    </div>
                </template>
            </Card>
            <Card class="w-7 h-full" :pt="{ body: 'card-root' }">
                <template #title>
                    <div class="card flex flex-wrap">
                        <h2 class="align-items-center">
                            {{ t('dashboard.distributions') }}
                        </h2>
                    </div>
                </template>
                <template #content>
                    <div class="flex flex-wrap justify-content-around align-items-center">
                        <Fieldset>
                            <template #legend>
                                {{ t('dashboard.spots') }}
                            </template>
                            <Chart type="doughnut" :data="spotsDistributionsChartData" :options="distributionsChartOptions" :pt="{ root: 'distributions-chart' }" class="pl-2 pr-2" />
                        </Fieldset>
                        <Fieldset>
                            <template #legend>
                                {{ t('dashboard.perpetual_futures') }}
                            </template>
                            <Chart type="doughnut" :data="futuresDistributionsChartData" :options="distributionsChartOptions" :pt="{ root: 'distributions-chart' }" class="pl-2 pr-2"/>
                        </Fieldset>
                    </div>
                </template>
            </Card>
        </div>
        <div class="flex align-content-center p-2 w-full">
            <Card class="w-full h-full" :pt="{ body: 'card-root' }">
                <template #title>
                    <div class="card flex flex-wrap gap-3 align-items-center justify-content-between">
                        <h2 class="align-items-center">
                            {{ t('dashboard.profits') }}
                        </h2>
                        <div class="flex gap-3 h-2.5rem">
                            <div class="flex">
                                <Select v-model="SelectedHistoryDays" :options="assetsHistoryDays" optionLabel="name" optionValue="code" fluid class="text-sm" />
                            </div>
                        </div>
                    </div>
                </template>
                <template #content>
                    <Chart type="bar" :data="profitChartData" :options="profitChartOptions" :pt="{ root: 'profit-chart' }" />
                </template>
            </Card>
        </div>
    </div>
</template>

<style scope>
.page-container {
    width: 100%;
    height: 100%;
}
.page-block {
    width: 100%;
    height: 50%;
}
.card-root {
    border-width: 4rem;
    border-color: aliceblue;
}
.distributions-chart{
    width: 100%;
    height: 32vh;
}
.profit-chart{
    height: 34vh;
}
.bullet{
    font-size: 1.5rem;
}
</style>