import { html } from 'lit-html';
import '../components/matrix-send-job.js';

export default {
  title: 'Matrix/MatrixSendJob',
  component: 'joblist-matrix-send-job',
  argTypes: {
    eventType: { control: 'text' },
    profileId: { control: 'text' },
    origin: { control: 'text' },
  },
};

const Template = ({ eventType, profileId, origin }) => html`
  <joblist-matrix-send-job
    event-type=${eventType}
    profile-id=${profileId}
    origin=${origin}
  ></joblist-matrix-send-job>
`;

export const AuthenticatedAndJoined = Template.bind({});
AuthenticatedAndJoined.args = {
  eventType: 'm.room.message',
  profileId: '#general.boards.joblist.today:matrix.org',
  origin: 'https://matrix.to/#',
};

export const NotAuthenticated = Template.bind({});
NotAuthenticated.args = { ...AuthenticatedAndJoined.args };

export const NotJoined = Template.bind({});
NotJoined.args = { ...AuthenticatedAndJoined.args };
