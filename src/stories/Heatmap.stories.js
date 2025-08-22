import { html } from 'lit-html';
import '../components/heatmap.js';

export default {
  title: 'Components/Heatmap',
  component: 'joblist-heatmap',
  argTypes: {
    companyId: { control: 'text' },
    days: { control: 'number' },
    databaseUrl: { control: 'text' },
    apiUrl: { control: 'text' },
  },
};

const Template = ({ companyId, days, databaseUrl, apiUrl }) => html`
  <joblist-heatmap
    company-id=${companyId}
    days=${days}
    database-url=${databaseUrl}
    api-url=${apiUrl}
  ></joblist-heatmap>
`;

export const CompanyHeatmap = Template.bind({});
CompanyHeatmap.args = {
  companyId: 'ableton',
  days: 365,
  apiUrl: 'https://api.joblist.today',
};

export const AllJobsHeatmap = Template.bind({});
AllJobsHeatmap.args = {
  days: 365,
  apiUrl: 'https://api.joblist.today',
};
