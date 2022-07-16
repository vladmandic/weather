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
    legend: { display: false },
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
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const bg1 = ctx.createLinearGradient(0, 0, 0, 250);
  bg1.addColorStop(1, 'rgba(127,122,0, 0.1)');
  bg1.addColorStop(0, 'rgba(255,225,0, 0.1)');
  const bg2 = ctx.createLinearGradient(0, 0, 0, 250);
  bg2.addColorStop(1, 'rgba(40,122,125, 0.1)');
  bg2.addColorStop(0, 'rgba(80,225,150, 0.1)');
  const bg3 = ctx.createLinearGradient(0, 0, 0, 250);
  bg3.addColorStop(1, 'rgba(0,95,62, 0.1)');
  bg3.addColorStop(0, 'rgba(0,190,255, 0.1)');
  const bg4 = ctx.createLinearGradient(0, 0, 0, 250);
  bg4.addColorStop(1, 'rgba(100,100,31, 0.1)');
  bg4.addColorStop(0, 'rgba(200,200,200, 0.1)');
  const bg5 = ctx.createLinearGradient(0, 0, 0, 250);
  bg5.addColorStop(1, 'rgba(127,75,125, 0.1)');
  bg5.addColorStop(0, 'rgba(255,150,150, 0.1)');
  const bg6 = ctx.createLinearGradient(0, 0, 0, 250);
  bg6.addColorStop(1, 'rgba(127,122,0, 0.1)');
  bg6.addColorStop(0, 'rgba(255,225,0, 0.9)');

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
        { label: 'Temp [F]', borderColor: '#ffe100', ...labelOptions, data: [] },
        { label: 'Humidity [%]', borderColor: '#ff9696', ...labelOptions, data: [] },
        { label: 'Cloud [%]', borderColor: '#cccccc', ...labelOptions, data: [] },
        { label: 'Rain [in]', borderColor: '#52ff97', ...labelOptions, data: [] },
        { label: 'Wind [mph]', borderColor: '#00bbff', ...labelOptions, data: [] },
        { label: 'Feel [F]', borderColor: '#cca100', ...labelOptions, data: [], fill: '-1' },
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
      <div id="weather-chart" style="margin: 0 20px 0 20px; max-width: 600px">
        <canvas id="weather-canvas" height=300 width=650></canvas>
      </div>
    `;
  }
}

customElements.define('component-chart', ComponentChart);
