import { html } from 'lit-html';
import '../components/map-list.js';
import { loadLeaflet } from '../libs/leaflet.js';

// Load Leaflet once for all map stories
loadLeaflet().catch(err => console.warn('Failed to load Leaflet:', err));

export default {
  title: 'DuckDB/Map',
  component: 'joblist-map-list',
  parameters: { 
    layout: "padded",
    docs: {
      description: {
        component: 'Interactive map component for displaying company locations and job opportunities using Leaflet. Supports markers, clustering, job filtering, and global/regional views of tech hubs.',
      },
    },
  },
  argTypes: {
    longitude: {
      control: { type: 'range', min: -180, max: 180, step: 0.1 },
      description: 'Map center longitude coordinate',
      defaultValue: 13.40,
    },
    latitude: {
      control: { type: 'range', min: -90, max: 90, step: 0.1 },
      description: 'Map center latitude coordinate',
      defaultValue: 52.52,
    },
    zoom: {
      control: { type: 'range', min: 1, max: 18, step: 1 },
      description: 'Map zoom level (1=world view, 18=street level)',
      defaultValue: 3,
    },
    origin: {
      control: 'text',
      description: 'URL template for company profile links (use {} as placeholder for company ID)',
      defaultValue: 'https://joblist.today/companies/{}',
    },
    markers: {
      control: 'object',
      description: 'Array of marker objects with coordinates, company info, and job counts',
    },
    jobs: {
      control: 'object',
      description: 'Array of job objects for filtering and display (optional)',
    },
  },
};

const Template = (args) => {
  const mapElement = document.createElement('joblist-map-list');
  mapElement.setAttribute('longitude', args.longitude || 13.40);
  mapElement.setAttribute('latitude', args.latitude || 52.52);
  mapElement.setAttribute('zoom', args.zoom || 3);
  mapElement.setAttribute('origin', args.origin || 'https://joblist.today/companies/{}');
  if (args.markers) {
    mapElement.markers = args.markers;
  }
  if (args.jobs) {
    mapElement.jobs = args.jobs;
  }
  return mapElement;
};

// Default European tech hubs view
export const EuropeanTechHubs = Template.bind({});
EuropeanTechHubs.args = {
  longitude: 13.40,
  latitude: 52.52,
  zoom: 4,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { 
      latitude: 52.52, 
      longitude: 13.40, 
      text: 'Berlin, Germany', 
      total_jobs: 156, 
      id: 'berlin',
      company_name: 'Various Berlin Companies',
      description: 'Major tech hub with startups and established companies'
    },
    { 
      latitude: 48.85, 
      longitude: 2.35, 
      text: 'Paris, France', 
      total_jobs: 89, 
      id: 'paris',
      company_name: 'Various Paris Companies',
      description: 'Growing fintech and AI scene'
    },
    { 
      latitude: 51.50, 
      longitude: -0.12, 
      text: 'London, UK', 
      total_jobs: 234, 
      id: 'london', 
      is_highlighted: true,
      company_name: 'Various London Companies',
      description: 'Financial services and tech innovation center'
    },
    { 
      latitude: 55.76, 
      longitude: 37.62, 
      text: 'Moscow, Russia', 
      total_jobs: 45, 
      id: 'moscow',
      company_name: 'Various Moscow Companies',
      description: 'Emerging tech ecosystem'
    },
    { 
      latitude: 59.33, 
      longitude: 18.06, 
      text: 'Stockholm, Sweden', 
      total_jobs: 67, 
      id: 'stockholm',
      company_name: 'Various Stockholm Companies',
      description: 'Spotify, Klarna, and other unicorns'
    },
  ],
  jobs: [
    { company_id: 'berlin', title: 'Senior Frontend Developer', location: 'Berlin, DE', published_date: '2024-01-15' },
    { company_id: 'berlin', title: 'DevOps Engineer', location: 'Berlin, DE', published_date: '2024-01-20' },
    { company_id: 'paris', title: 'Data Scientist', location: 'Paris, FR', published_date: '2024-01-18' },
    { company_id: 'london', title: 'Product Manager', location: 'London, UK', published_date: '2024-01-22' },
    { company_id: 'london', title: 'Backend Engineer', location: 'London, UK', published_date: '2024-01-25' },
  ],
};


// Global overview with major tech centers
export const GlobalTechCenters = Template.bind({});
GlobalTechCenters.args = {
  longitude: 0,
  latitude: 30,
  zoom: 2,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { 
      latitude: 37.77, 
      longitude: -122.42, 
      text: 'San Francisco, CA', 
      total_jobs: 892, 
      id: 'san-francisco',
      company_name: 'Silicon Valley Companies',
      description: 'Heart of tech innovation',
      is_highlighted: true
    },
    { 
      latitude: 40.71, 
      longitude: -74.01, 
      text: 'New York, NY', 
      total_jobs: 567, 
      id: 'new-york',
      company_name: 'NYC Tech Companies',
      description: 'Fintech and media tech hub'
    },
    { 
      latitude: 51.50, 
      longitude: -0.12, 
      text: 'London, UK', 
      total_jobs: 234, 
      id: 'london',
      company_name: 'London Tech Companies',
      description: 'European financial tech center'
    },
    { 
      latitude: 52.52, 
      longitude: 13.40, 
      text: 'Berlin, Germany', 
      total_jobs: 156, 
      id: 'berlin',
      company_name: 'Berlin Startups',
      description: 'European startup capital'
    },
    { 
      latitude: 35.68, 
      longitude: 139.69, 
      text: 'Tokyo, Japan', 
      total_jobs: 123, 
      id: 'tokyo',
      company_name: 'Tokyo Tech Companies',
      description: 'Asian tech innovation center'
    },
    { 
      latitude: 1.35, 
      longitude: 103.82, 
      text: 'Singapore', 
      total_jobs: 89, 
      id: 'singapore',
      company_name: 'Singapore Companies',
      description: 'Southeast Asian fintech hub'
    },
  ],
  jobs: [],
};


// Specific company locations (Ableton offices)
export const CompanyOffices = Template.bind({});
CompanyOffices.args = {
  longitude: 13.40,
  latitude: 52.52,
  zoom: 6,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { 
      latitude: 52.52, 
      longitude: 13.40, 
      text: 'Ableton Berlin HQ', 
      total_jobs: 12, 
      id: 'ableton-berlin',
      company_name: 'Ableton',
      description: 'Headquarters and main development office',
      is_highlighted: true
    },
    { 
      latitude: 37.77, 
      longitude: -122.42, 
      text: 'Ableton San Francisco', 
      total_jobs: 5, 
      id: 'ableton-sf',
      company_name: 'Ableton',
      description: 'US sales and support office'
    },
    { 
      latitude: 35.68, 
      longitude: 139.69, 
      text: 'Ableton Tokyo', 
      total_jobs: 3, 
      id: 'ableton-tokyo',
      company_name: 'Ableton',
      description: 'Asian market support office'
    },
  ],
  jobs: [
    { company_id: 'ableton-berlin', title: 'C++ Audio Developer', location: 'Berlin, DE', published_date: '2024-01-15' },
    { company_id: 'ableton-berlin', title: 'Product Designer', location: 'Berlin, DE', published_date: '2024-01-20' },
    { company_id: 'ableton-sf', title: 'Customer Success Manager', location: 'San Francisco, CA', published_date: '2024-01-18' },
    { company_id: 'ableton-tokyo', title: 'Marketing Specialist', location: 'Tokyo, JP', published_date: '2024-01-22' },
  ],
};


// Remote-first companies (no specific locations)
export const RemoteCompanies = Template.bind({});
RemoteCompanies.args = {
  longitude: 0,
  latitude: 30,
  zoom: 2,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { 
      latitude: 39.83, 
      longitude: -98.58, 
      text: 'GitLab (Remote-First)', 
      total_jobs: 45, 
      id: 'gitlab-remote',
      company_name: 'GitLab',
      description: 'All-remote company with global talent'
    },
    { 
      latitude: 46.23, 
      longitude: 2.21, 
      text: 'Buffer (Remote)', 
      total_jobs: 8, 
      id: 'buffer-remote',
      company_name: 'Buffer',
      description: 'Remote social media management platform'
    },
    { 
      latitude: 54.53, 
      longitude: 15.25, 
      text: 'Zapier (Remote)', 
      total_jobs: 23, 
      id: 'zapier-remote',
      company_name: 'Zapier',
      description: 'Distributed automation platform team'
    },
  ],
  jobs: [
    { company_id: 'gitlab-remote', title: 'Senior Backend Engineer (Remote)', location: 'Remote', published_date: '2024-01-15' },
    { company_id: 'buffer-remote', title: 'Marketing Manager (Remote)', location: 'Remote', published_date: '2024-01-20' },
    { company_id: 'zapier-remote', title: 'Product Engineer (Remote)', location: 'Remote', published_date: '2024-01-18' },
  ],
};


// Startup ecosystem in a specific city (Berlin)
export const BerlinStartupScene = Template.bind({});
BerlinStartupScene.args = {
  longitude: 13.40,
  latitude: 52.52,
  zoom: 11,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { 
      latitude: 52.53, 
      longitude: 13.38, 
      text: 'Rocket Internet Campus', 
      total_jobs: 34, 
      id: 'rocket-internet',
      company_name: 'Rocket Internet',
      description: 'Startup incubator and venture builder'
    },
    { 
      latitude: 52.51, 
      longitude: 13.45, 
      text: 'N26 Office', 
      total_jobs: 28, 
      id: 'n26',
      company_name: 'N26',
      description: 'Digital banking unicorn',
      is_highlighted: true
    },
    { 
      latitude: 52.50, 
      longitude: 13.42, 
      text: 'Zalando SE', 
      total_jobs: 67, 
      id: 'zalando',
      company_name: 'Zalando',
      description: 'European fashion e-commerce platform'
    },
    { 
      latitude: 52.48, 
      longitude: 13.43, 
      text: 'SoundCloud', 
      total_jobs: 19, 
      id: 'soundcloud',
      company_name: 'SoundCloud',
      description: 'Audio streaming and sharing platform'
    },
  ],
  jobs: [
    { company_id: 'rocket-internet', title: 'Venture Development Manager', location: 'Berlin, DE', published_date: '2024-01-15' },
    { company_id: 'n26', title: 'iOS Developer', location: 'Berlin, DE', published_date: '2024-01-20' },
    { company_id: 'zalando', title: 'Data Scientist', location: 'Berlin, DE', published_date: '2024-01-18' },
    { company_id: 'soundcloud', title: 'Audio Engineer', location: 'Berlin, DE', published_date: '2024-01-22' },
  ],
};


// High-density Silicon Valley view
export const SiliconValleyDetail = Template.bind({});
SiliconValleyDetail.args = {
  longitude: -122.08,
  latitude: 37.39,
  zoom: 10,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { 
      latitude: 37.42, 
      longitude: -122.08, 
      text: 'Google Googleplex', 
      total_jobs: 234, 
      id: 'google',
      company_name: 'Google',
      description: 'Mountain View headquarters',
      is_highlighted: true
    },
    { 
      latitude: 37.48, 
      longitude: -122.15, 
      text: 'Meta Menlo Park', 
      total_jobs: 189, 
      id: 'meta',
      company_name: 'Meta',
      description: 'Social media and VR innovation'
    },
    { 
      latitude: 37.33, 
      longitude: -122.03, 
      text: 'Apple Park', 
      total_jobs: 156, 
      id: 'apple',
      company_name: 'Apple',
      description: 'Cupertino campus'
    },
    { 
      latitude: 37.77, 
      longitude: -122.42, 
      text: 'Salesforce Tower', 
      total_jobs: 89, 
      id: 'salesforce',
      company_name: 'Salesforce',
      description: 'San Francisco headquarters'
    },
    { 
      latitude: 37.38, 
      longitude: -122.12, 
      text: 'Netflix Los Gatos', 
      total_jobs: 67, 
      id: 'netflix',
      company_name: 'Netflix',
      description: 'Streaming entertainment leader'
    },
  ],
  jobs: [],
};


// Empty map for loading states
export const EmptyMap = Template.bind({});
EmptyMap.args = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  origin: 'https://joblist.today/companies/{}',
  markers: [],
  jobs: [],
};


// Search results view (filtered data)
export const SearchResults = Template.bind({});
SearchResults.args = {
  longitude: 13.40,
  latitude: 52.52,
  zoom: 4,
  origin: 'https://joblist.today/companies/{}',
  markers: [
    { 
      latitude: 52.52, 
      longitude: 13.40, 
      text: 'Berlin React Jobs', 
      total_jobs: 23, 
      id: 'berlin-react',
      company_name: 'Various Companies',
      description: 'React.js opportunities in Berlin'
    },
    { 
      latitude: 51.50, 
      longitude: -0.12, 
      text: 'London React Jobs', 
      total_jobs: 34, 
      id: 'london-react',
      company_name: 'Various Companies',
      description: 'React.js opportunities in London'
    },
  ],
  jobs: [
    { company_id: 'berlin-react', title: 'Senior React Developer', location: 'Berlin, DE', published_date: '2024-01-15' },
    { company_id: 'berlin-react', title: 'Frontend React Engineer', location: 'Berlin, DE', published_date: '2024-01-20' },
    { company_id: 'london-react', title: 'React Native Developer', location: 'London, UK', published_date: '2024-01-18' },
  ],
};

