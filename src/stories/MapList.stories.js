import { html } from 'lit-html';
import '../components/map-list.js';
import { loadLeaflet } from '../libs/leaflet.js';

// Load Leaflet once for all map stories
loadLeaflet().catch(err => console.warn('Failed to load Leaflet:', err));

export default {
  title: 'Components/MapList',
  component: 'joblist-map-list',
  argTypes: {
    longitude: { control: 'number' },
    latitude: { control: 'number' },
    zoom: { control: 'number' },
    origin: { control: 'text' },
    markers: { control: 'object' },
    jobs: { control: 'object' },
  },
};

const Template = ({ longitude, latitude, zoom, origin, markers, jobs }) => html`
  <joblist-map-list
    longitude=${longitude}
    latitude=${latitude}
    zoom=${zoom}
    origin=${origin}
    .markers=${markers}
    .jobs=${jobs}
  ></joblist-map-list>
`;

export const Default = Template.bind({});
Default.args = {
  longitude: 13.40,
  latitude: 52.52,
  zoom: 3,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { latitude: 52.52, longitude: 13.40, text: 'Berlin', total_jobs: 10, id: 'berlin' },
    { latitude: 48.85, longitude: 2.35, text: 'Paris', total_jobs: 5, id: 'paris' },
    { latitude: 51.50, longitude: -0.12, text: 'London', total_jobs: 8, id: 'london', is_highlighted: true },
  ],
  jobs: [
    { company_id: 'berlin', title: 'Job in Berlin 1' },
    { company_id: 'berlin', title: 'Job in Berlin 2' },
    { company_id: 'paris', title: 'Job in Paris 1' },
  ],
};

