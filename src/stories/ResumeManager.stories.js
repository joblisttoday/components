import { html } from 'lit-html';

export default {
  title: 'RemoteStorage/Resume Manager',
  component: 'joblist-resume-manager',
};

const Template = () => html`
  <joblist-resume-manager></joblist-resume-manager>
`;

export const Default = Template.bind({});
Default.args = {};
