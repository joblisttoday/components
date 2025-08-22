import { html } from 'lit-html';
import '../components/billing.js';


export default {
  title: 'Components/Billing',
  component: 'joblist-billing',
  argTypes: {
    url: { control: 'text' },
  },
};

const Template = ({ url }) => html`
  <joblist-billing url=${url}></joblist-billing>
`;

export const Default = Template.bind({});
Default.args = {
  url: 'https://billing.stripe.com/p/login/test_bIY9Co87Cdl17okaEE',
};

