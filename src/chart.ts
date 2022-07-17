import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { DateTime } from 'luxon';
import { log } from './log';

const chartOptions: ChartOptions = {
  animation: { duration: 1000, easing: 'linear' },
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    autoPadding: true,
  },
  plugins: {
    title: { display: false },
    legend: {
      position: 'bottom',
      fullSize: true,
      labels: {
        padding: 14,
        color: 'rgb(200, 200, 200)',
        font: {
          family: 'CenturyGothic',
          size: 12,
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      ticks: {
        color: 'rgb(255, 255, 255)',
        font: {
          family: 'CenturyGothic',
          size: 12,
          lineHeight: 1.6,
        },
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
      // gridLines: { zeroLineWidth: 3, zeroLineColor: '#aaaaaa', color: '#888888' },
      // ticks: { beginAtZero: true, suggestedMax: 120, stepSize: 10 },
    },
  },
};

const labelOptions = {
  borderWidth: 3,
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
      { label: 'Temp', borderColor: '#ff9696', backgroundColor: '#ff9696', ...labelOptions, borderWidth: 4, data: [] },
      { label: 'Humidity', borderColor: '#ffe100', backgroundColor: '#ffe100', ...labelOptions, data: [] },
      { label: 'Cloud', borderColor: '#cccccc', backgroundColor: '#cccccc', ...labelOptions, data: [] },
      { label: 'Rain', borderColor: '#52ff97', backgroundColor: '#52ff97', ...labelOptions, data: [] },
      { label: 'Wind', borderColor: '#00bbff', backgroundColor: '#00bbff', ...labelOptions, data: [] },
      { label: 'Feel', borderColor: '#cca100', backgroundColor: '#cca100', ...labelOptions, data: [] },
      { label: 'Pressure', borderColor: '#515c20', backgroundColor: '#515c20', ...labelOptions, data: [] },
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
  log('updateChart', data);
  if (!data || !data.hourly) return;
  if (!chart) await initChart();
  if (chartConfig.data.labels) chartConfig.data.labels.length = 0;
  for (const dataSet of chartConfig.data.datasets) dataSet.data.length = 0;
  data.hourly.data.forEach((point) => {
    chartConfig.data.labels?.push([DateTime.fromSeconds(point.time).toFormat('ccc'), DateTime.fromSeconds(point.time).toFormat('HH:mm')]);
    chartConfig.data.datasets.forEach((dataset) => {
      if (dataset.label === 'Temp') dataset.data.push(point.temperature);
      if (dataset.label === 'Feel') dataset.data.push(point.apparentTemperature);
      if (dataset.label === 'Rain') dataset.data.push(Math.min((5 * 100 * point.precipIntensity), 100));
      if (dataset.label === 'Wind') dataset.data.push(point.windSpeed);
      if (dataset.label === 'Cloud') dataset.data.push(100 * point.cloudCover);
      if (dataset.label === 'Humidity') dataset.data.push(100 * point.humidity);
      if (dataset.label === 'Pressure') dataset.data.push(point.pressure / 10);
    });
  });
  chart.update();
  const gradients: Record<string, CanvasGradient> = {};
  for (const d of chartConfig.data.datasets) {
    gradients[d.label as string] = chart.ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
    const min = Math.min(...d.data as number[]);
    const max = Math.max(...d.data as number[]);
    gradients[d.label as string].addColorStop(Math.max(min / 120 - 0.2, 0), '#000000');
    gradients[d.label as string].addColorStop(max / 120, d.backgroundColor as string);
    const current = chartConfig.data.datasets.find((c) => c.label === d.label);
    if (current) current.borderColor = gradients[d.label as string];
  }
  chart.update();
}

class ComponentChart extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-chart" style="margin: 20px 0 40px 0; max-width: 800px">
        <canvas id="weather-canvas" height=400 width=800></canvas>
      </div>
    `;
  }
}

customElements.define('component-chart', ComponentChart);
