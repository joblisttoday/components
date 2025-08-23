import { html, nothing } from 'lit-html';
import '../components/board.js';
import '../providers/greenhouse.js';
import '../providers/personio.js';
import '../providers/lever.js';
import '../providers/workable.js';
import '../providers/smartrecruiters.js';

export default {
  title: 'Board Providers/Board',
  component: 'joblist-board',
  parameters: { 
    layout: "padded",
    docs: {
      description: {
        component: 'Job board component that integrates with various ATS providers (Greenhouse, Personio, Lever, Workable, SmartRecruiters). Supports URL auto-detection or manual provider configuration.',
      },
    },
  },
  argTypes: {
    'provider-url': { 
      control: 'text',
      description: 'Full URL to the job board (auto-detects provider type)',
      defaultValue: 'https://boards.greenhouse.io/greenhouse',
    },
    'provider-hostname': { 
      control: 'select',
      options: ['abletonag', 'greenhouse', 'stripe', 'github', 'microsoft', 'shopify', 'airbnb', 'netflix'],
      description: 'Company-specific hostname/subdomain for the job board',
      defaultValue: 'greenhouse',
    },
    'provider-name': { 
      control: 'select',
      options: ['personio', 'greenhouse', 'lever', 'workable', 'smartrecruiters', 'ashby', 'recruitee', 'rippling'],
      description: 'ATS provider type (overrides auto-detection)',
      defaultValue: 'greenhouse',
    },
    onJobsLoaded: { action: 'jobs-loaded' },
  },
};

const Template = (args) => html`
  <joblist-board
    provider-url=${args['provider-url'] ?? nothing}
    provider-hostname=${args['provider-hostname'] ?? nothing}
    provider-name=${args['provider-name'] ?? nothing}
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
  'provider-hostname': 'stripe',
};


// Lever job board (uses real public example)
export const LeverBoard = Template.bind({});
LeverBoard.args = {
  'provider-name': 'lever',
  'provider-hostname': 'github',
};


// Workable job board (public example)
export const WorkableBoard = Template.bind({});
WorkableBoard.args = {
  'provider-name': 'workable',
  'provider-hostname': 'workmotion',
};


// SmartRecruiters job board (public example)
export const SmartRecruitersBoard = Template.bind({});
SmartRecruitersBoard.args = {
  'provider-name': 'smartrecruiters',
  'provider-hostname': 'Mitie',
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
  'provider-name': 'greenhouse',
  'provider-hostname': 'example-company-that-does-not-exist',
};
