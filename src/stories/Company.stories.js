import { html } from 'lit';

export default {
  title: 'Components/Company',
  component: 'joblist-company',
  parameters: {
    docs: {
      description: {
        component: 'Display detailed company information including description, links, jobs, and interactive features like favorites and notes.',
      },
    },
  },
  argTypes: {
    'company-id': {
      control: 'text',
      description: 'Unique identifier for the company',
      defaultValue: 'stripe',
    },
    full: {
      control: 'boolean',
      description: 'Show full company details including job board and interactive features',
      defaultValue: false,
    },
    origin: {
      control: 'text',
      description: 'Base URL for company profiles',
      defaultValue: 'https://joblist.today',
    },
  },
};

const Template = (args) => html`
  <joblist-company
    company-id="${args['company-id']}"
    ?full="${args.full}"
    origin="${args.origin}"
    .company="${args.company}"
  ></joblist-company>
`;

export const Basic = Template.bind({});
Basic.args = {
  'company-id': 'stripe',
  full: false,
};

export const FullView = Template.bind({});
FullView.args = {
  'company-id': 'stripe',
  full: true,
};

export const WithCustomData = Template.bind({});
WithCustomData.args = {
  'company-id': 'example',
  full: true,
  company: {
    id: 'example',
    title: 'Example Company',
    description: 'This is an example company for demonstration purposes.',
    company_url: 'https://example.com',
    linkedin_url: 'https://linkedin.com/company/example',
    tags: [
      { name: 'Technology', count: 5 },
      { name: 'Remote-First', count: 3 },
    ],
  },
};