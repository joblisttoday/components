import { html } from 'lit-html';
import '../components/heatmap.js';

export default {
  title: 'Components/Heatmap',
  component: 'joblist-heatmap',
  parameters: {
    docs: {
      description: {
        component: 'Interactive heatmap visualization showing job posting activity over time. Can display activity for specific companies or aggregate data across all companies. Built with DuckDB integration for real-time data analysis.',
      },
    },
  },
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
AllCompanies.parameters = {
  docs: {
    description: {
      story: 'Aggregate heatmap showing job posting activity across all companies over the past year. Used on homepage and general analytics pages.',
    },
  },
};

// Specific company analysis (Ableton)
export const CompanySpecific = Template.bind({});
CompanySpecific.args = {
  'company-id': 'ableton',
  days: 365,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};
CompanySpecific.parameters = {
  docs: {
    description: {
      story: 'Company-specific heatmap for Ableton, showing their job posting patterns and activity levels over time.',
    },
  },
};

// Large tech company with high activity (Microsoft)
export const HighActivityCompany = Template.bind({});
HighActivityCompany.args = {
  'company-id': 'microsoft',
  days: 365,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};
HighActivityCompany.parameters = {
  docs: {
    description: {
      story: 'Heatmap for Microsoft showing high-volume job posting activity typical of large tech companies.',
    },
  },
};

// Quarterly analysis (90 days)
export const QuarterlyView = Template.bind({});
QuarterlyView.args = {
  'company-id': 'stripe',
  days: 90,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};
QuarterlyView.parameters = {
  docs: {
    description: {
      story: 'Quarterly heatmap view for Stripe, showing 3 months of activity with higher granularity for recent trends analysis.',
    },
  },
};

// Monthly view for detailed analysis
export const MonthlyView = Template.bind({});
MonthlyView.args = {
  'company-id': 'github',
  days: 30,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};
MonthlyView.parameters = {
  docs: {
    description: {
      story: 'Monthly heatmap for GitHub showing detailed daily activity patterns over the past 30 days.',
    },
  },
};

// Two-year historical analysis
export const LongTermAnalysis = Template.bind({});
LongTermAnalysis.args = {
  'company-id': 'google',
  days: 730,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};
LongTermAnalysis.parameters = {
  docs: {
    description: {
      story: 'Two-year historical analysis for Google, showing long-term hiring trends and seasonal patterns.',
    },
  },
};

// Startup company with irregular activity
export const StartupActivity = Template.bind({});
StartupActivity.args = {
  'company-id': 'spacex',
  days: 365,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};
StartupActivity.parameters = {
  docs: {
    description: {
      story: 'SpaceX heatmap showing startup-style irregular hiring patterns with bursts of activity.',
    },
  },
};

// Aggregate view with extended timeline
export const ExtendedAggregate = Template.bind({});
ExtendedAggregate.args = {
  'company-id': '',
  days: 540,
  'database-url': 'https://workers.joblist.today',
  'api-url': 'https://api.joblist.today',
};
ExtendedAggregate.parameters = {
  docs: {
    description: {
      story: 'Extended 18-month aggregate view showing market trends and seasonal hiring patterns across all companies.',
    },
  },
};
