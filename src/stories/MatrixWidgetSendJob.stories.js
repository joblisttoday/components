import { html } from 'lit-html';


export default {
  title: 'Components/Matrix/MatrixWidgetSendJob',
  component: 'joblist-matrix-widget-send-job',
  argTypes: {
    eventType: { control: 'text' },
    isWidget: { control: 'boolean' },
    profileId: { control: 'text' },
  },
};

const Template = ({ eventType, isWidget, profileId }) => html`
  <joblist-matrix-widget-send-job
    event-type=${eventType}
    ?is-widget=${isWidget}
    profile-id=${profileId}
  ></joblist-matrix-widget-send-job>
`;

export const Default = Template.bind({});
Default.args = {
  eventType: 'm.room.message',
  isWidget: false,
  profileId: '',
};

