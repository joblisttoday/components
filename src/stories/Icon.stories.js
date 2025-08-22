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
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: iconNames,
    },
    title: { control: 'text' },
  },
};

const Template = ({ icon, title }) => html`
  <joblist-icon icon=${icon} title=${title}></joblist-icon>
`;

export const Default = Template.bind({});
Default.args = {
  icon: 'github',
  title: 'GitHub Icon',
};

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
