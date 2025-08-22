import { html } from 'lit';

export default {
  title: 'Components/Job Boards',
  parameters: {
    docs: {
      description: {
        component: 'Job board provider components that fetch and display jobs from various ATS systems.',
      },
    },
  },
};

// Board Providers
export const Greenhouse = () => html`
  <joblist-board-greenhouse hostname="boards-api.greenhouse.io"></joblist-board-greenhouse>
`;
Greenhouse.parameters = {
  docs: {
    description: {
      story: 'Greenhouse job board integration. Requires a valid Greenhouse hostname.',
    },
  },
};

export const Personio = () => html`
  <joblist-board-personio hostname="example.jobs.personio.com"></joblist-board-personio>
`;

export const Lever = () => html`
  <joblist-board-lever hostname="jobs.lever.co/example"></joblist-board-lever>
`;

export const Workable = () => html`
  <joblist-board-workable hostname="apply.workable.com/example"></joblist-board-workable>
`;

// Individual Job Component
export const JobItem = () => html`
  <joblist-board-job
    title="Senior Software Engineer"
    url="https://example.com/job/123"
    location="San Francisco, CA"
    job-id="example-job-123"
    description="We are looking for a senior software engineer to join our team..."
  ></joblist-board-job>
`;
JobItem.parameters = {
  docs: {
    description: {
      story: 'Individual job listing component with favorite button and notes integration.',
    },
  },
};