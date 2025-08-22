import { html } from 'lit-html';
import '../components/companies.js';

export default {
  title: 'Components/Companies',
  component: 'joblist-companies',
};

const Template = () => html`<joblist-companies></joblist-companies>`;

export const Default = Template.bind({});
Default.args = {};