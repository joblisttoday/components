import { html } from 'lit-html';
import '../components/job.js';

export default {
  title: 'Components/Job',
  component: 'joblist-job',
  parameters: {
    docs: {
      description: {
        component: 'Individual job listing component displaying job details including title, company, location, publication date, and interactive features. Supports various job types and data formats from different sources.',
      },
    },
  },
  argTypes: {
    job: {
      control: 'object',
      description: 'Job data object containing all job information and metadata',
    },
    'show-company': {
      control: 'boolean',
      description: 'Whether to display company information (useful when showing multiple companies)',
      defaultValue: true,
    },
    'show-date': {
      control: 'boolean',
      description: 'Whether to display publication date',
      defaultValue: true,
    },
    'show-location': {
      control: 'boolean',
      description: 'Whether to display job location',
      defaultValue: true,
    },
  },
};

const Template = (args) => html`
  <joblist-job 
    .job=${args.job}
    ?show-company=${args['show-company'] !== false}
    ?show-date=${args['show-date'] !== false}
    ?show-location=${args['show-location'] !== false}
  ></joblist-job>
`;

// Default software engineering job (most common type)
export const Default = Template.bind({});
Default.args = {
  job: {
    name: 'Senior Frontend Developer',
    url: 'https://joblist.today/jobs/senior-frontend-developer-ableton',
    location: 'Berlin, Germany',
    published_date: '2024-01-15T10:30:00Z',
    company_id: 'ableton',
    company_title: 'Ableton',
    description: 'Join our team to build the next generation of music creation software. Work with React, TypeScript, and Web Audio APIs.',
    type: 'Full-time',
    salary_range: '€70,000 - €90,000',
    tags: ['JavaScript', 'React', 'TypeScript', 'Web Audio'],
  },
  'show-company': true,
  'show-date': true,
  'show-location': true,
};
Default.parameters = {
  docs: {
    description: {
      story: 'Standard software engineering job listing with complete information including salary, tags, and description.',
    },
  },
};

// Remote-first position
export const RemoteJob = Template.bind({});
RemoteJob.args = {
  job: {
    name: 'DevOps Engineer (Remote)',
    url: 'https://joblist.today/jobs/devops-engineer-gitlab',
    location: 'Remote Worldwide',
    published_date: '2024-01-20T14:15:00Z',
    company_id: 'gitlab',
    company_title: 'GitLab',
    description: 'Help scale our infrastructure and deployment pipelines. Experience with Kubernetes, Docker, and cloud platforms required.',
    type: 'Full-time',
    salary_range: '$90,000 - $120,000 USD',
    tags: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'Remote'],
    remote: true,
  },
};
RemoteJob.parameters = {
  docs: {
    description: {
      story: 'Remote-first position showing global location and remote work indicators.',
    },
  },
};

// Leadership/management role
export const ManagementRole = Template.bind({});
ManagementRole.args = {
  job: {
    name: 'Engineering Manager - Platform Team',
    url: 'https://joblist.today/jobs/engineering-manager-stripe',
    location: 'San Francisco, CA',
    published_date: '2024-01-18T09:45:00Z',
    company_id: 'stripe',
    company_title: 'Stripe',
    description: 'Lead a team of 8-10 engineers building core platform infrastructure. Drive technical strategy and team growth.',
    type: 'Full-time',
    salary_range: '$200,000 - $250,000 USD',
    tags: ['Management', 'Platform', 'Leadership', 'Strategy'],
    seniority: 'Senior',
  },
};
ManagementRole.parameters = {
  docs: {
    description: {
      story: 'Management position with higher salary range and leadership responsibilities.',
    },
  },
};

// Entry-level/junior position
export const JuniorPosition = Template.bind({});
JuniorPosition.args = {
  job: {
    name: 'Junior Software Developer',
    url: 'https://joblist.today/jobs/junior-developer-n26',
    location: 'Berlin, Germany',
    published_date: '2024-01-22T16:20:00Z',
    company_id: 'n26',
    company_title: 'N26',
    description: 'Great opportunity for new graduates. Work on mobile banking features with mentorship from senior developers.',
    type: 'Full-time',
    salary_range: '€45,000 - €55,000',
    tags: ['Junior', 'Python', 'Django', 'Mentorship'],
    seniority: 'Junior',
  },
};
JuniorPosition.parameters = {
  docs: {
    description: {
      story: 'Entry-level position with lower salary range and mentorship opportunities.',
    },
  },
};

// Contract/freelance work
export const ContractWork = Template.bind({});
ContractWork.args = {
  job: {
    name: 'React Native Developer (Contract)',
    url: 'https://joblist.today/jobs/react-native-contractor',
    location: 'London, UK',
    published_date: '2024-01-25T11:30:00Z',
    company_id: 'spotify',
    company_title: 'Spotify',
    description: '6-month contract to build new mobile features. Strong React Native and iOS/Android experience required.',
    type: 'Contract',
    duration: '6 months',
    hourly_rate: '£400-500/day',
    tags: ['React Native', 'iOS', 'Android', 'Contract'],
  },
};
ContractWork.parameters = {
  docs: {
    description: {
      story: 'Contract position with daily rate instead of annual salary and specified duration.',
    },
  },
};

// Part-time position
export const PartTimeJob = Template.bind({});
PartTimeJob.args = {
  job: {
    name: 'UX Designer (Part-time)',
    url: 'https://joblist.today/jobs/ux-designer-part-time',
    location: 'Amsterdam, Netherlands',
    published_date: '2024-01-12T13:45:00Z',
    company_id: 'booking',
    company_title: 'Booking.com',
    description: 'Part-time UX design role focusing on mobile app improvements. 20 hours per week, flexible schedule.',
    type: 'Part-time',
    hours_per_week: 20,
    salary_range: '€35,000 - €45,000 (pro-rata)',
    tags: ['UX Design', 'Mobile', 'Part-time', 'Figma'],
  },
};
PartTimeJob.parameters = {
  docs: {
    description: {
      story: 'Part-time position with reduced hours and pro-rata salary.',
    },
  },
};

// Internship opportunity
export const InternshipRole = Template.bind({});
InternshipRole.args = {
  job: {
    name: 'Software Engineering Intern',
    url: 'https://joblist.today/jobs/intern-google-summer',
    location: 'Mountain View, CA',
    published_date: '2024-01-08T08:00:00Z',
    company_id: 'google',
    company_title: 'Google',
    description: 'Summer internship program for computer science students. Work on real products with world-class mentorship.',
    type: 'Internship',
    duration: '12 weeks',
    stipend: '$8,000/month + housing',
    tags: ['Internship', 'Students', 'Summer', 'Mentorship'],
    requirements: 'Currently enrolled in CS degree program',
  },
};
InternshipRole.parameters = {
  docs: {
    description: {
      story: 'Internship position with stipend, housing, and student requirements.',
    },
  },
};

// Startup equity-heavy role
export const StartupEquity = Template.bind({});
StartupEquity.args = {
  job: {
    name: 'Lead Full-Stack Engineer',
    url: 'https://joblist.today/jobs/lead-engineer-startup',
    location: 'San Francisco, CA',
    published_date: '2024-01-28T19:15:00Z',
    company_id: 'early-startup',
    company_title: 'TechStartup Inc.',
    description: 'Join our founding team to build revolutionary fintech solutions. Significant equity package for the right candidate.',
    type: 'Full-time',
    salary_range: '$130,000 - $160,000 + equity',
    equity: '0.5% - 1.5%',
    tags: ['Startup', 'Equity', 'Fintech', 'Founding Team'],
    company_stage: 'Series A',
  },
};
StartupEquity.parameters = {
  docs: {
    description: {
      story: 'Startup position emphasizing equity compensation and founding team opportunity.',
    },
  },
};

// Job without company display (for company-specific pages)
export const NoCompanyDisplay = Template.bind({});
NoCompanyDisplay.args = {
  job: {
    name: 'Backend Engineer - Payments Team',
    url: 'https://joblist.today/jobs/backend-payments-engineer',
    location: 'Dublin, Ireland',
    published_date: '2024-01-30T12:00:00Z',
    company_id: 'stripe',
    company_title: 'Stripe',
    description: 'Build and maintain high-scale payment processing systems. Experience with distributed systems required.',
    type: 'Full-time',
    salary_range: '€80,000 - €110,000',
    tags: ['Backend', 'Payments', 'Go', 'Distributed Systems'],
  },
  'show-company': false,
};
NoCompanyDisplay.parameters = {
  docs: {
    description: {
      story: 'Job listing without company information, as used on company-specific job boards.',
    },
  },
};

// Minimal job data (testing edge cases)
export const MinimalData = Template.bind({});
MinimalData.args = {
  job: {
    name: 'Software Developer',
    url: 'https://joblist.today/jobs/minimal-example',
    company_id: 'unknown-company',
    company_title: 'Tech Company',
  },
  'show-date': false,
  'show-location': false,
};
MinimalData.parameters = {
  docs: {
    description: {
      story: 'Minimal job data showing graceful handling of missing information.',
    },
  },
};

