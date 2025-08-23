import { html } from 'lit-html';
import '../components/icon.js';

// This is a simplified map for the story, the real one is in the component itself.
const iconMap = {
    'twitter': 'Twitter',
    'x': 'Twitter',
    'linkedin': 'Linkedin',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'youtube': 'Youtube',
    'github': 'Github',
    'wikipedia': 'FileText',
    'website': 'Globe',
    'company': 'Building',
    'job-board': 'Briefcase',
    'link': 'ExternalLink',
    'url': 'Link',
    'search': 'Search',
    'menu': 'Menu',
    'home': 'Home',
    'users': 'Users',
    'building': 'Building',
    'map': 'Map',
    'chart': 'BarChart3',
    'edit': 'Edit',
    'file': 'File',
    'trash': 'Trash2',
    'issue': 'Bug',
    'settings': 'Settings',
    'plus': 'Plus',
    'code': 'Code',
    'database': 'Database',
    'tag': 'Tag',
    'hash': 'Hash',
    'gitlab': 'GitBranch',
    'message-circle': 'MessageCircle',
    'newspaper': 'Newspaper',
};
const iconNames = Object.keys(iconMap);

export default {
  title: 'Components/Icon',
  component: 'joblist-icon',
  parameters: { layout: "padded" },
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: iconNames,
      description: 'Icon identifier - maps to Lucide icon names with smart defaults for social platforms',
      defaultValue: 'github',
    },
    title: {
      control: 'text',
      description: 'Accessible title attribute for the icon (optional)',
      defaultValue: '',
    },
    size: {
      control: { type: 'range', min: 12, max: 64, step: 4 },
      description: 'Icon size in pixels (applied via CSS)',
      defaultValue: 24,
    },
  },
};

const Template = (args) => html`
  <div style="font-size: ${args.size || 24}px;">
    <joblist-icon 
      icon="${args.icon || 'github'}" 
      ${args.title ? `title="${args.title}"` : ''}
    ></joblist-icon>
  </div>
`;

// Default GitHub icon (most common use case)
export const Default = Template.bind({});
Default.args = {
  icon: 'github',
  title: 'GitHub Icon',
  size: 24,
};


// Social media icons collection
export const SocialMediaIcons = () => html`
  <style>
    .icon-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: center;
    }
    .icon-item joblist-icon {
      font-size: 24px;
    }
  </style>
  <div class="icon-showcase">
    <div class="icon-item">
      <joblist-icon icon="github" title="GitHub"></joblist-icon>
      <code>github</code>
      <small>Code repositories</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="linkedin" title="LinkedIn"></joblist-icon>
      <code>linkedin</code>
      <small>Professional network</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="twitter" title="Twitter/X"></joblist-icon>
      <code>twitter</code>
      <small>Social updates</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="x" title="X (Twitter)"></joblist-icon>
      <code>x</code>
      <small>Twitter rebrand</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="facebook" title="Facebook"></joblist-icon>
      <code>facebook</code>
      <small>Social platform</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="instagram" title="Instagram"></joblist-icon>
      <code>instagram</code>
      <small>Photo sharing</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="youtube" title="YouTube"></joblist-icon>
      <code>youtube</code>
      <small>Video content</small>
    </div>
  </div>
`;


// Development and tech icons
export const DevelopmentIcons = () => html`
  <style>
    .icon-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: center;
    }
    .icon-item joblist-icon {
      font-size: 24px;
    }
  </style>
  <div class="icon-showcase">
    <div class="icon-item">
      <joblist-icon icon="code" title="Code"></joblist-icon>
      <code>code</code>
      <small>Programming</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="database" title="Database"></joblist-icon>
      <code>database</code>
      <small>Data storage</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="gitlab" title="GitLab"></joblist-icon>
      <code>gitlab</code>
      <small>Git repository</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="issue" title="Bug Report"></joblist-icon>
      <code>issue</code>
      <small>Bug tracking</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="settings" title="Settings"></joblist-icon>
      <code>settings</code>
      <small>Configuration</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="search" title="Search"></joblist-icon>
      <code>search</code>
      <small>Find content</small>
    </div>
  </div>
`;


// Business and office icons
export const BusinessIcons = () => html`
  <style>
    .icon-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: center;
    }
    .icon-item joblist-icon {
      font-size: 24px;
    }
  </style>
  <div class="icon-showcase">
    <div class="icon-item">
      <joblist-icon icon="building" title="Company"></joblist-icon>
      <code>building</code>
      <small>Company profile</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="job-board" title="Job Board"></joblist-icon>
      <code>job-board</code>
      <small>Job listings</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="users" title="Team"></joblist-icon>
      <code>users</code>
      <small>Team members</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="chart" title="Analytics"></joblist-icon>
      <code>chart</code>
      <small>Data visualization</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="map" title="Location"></joblist-icon>
      <code>map</code>
      <small>Geographic data</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="newspaper" title="News"></joblist-icon>
      <code>newspaper</code>
      <small>Company news</small>
    </div>
  </div>
`;


// UI and navigation icons
export const UIIcons = () => html`
  <style>
    .icon-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: center;
    }
    .icon-item joblist-icon {
      font-size: 24px;
    }
  </style>
  <div class="icon-showcase">
    <div class="icon-item">
      <joblist-icon icon="menu" title="Menu"></joblist-icon>
      <code>menu</code>
      <small>Navigation menu</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="home" title="Home"></joblist-icon>
      <code>home</code>
      <small>Homepage</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="plus" title="Add"></joblist-icon>
      <code>plus</code>
      <small>Add new item</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="edit" title="Edit"></joblist-icon>
      <code>edit</code>
      <small>Edit content</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="trash" title="Delete"></joblist-icon>
      <code>trash</code>
      <small>Remove item</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="link" title="External Link"></joblist-icon>
      <code>link</code>
      <small>External links</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="file" title="Document"></joblist-icon>
      <code>file</code>
      <small>File/document</small>
    </div>
  </div>
`;


// Different icon sizes
export const IconSizes = () => html`
  <style>
    .size-demo {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid #eee;
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
      <div style="font-size: 16px;">
        <joblist-icon icon="github" title="Small GitHub"></joblist-icon>
      </div>
      <code>16px</code>
      <small>Small</small>
    </div>
    <div class="size-item">
      <div style="font-size: 24px;">
        <joblist-icon icon="github" title="Medium GitHub"></joblist-icon>
      </div>
      <code>24px</code>
      <small>Default</small>
    </div>
    <div class="size-item">
      <div style="font-size: 32px;">
        <joblist-icon icon="github" title="Large GitHub"></joblist-icon>
      </div>
      <code>32px</code>
      <small>Large</small>
    </div>
    <div class="size-item">
      <div style="font-size: 48px;">
        <joblist-icon icon="github" title="Extra Large GitHub"></joblist-icon>
      </div>
      <code>48px</code>
      <small>X-Large</small>
    </div>
  </div>
`;


// Website and link icons
export const WebsiteIcons = () => html`
  <style>
    .icon-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: center;
    }
    .icon-item joblist-icon {
      font-size: 24px;
    }
  </style>
  <div class="icon-showcase">
    <div class="icon-item">
      <joblist-icon icon="website" title="Website"></joblist-icon>
      <code>website</code>
      <small>Company website</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="url" title="URL"></joblist-icon>
      <code>url</code>
      <small>Web link</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="wikipedia" title="Wikipedia"></joblist-icon>
      <code>wikipedia</code>
      <small>Wikipedia entry</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="message-circle" title="Communication"></joblist-icon>
      <code>message-circle</code>
      <small>Contact/chat</small>
    </div>
  </div>
`;


// Tags and categorization icons
export const CategoryIcons = () => html`
  <style>
    .icon-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: center;
    }
    .icon-item joblist-icon {
      font-size: 24px;
    }
  </style>
  <div class="icon-showcase">
    <div class="icon-item">
      <joblist-icon icon="tag" title="Tag"></joblist-icon>
      <code>tag</code>
      <small>Content tags</small>
    </div>
    <div class="icon-item">
      <joblist-icon icon="hash" title="Hashtag"></joblist-icon>
      <code>hash</code>
      <small>Hashtag/ID</small>
    </div>
  </div>
`;


export const AllIcons = () => html`
  <style>
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1rem;
      text-align: center;
    }
    .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
  </style>
  <div class="icon-grid">
    ${iconNames.map(
      (icon) => html`
        <div class="icon-item">
          <joblist-icon icon=${icon}></joblist-icon>
          <code>${icon}</code>
        </div>
      `,
    )}
  </div>
`;
