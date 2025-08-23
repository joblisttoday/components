import { html } from 'lit-html';
import '../components/search.js';
import '../components/search-results.js';

export default {
  title: 'Components/Search',
  component: 'joblist-search',
  parameters: {
    docs: {
      description: {
        component: 'Powerful search component with DuckDB integration for querying companies and jobs. Supports field-specific searches, boolean operators, and real-time results with fuzzy matching.',
      },
    },
  },
  argTypes: {
    placeholder: { 
      control: 'text',
      description: 'Placeholder text for the search input field',
      defaultValue: 'Search companies and jobs',
    },
    'database-url': { 
      control: 'select',
      options: ['https://workers.joblist.today', 'https://staging-workers.joblist.today', 'http://localhost:8080'],
      description: 'DuckDB workers API endpoint for data queries',
      defaultValue: 'https://workers.joblist.today',
    },
    query: { 
      control: 'text',
      description: 'Initial search query to populate the input',
      defaultValue: '',
    },
    'search-type': { 
      control: 'radio',
      options: ['both', 'companies', 'jobs'],
      description: 'Search scope - both entities, companies only, or jobs only',
      defaultValue: 'both',
    },
    limit: { 
      control: { type: 'range', min: 10, max: 2000, step: 10 },
      description: 'Maximum number of results to return (higher values reduce truncation)',
      defaultValue: 1000,
    },
  },
};

const Template = (args) => html`
  <joblist-search
    placeholder="${args.placeholder || 'Search companies and jobs'}"
    database-url="${args['database-url'] || 'https://workers.joblist.today'}"
    query="${args.query || ''}"
    search-type="${args['search-type'] || 'both'}"
    limit="${args.limit || 1000}"
  ></joblist-search>
`;

const SearchWithResultsTemplate = (args) => html`
  <div>
    <joblist-search
      placeholder="${args.placeholder || 'Search companies and jobs'}"
      database-url="${args['database-url'] || 'https://workers.joblist.today'}"
      query="${args.query || ''}"
      search-type="${args['search-type'] || 'both'}"
      limit="${args.limit || 1000}"
      @search=${(e) => {
        const results = e.target.parentElement.querySelector('joblist-results');
        if (results) {
          results.setAttribute('results', JSON.stringify(e.detail));
        }
      }}
    ></joblist-search>
    <hr style="margin: 1rem 0;" />
    <joblist-results></joblist-results>
  </div>
`;

// Default search interface (as used in main search page)
export const Default = Template.bind({});
Default.args = {
  placeholder: 'Search companies and jobs',
  'database-url': 'https://workers.joblist.today',
  query: '',
  'search-type': 'both',
  limit: 1000,
};


// Search with initial query (URL query parameter scenario)
export const WithInitialQuery = Template.bind({});
WithInitialQuery.args = {
  placeholder: 'Search companies and jobs',
  'database-url': 'https://workers.joblist.today',
  query: 'javascript developer',
  'search-type': 'both',
  limit: 1000,
};


// Companies-only search (as used in /companies page)
export const CompaniesOnly = Template.bind({});
CompaniesOnly.args = {
  placeholder: 'Search companies...',
  'database-url': 'https://workers.joblist.today',
  query: '',
  'search-type': 'companies',
  limit: 500,
};


// Jobs-only search (as used in jobs-focused pages)
export const JobsOnly = Template.bind({});
JobsOnly.args = {
  placeholder: 'Search job positions...',
  'database-url': 'https://workers.joblist.today',
  query: '',
  'search-type': 'jobs',
  limit: 1000,
};


// Full search experience with results display
export const SearchWithResults = SearchWithResultsTemplate.bind({});
SearchWithResults.args = {
  placeholder: 'Try searching for "react", "berlin", or "startup"',
  'database-url': 'https://workers.joblist.today',
  query: '',
  'search-type': 'both',
  limit: 1000,
};


// Specialized search queries demonstrating advanced features
export const TechnicalSearch = Template.bind({});
TechnicalSearch.args = {
  placeholder: 'Search for technical positions...',
  'database-url': 'https://workers.joblist.today',
  query: 'senior fullstack engineer typescript',
  'search-type': 'jobs',
  limit: 500,
};


// Geographic/location-based search
export const LocationSearch = Template.bind({});
LocationSearch.args = {
  placeholder: 'Search by location...',
  'database-url': 'https://workers.joblist.today',
  query: 'remote OR berlin OR "san francisco"',
  'search-type': 'both',
  limit: 1000,
};


// Company-specific search
export const CompanySearch = Template.bind({});
CompanySearch.args = {
  placeholder: 'Search companies by industry...',
  'database-url': 'https://workers.joblist.today',
  query: 'fintech OR blockchain OR cryptocurrency',
  'search-type': 'companies',
  limit: 200,
};


// High-volume search for performance testing
export const HighVolumeSearch = Template.bind({});
HighVolumeSearch.args = {
  placeholder: 'Search with high result limits...',
  'database-url': 'https://workers.joblist.today',
  query: 'software',
  'search-type': 'both',
  limit: 2000,
};

