import { html } from 'lit-html';
import '../components/search-results.js';
import '../components/company.js';
import '../components/job.js';


export default {
  title: 'DuckDB/Search Results',
  component: 'joblist-search-results',
  argTypes: {
    results: { control: 'object' },
  },
};

const Template = ({ results }) => html`
  <joblist-search-results
    .results=${results}
  ></joblist-search-results>
`;

const mockCompany = (overrides) => ({
    id: 'default-company',
    title: 'Default Company',
    description: 'A great place to work.',
    tags: ['tech', 'web'],
    ...overrides,
});

const mockJob = (overrides) => ({
    id: 'default-job',
    title: 'Software Engineer',
    location: 'Remote',
    ...overrides,
});

export const Default = Template.bind({});
Default.args = {
  results: {
    companies: [mockCompany({title: 'Innovate LLC'}), mockCompany({title: 'Synergy Corp'})],
    jobs: [mockJob({title: 'Frontend Dev'}), mockJob({title: 'Backend Dev'}), mockJob({title: 'Full-Stack Dev'})],
    query: 'developer',
    searchType: 'both',
    stats: { totalCompanies: 2, totalJobs: 3, total: 5 },
    isHighlightedQuery: false,
  },
};
