import { html } from 'lit-html';
import '../components/matrix-job.js';


export default {
  title: 'Matrix/MatrixJob',
  component: 'joblist-matrix-job',
  argTypes: {
    event: { control: 'object' },
  },
};

const Template = ({ event }) => html`
  <joblist-matrix-job .event=${event}></joblist-matrix-job>
`;

export const Default = Template.bind({});
Default.args = {
  event: {
    content: {
      title: 'Matrix Job Title',
      description: 'This is a job description from a Matrix event.',
      url: 'https://example.com/matrix-job',
    },
  },
};
