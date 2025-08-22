import { html } from 'lit-html';
import '../components/companies-highlighted.js';

export default {
  title: 'Components/CompaniesHighlighted',
  component: 'joblist-companies-highlighted',
};

const Template = () => html`<joblist-companies-highlighted></joblist-companies-highlighted>`;

export const Default = Template.bind({});
Default.args = {};

export const Empty = Template.bind({});
Empty.args = {};