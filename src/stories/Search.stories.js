import { html } from 'lit-html';

export default {
  title: 'Components/Search',
  component: 'joblist-search',
  argTypes: {
    placeholder: { control: 'text' },
    databaseUrl: { control: 'text' },
    query: { control: 'text' },
    searchType: { 
        control: { type: 'radio' },
        options: ['both', 'companies', 'jobs'],
    },
    limit: { control: 'number' },
  },
};

const Template = ({ placeholder, databaseUrl, query, searchType, limit }) => html`
  <joblist-search
    placeholder=${placeholder}
    database-url=${databaseUrl}
    query=${query}
    search-type=${searchType}
    limit=${limit}
  ></joblist-search>
`;

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Search for anything...',
  databaseUrl: 'https://workers.joblist.today',
  query: '',
  searchType: 'both',
  limit: 100,
};

export const WithInitialQuery = Template.bind({});
WithInitialQuery.args = {
    ...Default.args,
    query: 'developer',
};

export const CompaniesOnly = Template.bind({});
CompaniesOnly.args = {
    ...Default.args,
    searchType: 'companies',
};

export const JobsOnly = Template.bind({});
JobsOnly.args = {
    ...Default.args,
    searchType: 'jobs',
};
