import { html } from 'lit-html';
import '../components/favorite-button.js';

export default {
  title: 'Components/FavoriteButton',
  component: 'joblist-favorite-button',
  parameters: {
    docs: {
      description: {
        component: 'Interactive favorite/star button for bookmarking companies and jobs. Integrates with localStorage and remote storage, supports different item types, and provides visual feedback for favorite state changes.',
      },
    },
  },
  argTypes: {
    'item-id': {
      control: 'select',
      options: ['ableton', 'stripe', 'github', 'microsoft', 'google', 'spacex', 'n26', 'gitlab', 'spotify', 'example-job-123', 'frontend-dev-job', 'backend-dev-job', 'devops-engineer-remote'],
      description: 'Unique identifier for the item being favorited (company ID or job ID)',
      defaultValue: 'ableton',
    },
    'item-type': {
      control: { type: 'radio' },
      options: ['company', 'job'],
      description: 'Type of item being favorited - determines storage namespace and behavior',
      defaultValue: 'company',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Button size variant',
      defaultValue: 'medium',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the favorite button (useful for guest users)',
      defaultValue: false,
    },
  },
};

const Template = (args) => html`
  <joblist-favorite-button 
    item-id="${args['item-id'] || 'ableton'}"
    item-type="${args['item-type'] || 'company'}"
    ${args.size ? `size="${args.size}"` : ''}
    ?disabled=${args.disabled}
  ></joblist-favorite-button>
`;

// Default company favorite (most common use case)
export const CompanyFavorite = Template.bind({});
CompanyFavorite.args = {
  'item-id': 'ableton',
  'item-type': 'company',
  size: 'medium',
};


// Job favorite button
export const JobFavorite = Template.bind({});
JobFavorite.args = {
  'item-id': 'frontend-dev-job',
  'item-type': 'job',
  size: 'medium',
};


// Tech company examples
export const TechCompanies = () => html`
  <style>
    .favorite-showcase {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
    }
    .favorite-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
    }
    .company-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .company-name {
      font-weight: 600;
    }
    .company-description {
      font-size: 0.875rem;
      color: #6b7280;
    }
  </style>
  <div class="favorite-showcase">
    <div class="favorite-item">
      <div class="company-info">
        <span class="company-name">Ableton</span>
        <span class="company-description">Music software and hardware</span>
      </div>
      <joblist-favorite-button item-id="ableton" item-type="company"></joblist-favorite-button>
    </div>
    <div class="favorite-item">
      <div class="company-info">
        <span class="company-name">Stripe</span>
        <span class="company-description">Online payment processing</span>
      </div>
      <joblist-favorite-button item-id="stripe" item-type="company"></joblist-favorite-button>
    </div>
    <div class="favorite-item">
      <div class="company-info">
        <span class="company-name">GitHub</span>
        <span class="company-description">Developer platform and tools</span>
      </div>
      <joblist-favorite-button item-id="github" item-type="company"></joblist-favorite-button>
    </div>
    <div class="favorite-item">
      <div class="company-info">
        <span class="company-name">SpaceX</span>
        <span class="company-description">Aerospace and space exploration</span>
      </div>
      <joblist-favorite-button item-id="spacex" item-type="company"></joblist-favorite-button>
    </div>
  </div>
`;


// Job listings with favorites
export const JobListings = () => html`
  <style>
    .job-showcase {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
    }
    .job-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
    }
    .job-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .job-title {
      font-weight: 600;
      color: #1f2937;
    }
    .job-company {
      color: #6b7280;
      font-size: 0.875rem;
    }
    .job-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .job-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }
    .job-tag {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
  </style>
  <div class="job-showcase">
    <div class="job-item">
      <div class="job-content">
        <div class="job-title">Senior Frontend Developer</div>
        <div class="job-company">Ableton • Berlin, Germany</div>
        <div class="job-meta">
          <span>€70,000 - €90,000</span>
          <span>Full-time</span>
          <span>2 days ago</span>
        </div>
        <div class="job-tags">
          <span class="job-tag">React</span>
          <span class="job-tag">TypeScript</span>
          <span class="job-tag">Web Audio</span>
        </div>
      </div>
      <joblist-favorite-button item-id="frontend-dev-ableton" item-type="job"></joblist-favorite-button>
    </div>
    <div class="job-item">
      <div class="job-content">
        <div class="job-title">DevOps Engineer (Remote)</div>
        <div class="job-company">GitLab • Remote Worldwide</div>
        <div class="job-meta">
          <span>$90,000 - $120,000</span>
          <span>Full-time</span>
          <span>1 week ago</span>
        </div>
        <div class="job-tags">
          <span class="job-tag">Kubernetes</span>
          <span class="job-tag">Docker</span>
          <span class="job-tag">AWS</span>
          <span class="job-tag">Remote</span>
        </div>
      </div>
      <joblist-favorite-button item-id="devops-engineer-gitlab" item-type="job"></joblist-favorite-button>
    </div>
    <div class="job-item">
      <div class="job-content">
        <div class="job-title">Product Manager - Payments</div>
        <div class="job-company">Stripe • San Francisco, CA</div>
        <div class="job-meta">
          <span>$180,000 - $220,000</span>
          <span>Full-time</span>
          <span>3 days ago</span>
        </div>
        <div class="job-tags">
          <span class="job-tag">Product Strategy</span>
          <span class="job-tag">Payments</span>
          <span class="job-tag">B2B</span>
        </div>
      </div>
      <joblist-favorite-button item-id="product-manager-stripe" item-type="job"></joblist-favorite-button>
    </div>
  </div>
`;


// Different button sizes
export const ButtonSizes = () => html`
  <style>
    .size-demo {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .size-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-align: center;
    }
  </style>
  <div class="size-demo">
    <div class="size-item">
      <joblist-favorite-button item-id="github" item-type="company" size="small"></joblist-favorite-button>
      <code>small</code>
      <small>Compact lists</small>
    </div>
    <div class="size-item">
      <joblist-favorite-button item-id="github" item-type="company" size="medium"></joblist-favorite-button>
      <code>medium</code>
      <small>Default size</small>
    </div>
    <div class="size-item">
      <joblist-favorite-button item-id="github" item-type="company" size="large"></joblist-favorite-button>
      <code>large</code>
      <small>Prominent placement</small>
    </div>
  </div>
`;


// Disabled state (for guest users)
export const DisabledState = Template.bind({});
DisabledState.args = {
  'item-id': 'microsoft',
  'item-type': 'company',
  disabled: true,
};


// Mixed content types
export const MixedFavorites = () => html`
  <style>
    .mixed-showcase {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
    }
    .mixed-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .item-name {
      font-weight: 600;
    }
    .item-type {
      font-size: 0.875rem;
      color: #6b7280;
    }
    .company-item {
      background: #f0f9ff;
      border-color: #0ea5e9;
    }
    .job-item {
      background: #f0fdf4;
      border-color: #22c55e;
    }
  </style>
  <div class="mixed-showcase">
    <div class="mixed-item company-item">
      <div class="item-info">
        <span class="item-name">N26</span>
        <span class="item-type">Company • Digital Banking</span>
      </div>
      <joblist-favorite-button item-id="n26" item-type="company"></joblist-favorite-button>
    </div>
    <div class="mixed-item job-item">
      <div class="item-info">
        <span class="item-name">iOS Developer</span>
        <span class="item-type">Job • N26 • Berlin</span>
      </div>
      <joblist-favorite-button item-id="ios-developer-n26" item-type="job"></joblist-favorite-button>
    </div>
    <div class="mixed-item company-item">
      <div class="item-info">
        <span class="item-name">Spotify</span>
        <span class="item-type">Company • Music Streaming</span>
      </div>
      <joblist-favorite-button item-id="spotify" item-type="company"></joblist-favorite-button>
    </div>
    <div class="mixed-item job-item">
      <div class="item-info">
        <span class="item-name">Backend Engineer</span>
        <span class="item-type">Job • Spotify • Stockholm</span>
      </div>
      <joblist-favorite-button item-id="backend-engineer-spotify" item-type="job"></joblist-favorite-button>
    </div>
  </div>
`;


// Favorites manager integration preview
export const FavoritesManagerPreview = () => html`
  <style>
    .favorites-preview {
      max-width: 400px;
      margin: 1rem 0;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }
    .favorites-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
    }
    .favorites-list {
      padding: 0.5rem;
    }
    .favorite-entry {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      border-radius: 6px;
      margin: 0.25rem 0;
    }
    .favorite-entry:hover {
      background: #f3f4f6;
    }
    .favorite-name {
      font-weight: 500;
    }
  </style>
  <div class="favorites-preview">
    <div class="favorites-header">Your Favorites</div>
    <div class="favorites-list">
      <div class="favorite-entry">
        <span class="favorite-name">Ableton</span>
        <joblist-favorite-button item-id="ableton" item-type="company" size="small"></joblist-favorite-button>
      </div>
      <div class="favorite-entry">
        <span class="favorite-name">Senior React Developer</span>
        <joblist-favorite-button item-id="react-senior-job" item-type="job" size="small"></joblist-favorite-button>
      </div>
      <div class="favorite-entry">
        <span class="favorite-name">GitHub</span>
        <joblist-favorite-button item-id="github" item-type="company" size="small"></joblist-favorite-button>
      </div>
    </div>
  </div>
`;
