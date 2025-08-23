import { html } from 'lit-html';
import '../components/pricing-table.js';

export default {
  title: 'Components/PricingTable',
  component: 'joblist-pricing-table',
  parameters: { layout: "padded" },
  argTypes: {
    'pricing-table-id': {
      control: 'select',
      options: [
        'prctbl_1Oq2s5HpRVVklMd0UOPfssyl', // Production pricing table
        'prctbl_test_123456789', // Test pricing table
        'prctbl_1Oq2s5HpRVVklMd0UOPfssyl', // Default production
      ],
      description: 'Stripe pricing table ID - determines available subscription plans and pricing',
      defaultValue: 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
    },
    'publishable-key': {
      control: 'select',
      options: [
        'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1', // Test key
        'pk_live_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1', // Production key (placeholder)
      ],
      description: 'Stripe publishable key for client-side integration',
      defaultValue: 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
    },
    'customer-email': {
      control: 'text',
      description: 'Pre-fill customer email in checkout (optional)',
      defaultValue: '',
    },
    'client-reference-id': {
      control: 'text',
      description: 'Custom reference ID for tracking subscriptions (company-id)',
      defaultValue: '',
    },
  },
};

const Template = (args) => html`
  <joblist-pricing-table
    pricing-table-id="${args['pricing-table-id'] || 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl'}"
    publishable-key="${args['publishable-key'] || 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1'}"
    ${args['customer-email'] ? `customer-email="${args['customer-email']}"` : ''}
    ${args['client-reference-id'] ? `client-reference-id="${args['client-reference-id']}"` : ''}
  ></joblist-pricing-table>
`;

// Default pricing table (generic highlighting plans)
export const Default = Template.bind({});
Default.args = {
  'pricing-table-id': 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
};


// Company-specific pricing (pre-filled for Ableton)
export const CompanySpecific = Template.bind({});
CompanySpecific.args = {
  'pricing-table-id': 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
  'client-reference-id': 'ableton',
  'customer-email': 'contact@ableton.com',
};


// Enterprise customer (Microsoft) with custom reference
export const EnterpriseCustomer = Template.bind({});
EnterpriseCustomer.args = {
  'pricing-table-id': 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
  'client-reference-id': 'microsoft',
  'customer-email': 'partnerships@microsoft.com',
};


// Startup pricing (SpaceX) 
export const StartupPricing = Template.bind({});
StartupPricing.args = {
  'pricing-table-id': 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
  'client-reference-id': 'spacex',
  'customer-email': 'hiring@spacex.com',
};


// Anonymous user (no pre-filled data)
export const AnonymousUser = Template.bind({});
AnonymousUser.args = {
  'pricing-table-id': 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
};


// Test environment pricing table
export const TestEnvironment = Template.bind({});
TestEnvironment.args = {
  'pricing-table-id': 'prctbl_test_123456789',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
  'client-reference-id': 'test-company',
  'customer-email': 'test@example.com',
};


// Financial services company (Stripe themselves)
export const FinancialServices = Template.bind({});
FinancialServices.args = {
  'pricing-table-id': 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
  'client-reference-id': 'stripe',
  'customer-email': 'business@stripe.com',
};


// Technology consulting company 
export const TechConsulting = Template.bind({});
TechConsulting.args = {
  'pricing-table-id': 'prctbl_1Oq2s5HpRVVklMd0UOPfssyl',
  'publishable-key': 'pk_test_51OhniyHpRVVklMd0xCFlxDwymrxDHaM8irs7sxT8SrA9EpWgqKWcCChaMksqWpsFYkR6JAZMwAa7p8NzkGORCb9H00SunE0zg1',
  'client-reference-id': 'github',
  'customer-email': 'recruiting@github.com',
};


