import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import '../components/menu.js';
import '../components/icon.js';


export default {
  title: 'Components/Menu',
  component: 'joblist-menu',
  parameters: {
    docs: {
      description: {
        component: 'Responsive navigation menu component with collapsible sidebar functionality. Features favicon display, default menu items, custom content slots, and persistent state management. Used for main site navigation and contextual menus.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the menu is open (expanded) or closed',
      defaultValue: true,
    },
    pin: {
      control: 'boolean',
      description: 'Pin the menu open (prevents auto-collapse on mobile)',
      defaultValue: false,
    },
    'show-default': {
      control: 'boolean',
      description: 'Display default navigation items (Home, Companies, Jobs, etc.)',
      defaultValue: true,
    },
    'show-favicon': {
      control: 'boolean',
      description: 'Display site favicon in menu header',
      defaultValue: false,
    },
    href: {
      control: 'text',
      description: 'Base URL for navigation links',
      defaultValue: 'https://joblist.today',
    },
    'menu-title': {
      control: 'text',
      description: 'Custom title for the menu header',
      defaultValue: '',
    },
    slotContent: {
      control: 'text',
      description: 'Custom HTML content for additional menu items',
      defaultValue: '',
    },
  },
};

const Template = (args) => html`
  <joblist-menu
    ?open=${args.open !== false}
    ?pin=${args.pin === true}
    ?show-default=${args['show-default'] !== false}
    ?show-favicon=${args['show-favicon'] === true}
    href="${args.href || 'https://joblist.today'}"
    ${args['menu-title'] ? `menu-title="${args['menu-title']}"` : ''}
  >
    ${args.slotContent ? unsafeHTML(args.slotContent) : ''}
  </joblist-menu>
`;

// Default menu with standard navigation
export const Default = Template.bind({});
Default.args = {
  open: true,
  pin: false,
  'show-default': true,
  'show-favicon': false,
  href: 'https://joblist.today',
};
Default.parameters = {
  docs: {
    description: {
      story: 'Standard menu configuration with default navigation items as used on main site pages.',
    },
  },
};

// Menu with favicon (branded appearance)
export const WithFavicon = Template.bind({});
WithFavicon.args = {
  open: true,
  pin: false,
  'show-default': true,
  'show-favicon': true,
  href: 'https://joblist.today',
};
WithFavicon.parameters = {
  docs: {
    description: {
      story: 'Menu with favicon display for branded appearance, commonly used on company-specific pages.',
    },
  },
};

// Custom menu items (components documentation)
export const CustomMenuItems = Template.bind({});
CustomMenuItems.args = {
  open: true,
  pin: true,
  'show-default': true,
  'show-favicon': true,
  href: 'https://joblist.today',
  slotContent: `
    <menu>
      <li>
        <a href="/storybook/">Storybook</a>
      </li>
      <li>
        <a href="/components/">Components</a>
      </li>
      <li>
        <a href="/apps/">Apps</a>
      </li>
    </menu>
  `,
};
CustomMenuItems.parameters = {
  docs: {
    description: {
      story: 'Menu with custom development/documentation links, as used in the components showcase.',
    },
  },
};

// Company-specific menu
export const CompanyMenu = Template.bind({});
CompanyMenu.args = {
  open: true,
  pin: false,
  'show-default': true,
  'show-favicon': true,
  href: 'https://joblist.today',
  'menu-title': 'Ableton',
  slotContent: `
    <menu>
      <li>
        <a href="/companies/ableton">Company Profile</a>
      </li>
      <li>
        <a href="/companies/ableton/jobs">Open Positions</a>
      </li>
      <li>
        <a href="/companies/ableton/reviews">Reviews</a>
      </li>
      <li>
        <a href="/companies/ableton/culture">Company Culture</a>
      </li>
    </menu>
  `,
};
CompanyMenu.parameters = {
  docs: {
    description: {
      story: 'Company-specific menu with custom title and company-related navigation items.',
    },
  },
};

// Admin/management menu
export const AdminMenu = Template.bind({});
AdminMenu.args = {
  open: true,
  pin: true,
  'show-default': false,
  'show-favicon': true,
  href: 'https://joblist.today',
  'menu-title': 'Admin Panel',
  slotContent: `
    <menu>
      <li>
        <a href="/admin/dashboard">Dashboard</a>
      </li>
      <li>
        <a href="/admin/companies">Manage Companies</a>
      </li>
      <li>
        <a href="/admin/jobs">Manage Jobs</a>
      </li>
      <li>
        <a href="/admin/users">User Management</a>
      </li>
      <li>
        <a href="/admin/analytics">Analytics</a>
      </li>
      <li>
        <a href="/admin/settings">Settings</a>
      </li>
    </menu>
  `,
};
AdminMenu.parameters = {
  docs: {
    description: {
      story: 'Administrative menu without default items, showing management and analytics functions.',
    },
  },
};

// Mobile-optimized menu (collapsed by default)
export const MobileMenu = Template.bind({});
MobileMenu.args = {
  open: false,
  pin: false,
  'show-default': true,
  'show-favicon': true,
  href: 'https://joblist.today',
};
MobileMenu.parameters = {
  docs: {
    description: {
      story: 'Mobile-optimized menu configuration, collapsed by default to save screen space.',
    },
  },
};

// Minimal menu (no default items)
export const MinimalMenu = Template.bind({});
MinimalMenu.args = {
  open: true,
  pin: false,
  'show-default': false,
  'show-favicon': false,
  href: 'https://joblist.today',
  slotContent: `
    <menu>
      <li>
        <a href="/">Home</a>
      </li>
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
    </menu>
  `,
};
MinimalMenu.parameters = {
  docs: {
    description: {
      story: 'Minimal menu configuration with only essential navigation items.',
    },
  },
};

// Developer tools menu
export const DeveloperMenu = Template.bind({});
DeveloperMenu.args = {
  open: true,
  pin: true,
  'show-default': false,
  'show-favicon': true,
  href: 'https://components.joblist.today',
  'menu-title': 'Developer Tools',
  slotContent: `
    <menu>
      <li>
        <a href="/storybook/">Storybook</a>
      </li>
      <li>
        <a href="/api-docs/">API Documentation</a>
      </li>
      <li>
        <a href="/playground/">Component Playground</a>
      </li>
      <li>
        <a href="/design-system/">Design System</a>
      </li>
      <li>
        <a href="/testing/">Testing Tools</a>
      </li>
      <li>
        <a href="/performance/">Performance Metrics</a>
      </li>
    </menu>
  `,
};
DeveloperMenu.parameters = {
  docs: {
    description: {
      story: 'Developer-focused menu with tools and documentation links for component development.',
    },
  },
};

// Job board specific menu
export const JobBoardMenu = Template.bind({});
JobBoardMenu.args = {
  open: true,
  pin: false,
  'show-default': true,
  'show-favicon': true,
  href: 'https://joblist.today',
  slotContent: `
    <menu>
      <li>
        <a href="/search?type=jobs">Search Jobs</a>
      </li>
      <li>
        <a href="/remote-jobs">Remote Jobs</a>
      </li>
      <li>
        <a href="/salary-insights">Salary Insights</a>
      </li>
      <li>
        <a href="/career-advice">Career Advice</a>
      </li>
      <li>
        <a href="/favorites">My Favorites</a>
      </li>
    </menu>
  `,
};
JobBoardMenu.parameters = {
  docs: {
    description: {
      story: 'Job board specific menu with job search and career-related navigation items.',
    },
  },
};

