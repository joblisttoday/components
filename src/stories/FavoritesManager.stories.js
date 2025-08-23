import { html } from 'lit-html';
import '../components/favorites-manager.js';

export default {
  title: 'RemoteStorage/Favorites Manager',
  component: 'joblist-favorites-manager',
  argTypes: {
    type: { control: { type: 'radio' }, options: ['both', 'companies', 'jobs'] },
  },
};

const Template = ({ type }) => html`
  <joblist-favorites-manager type=${type}></joblist-favorites-manager>
`;

export const Both = Template.bind({});
Both.args = {
  type: 'both',
};

export const CompaniesOnly = Template.bind({});
CompaniesOnly.args = {
  type: 'companies',
};

export const JobsOnly = Template.bind({});
JobsOnly.args = {
  type: 'jobs',
};
