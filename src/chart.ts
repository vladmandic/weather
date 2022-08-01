import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { DateTime } from 'luxon';
import { log } from './log';

const chartOptions: ChartOptions = {
  animation: { duration: 2000, easing: 'linear', loop: false },
  responsive: true,
  maintainAspectRatio: false,
  layout: { autoPadding: true },
  plugins: {
    title: { display: false },
    legend: {
      position: 'bottom',
      fullSize: true,
      labels: {
        padding: 14,
        color: 'rgb(200, 200, 200)',
        font: { family: 'CenturyGothic', size: 12 },
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: { color: '#222222' },
      ticks: {
        color: 'rgb(255, 255, 255)',
        font: {
          family: 'CenturyGothic', size: 12, lineHeight: 1.6 },
        autoSkip: true,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      display: true,
      stacked: false,
      min: 0,
      max: 120,
      grid: { color: '#222222' },
    },
  },
};

const labelOptions = {
  borderWidth: 4,
  fill: false,
  showLine: true,
  pointRadius: 0,
  cubicInterpolationMode: 'monotone',
  tension: 0.4,
};

const chartConfig: ChartConfiguration = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: 'TEMPERATURE', borderColor: '#ff9696', backgroundColor: '#ff9696', ...labelOptions, data: [], borderWidth: 6 },
      { label: 'HUMIDITY', borderColor: '#ffe100', backgroundColor: '#ffe100', ...labelOptions, data: [], borderWidth: 3 },
      { label: 'CLOUD', borderColor: '#cccccc', backgroundColor: '#cccccc', ...labelOptions, data: [] },
      { label: 'RAIN', borderColor: '#52ff97', backgroundColor: '#52ff97', ...labelOptions, data: [], borderWidth: 6 },
      { label: 'WIND', borderColor: '#00bbff', backgroundColor: '#00bbff', ...labelOptions, data: [] },
      { label: 'FEEL', borderColor: '#cca100', backgroundColor: '#cca100', ...labelOptions, data: [] },
      { label: 'PRESSURE', borderColor: '#515c20', backgroundColor: '#515c20', ...labelOptions, data: [], borderWidth: 3 },
    ],
  },
  options: chartOptions,
};

let chart: Chart;

async function initChart() {
  const canvas = document.getElementById('weather-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  Chart.register(...registerables);
  chart = new Chart(canvas, chartConfig);
}

export async function updateChart(data) {
  log('updateChart', data.hourly);
  if (!data || !data.hourly) return;
  if (!chart) await initChart();
  if (chartConfig.data.labels) chartConfig.data.labels.length = 0;
  for (const dataSet of chartConfig.data.datasets) dataSet.data.length = 0;
  data.hourly.data.forEach((point) => {
    chartConfig.data.labels?.push([DateTime.fromSeconds(point.time).toFormat('ccc').toUpperCase(), DateTime.fromSeconds(point.time).toFormat('HH:mm')]);
    chartConfig.data.datasets.forEach((dataset) => {
      if (dataset.label?.toUpperCase() === 'TEMPERATURE') dataset.data.push(point.temperature);
      if (dataset.label?.toUpperCase() === 'FEEL') dataset.data.push(point.apparentTemperature);
      if (dataset.label?.toUpperCase() === 'RAIN') dataset.data.push(Math.min((5 * 100 * point.precipIntensity), 100));
      if (dataset.label?.toUpperCase() === 'WIND') dataset.data.push(point.windSpeed);
      if (dataset.label?.toUpperCase() === 'CLOUD') dataset.data.push(100 * point.cloudCover);
      if (dataset.label?.toUpperCase() === 'HUMIDITY') dataset.data.push(100 * point.humidity);
      if (dataset.label?.toUpperCase() === 'PRESSURE') dataset.data.push(point.pressure / 10);
    });
  });
  chart.update();
  const gradients: Record<string, CanvasGradient> = {};
  for (const d of chartConfig.data.datasets) {
    gradients[d.label as string] = chart.ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
    const min = Math.min(...d.data as number[]);
    const max = Math.max(...d.data as number[]);
    gradients[d.label as string].addColorStop(Math.max(min / 120 - 0.1, 0), '#000000');
    gradients[d.label as string].addColorStop(max / 120, d.backgroundColor as string);
    const current = chartConfig.data.datasets.find((c) => c.label === d.label);
    if (current) current.borderColor = gradients[d.label as string];
  }
  chart.update();
}

class ComponentChart extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-chart" style="margin: 0 0 40px 0; max-width: 1000px">
        <canvas id="weather-canvas" height=400 width=1000px></canvas>
      </div>
    `;
  }
}

customElements.define('component-chart', ComponentChart);
