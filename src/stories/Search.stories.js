import { html } from 'lit-html';
import '../components/search.js';
import '../components/search-results.js';

export default {
  title: 'Components/Search',
  component: 'joblist-search',
  parameters: {
    docs: {
      description: {
        component: 'Powerful search component with DuckDB integration, supporting companies, jobs, and combined search with real-time suggestions and filtering. Features debounced input, geographic search, and event-driven architecture.',
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
Default.parameters = {
  docs: {
    description: {
      story: 'Default search interface with both companies and jobs enabled. Shows highlighted companies when no query is entered.',
    },
  },
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
WithInitialQuery.parameters = {
  docs: {
    description: {
      story: 'Search initialized with a query, as would happen from URL parameters or bookmarked searches.',
    },
  },
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
CompaniesOnly.parameters = {
  docs: {
    description: {
      story: 'Companies-only search mode, useful for company directory pages or specialized company searches.',
    },
  },
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
JobsOnly.parameters = {
  docs: {
    description: {
      story: 'Jobs-only search mode, focused on job position searching with higher limits for comprehensive results.',
    },
  },
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
SearchWithResults.parameters = {
  docs: {
    description: {
      story: 'Complete search experience showing both the search input and results display, demonstrating the full user flow.',
    },
  },
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
TechnicalSearch.parameters = {
  docs: {
    description: {
      story: 'Technical job search with specific keywords, demonstrating multi-term search capabilities.',
    },
  },
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
LocationSearch.parameters = {
  docs: {
    description: {
      story: 'Location-based search with boolean operators, showing geographic search capabilities.',
    },
  },
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
CompanySearch.parameters = {
  docs: {
    description: {
      story: 'Industry-focused company search using boolean operators to find companies in specific sectors.',
    },
  },
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
HighVolumeSearch.parameters = {
  docs: {
    description: {
      story: 'High-volume search with increased limits, useful for comprehensive analysis or export scenarios.',
    },
  },
};
