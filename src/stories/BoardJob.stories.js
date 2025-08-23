import { html } from 'lit-html';
import '../components/board-job.js';


export default {
  title: 'Board Providers/Board Job',
  component: 'joblist-board-job',
  argTypes: {
    title: { control: 'text' },
    url: { control: 'text' },
    location: { control: 'text' },
    description: { control: 'text' },
    jobId: { control: 'text' },
  },
};

const Template = ({ title, url, location, description, jobId }) => html`
  <joblist-board-job
    title=${title}
    url=${url}
    location=${location}
    description=${description}
    job-id=${jobId}
  ></joblist-board-job>
`;

export const FullJob = Template.bind({});
FullJob.args = {
  title: 'People Operations Team Leader (m/f/d)',
  url: 'https://joblist.today/?examples=example-job',
  location: 'Berlin, de',
  description: 'This is a long description of the job... '.repeat(10),
  jobId: '12345',
};
