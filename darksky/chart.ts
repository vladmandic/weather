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

export async function updateChart(data) {
  log('updateChart');
  if (!data || !data.hourly) return;
  const canvas = document.getElementById('weather-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const labelOptions = {
    borderWidth: 2,
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
        { label: 'Temp [F]', borderColor: '#ff9696', backgroundColor: '#ff9696', ...labelOptions, borderWidth: 3, data: [] },
        { label: 'Humidity [%]', borderColor: '#ffe100', backgroundColor: '#ffe100', ...labelOptions, data: [] },
        { label: 'Cloud [%]', borderColor: '#cccccc', backgroundColor: '#cccccc', ...labelOptions, data: [] },
        { label: 'Rain [in]', borderColor: '#52ff97', backgroundColor: '#52ff97', ...labelOptions, data: [] },
        { label: 'Wind [mph]', borderColor: '#00bbff', backgroundColor: '#00bbff', ...labelOptions, data: [] },
        { label: 'Feel [F]', borderColor: '#cca100', backgroundColor: '#cca100', ...labelOptions, data: [] },
      ],
    },
    options: chartOptions,
  };
  Chart.register(...registerables);
  const chart = new Chart(canvas, chartConfig);
  data.hourly.data.forEach((point) => {
    chartConfig.data.labels?.push([DateTime.fromSeconds(point.time).toFormat('ccc'), DateTime.fromSeconds(point.time).toFormat('HH:mm')]);
    chartConfig.data.datasets.forEach((dataset) => {
      if (dataset.label === 'Temp [F]') dataset.data.push(point.temperature);
      if (dataset.label === 'Feel [F]') dataset.data.push(point.apparentTemperature);
      if (dataset.label === 'Rain [in]') dataset.data.push(Math.min((5 * 100 * point.precipIntensity), 100));
      if (dataset.label === 'Wind [mph]') dataset.data.push(point.windSpeed);
      if (dataset.label === 'Cloud [%]') dataset.data.push(100 * point.cloudCover);
      if (dataset.label === 'Humidity [%]') dataset.data.push(100 * point.humidity);
    });
  });
  chart.update();
}

class ComponentChart extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="weather-chart" style="margin: 20px 0 40px 0; max-width: 800px">
        <canvas id="weather-canvas" height=300 width=800></canvas>
      </div>
    `;
  }
}

customElements.define('component-chart', ComponentChart);
