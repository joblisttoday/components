import { html } from 'lit-html';
import '../components/board.js';
import '../providers/greenhouse.js';
import '../providers/personio.js';
import '../providers/lever.js';
import '../providers/workable.js';
import '../providers/smartrecruiters.js';

export default {
  title: 'Components/Board',
  component: 'joblist-board',
  parameters: { layout: "padded" },
  argTypes: {
    'provider-url': { 
      control: 'text',
      description: 'Full URL to the job board (auto-detects provider type)',
    },
    'provider-hostname': { 
      control: 'select',
      options: ['abletonag', 'greenhouse', 'stripe', 'github', 'microsoft', 'shopify', 'airbnb', 'netflix'],
      description: 'Company-specific hostname/subdomain for the job board',
    },
    'provider-name': { 
      control: 'select',
      options: ['personio', 'greenhouse', 'lever', 'workable', 'smartrecruiters', 'ashby', 'recruitee', 'rippling'],
      description: 'ATS provider type (overrides auto-detection)',
    },
    onJobsLoaded: { action: 'jobs-loaded' },
  },
};

const Template = (args) => html`
  <joblist-board
    ${args['provider-url'] ? `provider-url="${args['provider-url']}"` : ''}
    ${args['provider-hostname'] ? `provider-hostname="${args['provider-hostname']}"` : ''}
    ${args['provider-name'] ? `provider-name="${args['provider-name']}"` : ''}
    @jobs-loaded=${args.onJobsLoaded}
  ></joblist-board>
`;

// Auto-detection from URL (most common use case)
export const AutoDetectFromUrl = Template.bind({});
AutoDetectFromUrl.args = {
  'provider-url': 'https://boards.greenhouse.io/greenhouse',
};


// Personio job board (as used in production)
export const PersonioBoard = Template.bind({});
PersonioBoard.args = {
  'provider-name': 'personio',
  'provider-hostname': 'abletonag',
};


// Greenhouse job board
export const GreenhouseBoard = Template.bind({});
GreenhouseBoard.args = {
  'provider-name': 'greenhouse',
  'provider-hostname': 'greenhouse',
};


// Lever job board
export const LeverBoard = Template.bind({});
LeverBoard.args = {
  'provider-name': 'lever',
  'provider-hostname': 'netflix',
};


// Workable job board
export const WorkableBoard = Template.bind({});
WorkableBoard.args = {
  'provider-name': 'workable',
  'provider-hostname': 'shopify',
};


// SmartRecruiters job board
export const SmartRecruitersBoard = Template.bind({});
SmartRecruitersBoard.args = {
  'provider-name': 'smartrecruiters',
  'provider-hostname': 'microsoft',
};


// Large tech company example
export const LargeTechCompany = Template.bind({});
LargeTechCompany.args = {
  'provider-url': 'https://jobs.lever.co/github',
};


// Startup company example
export const StartupCompany = Template.bind({});
StartupCompany.args = {
  'provider-name': 'greenhouse',
  'provider-hostname': 'airbnb',
};


// Error handling for invalid provider
export const InvalidProvider = Template.bind({});
InvalidProvider.args = {
  'provider-name': 'nonexistent-ats',
  'provider-hostname': 'example-company',
};


