import { html } from 'lit-html';
import '../components/pricing-table.js';


export default {
  title: 'Components/PricingTable',
  component: 'joblist-pricing-table',
  argTypes: {
    pricingTableId: { control: 'text' },
    publishableKey: { control: 'text' },
  },
};

const Template = ({ pricingTableId, publishableKey }) => html`
  <joblist-pricing-table
    pricing-table-id=${pricingTableId}
    publishable-key=${publishableKey}
  ></joblist-pricing-table>
`;

export const Default = Template.bind({});
Default.args = {
  pricingTableId: 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  publishableKey: 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
};

