import { html } from 'lit-html';
import '../components/job.js';


export default {
  title: 'Components/Job',
  component: 'joblist-job',
  argTypes: {
    job: { control: 'object' },
  },
};

const Template = ({ job }) => html`
  <joblist-job job=${JSON.stringify(job)}></joblist-job>
`;

export const Default = Template.bind({});
Default.args = {
  job: {
    name: 'People Operations Team Leader (m/f/d)',
    url: 'https://joblist.today/?examples=example-job',
    location: 'Berlin, de',
    published_date: new Date().toISOString(),
    company_id: 'example-company',
    company_title: 'Example Company',
  },
};

