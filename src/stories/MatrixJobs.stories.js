import { html } from 'lit-html';
import '../components/matrix-jobs.js';

export default {
  title: 'Matrix/MatrixJobs',
  component: 'joblist-matrix-jobs',
  argTypes: {
    filter: { control: 'object' },
    showEventInfo: { control: 'boolean' },
    showContext: { control: 'boolean' },
    origin: { control: 'text' },
    profileId: { control: 'text' },
  },
};

const Template = ({ filter, showEventInfo, showContext, origin, profileId }) => html`
  <joblist-matrix-jobs
    mock="true"
    .filter=${filter}
    ?show-event-info=${showEventInfo}
    ?show-context=${showContext}
    origin=${origin}
    profile-id=${profileId}
  ></joblist-matrix-jobs>
`;

export const Default = Template.bind({});
Default.args = {
  filter: { types: ['today.joblist.job'] },
  showEventInfo: true,
  showContext: true,
  origin: 'https://boards.joblist.today',
  profileId: '#general.boards.joblist.today:matrix.org',
};
