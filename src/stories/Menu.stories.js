import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import '../components/menu.js';
import '../components/icon.js';


export default {
  title: 'Components/Menu',
  component: 'joblist-menu',
  parameters: {
    layout: 'fullscreen',
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


// Menu with favicon (branded appearance)
export const WithFavicon = Template.bind({});
WithFavicon.args = {
  open: true,
  pin: false,
  'show-default': true,
  'show-favicon': true,
  href: 'https://joblist.today',
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


// Mobile-optimized menu (collapsed by default)
export const MobileMenu = Template.bind({});
MobileMenu.args = {
  open: false,
  pin: false,
  'show-default': true,
  'show-favicon': true,
  href: 'https://joblist.today',
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


