import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartDataset, registerables } from 'chart.js';
import { DateTime } from 'luxon';
import { log } from './log';
import { options } from './forecast';
import { metric, imperial, weatherCode } from './enums';
import type { Interval } from './types';

const rndColor = () => Math.round(255 * Math.random());
const colors: Record<string, string> = {};

export class WeatherChart {
  name: string;

  chart: Chart;

  canvas: HTMLCanvasElement;

  div: HTMLDivElement;

  chartOptions: ChartOptions = {
    responsive: true,
    layout: {
      autoPadding: true,
    },
    plugins: {
      legend: {
        position: 'right',
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
      title: {
        display: false,
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
        min: 0,
        max: 120,
      },
    },
  };

  chartData: ChartData = {
    labels: [],
    datasets: [],
  };

  chartConfig: ChartConfiguration = {
    type: 'line',
    data: this.chartData,
    options: this.chartOptions,
  };

  constructor(name: string) {
    this.name = name;
    const divId = `div-${name}`;
    const canvasId = `chart-${name}`;
    this.div = document.getElementById(divId) as HTMLDivElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.div = document.createElement('div');
    this.div.id = divId;
    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasId;
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = this.canvas.width / 3;
    this.div.innerHTML = `${name}`;
    this.div.appendChild(this.canvas);
    (document.getElementById('charts') as HTMLDivElement).append(this.div);
    Chart.register(...registerables);
    if (this.chartConfig.options?.plugins?.title) this.chartConfig.options.plugins.title.text = name;
    this.chart = new Chart(this.canvas, this.chartConfig);
  }

  update(data: Interval[]) {
    log('chart data', this.name, data);
    for (const entry of data) { // iterate through all timestamps
      const dt = DateTime.fromISO(entry.startTime);
      let ts = '';
      if (this.name.includes('d')) ts = dt.toFormat('ccc LL/dd');
      else if (this.name.includes('h')) ts = dt.toFormat('ccc HH');
      else if (this.name.includes('m')) ts = dt.toFormat('HH:mm');
      const units = options.units === 'metric' ? metric : imperial;
      const label: string[] = [
        ts,
        weatherCode[entry.values.weatherCode].toUpperCase(),
        entry.values.precipitationIntensity === 0 ? '' : `${units.precipitationType[entry.values.precipitationType]} ${entry.values.precipitationProbability}% ${entry.values.precipitationIntensity}${units.precipitationIntensity}`.toUpperCase(),
      ];
      if (!this.chartData.labels?.includes(label)) this.chartData.labels?.push(label);

      for (let [key, val] of Object.entries(entry.values)) { // iterate through all objects
        if (typeof val !== 'number') continue; // exclude non-numeric data
        if (key.includes('Code') || key.includes('Time') || key.includes('Type') || key.includes('Phase')) continue; // exclude irrelevant data
        if ((this.name.includes('h') || this.name.includes('m')) && (key.includes('Min') || key.includes('Max'))) continue; // exclude min/max data if not daily
        if (key.includes('Direction')) val /= 3.6; // normalize direction
        if (key.includes('Intensity')) val *= 100; // normalize intensity
        key = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
        let current: ChartDataset = this.chartData.datasets.find((d) => d.label === key) as ChartDataset;
        if (!current) {
          if (!colors[key]) colors[key] = `rgb(${rndColor()}, ${rndColor()}, ${rndColor()})`;
          current = {
            label: key,
            backgroundColor: colors[key],
            borderColor: colors[key],
            data: [],
            fill: false,
            showLine: true,
            pointRadius: 0,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          };
          this.chartData.datasets.push(current);
        }
        current.data.push(val);
      }
    }
    this.chart.update();
  }
}
