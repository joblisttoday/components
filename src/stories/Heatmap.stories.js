import { html } from 'lit-html';
import '../components/heatmap.js';

export default {
  title: 'Components/Heatmap',
  component: 'joblist-heatmap',
  parameters: { layout: "padded" },
  argTypes: {
    'company-id': {
      control: 'select',
      options: ['ableton', 'stripe', 'github', 'microsoft', 'google', 'meta', 'spacex', 'spotify', ''],
      description: 'Company identifier to filter heatmap data. Leave empty for aggregate view across all companies',
      defaultValue: '',
    },
    days: {
      control: { type: 'range', min: 30, max: 730, step: 30 },
      description: 'Number of days to display in heatmap (affects data range and granularity)',
      defaultValue: 365,
    },
    'database-url': {
      control: 'select',
      options: ['https://workers.joblist.today', 'https://staging-workers.joblist.today', 'http://localhost:8080'],
      description: 'DuckDB workers API endpoint for data queries',
      defaultValue: 'https://workers.joblist.today',
    },
    'api-url': {
      control: 'text',
      description: 'Legacy API URL for fallback data sources',
      defaultValue: 'https://api.joblist.today',
    },
  },
};

const Template = (args) => html`
  <joblist-heatmap
    ${args['company-id'] ? `company-id="${args['company-id']}"` : ''}
    days="${args.days || 365}"
    database-url="${args['database-url'] || 'https://workers.joblist.today'}"
    api-url="${args['api-url'] || 'https://api.joblist.today'}"
  ></joblist-heatmap>
`;

// All companies aggregate view (default homepage view)
export const AllCompanies = Template.bind({});
AllCompanies.args = {
  'company-id': '',
  days: 365,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};


// Specific company analysis (Ableton)
export const CompanySpecific = Template.bind({});
CompanySpecific.args = {
  'company-id': 'ableton',
  days: 365,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};


// Large tech company with high activity (Microsoft)
export const HighActivityCompany = Template.bind({});
HighActivityCompany.args = {
  'company-id': 'microsoft',
  days: 365,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};


// Quarterly analysis (90 days)
export const QuarterlyView = Template.bind({});
QuarterlyView.args = {
  'company-id': 'stripe',
  days: 90,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};


// Monthly view for detailed analysis
export const MonthlyView = Template.bind({});
MonthlyView.args = {
  'company-id': 'github',
  days: 30,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};


// Two-year historical analysis
export const LongTermAnalysis = Template.bind({});
LongTermAnalysis.args = {
  'company-id': 'google',
  days: 730,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};


// Startup company with irregular activity
export const StartupActivity = Template.bind({});
StartupActivity.args = {
  'company-id': 'spacex',
  days: 365,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};


// Aggregate view with extended timeline
export const ExtendedAggregate = Template.bind({});
ExtendedAggregate.args = {
  'company-id': '',
  days: 540,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};

