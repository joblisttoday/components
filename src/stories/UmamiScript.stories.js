import { html } from 'lit-html';
import '../components/umami-script.js';


export default {
  title: 'Components/UmamiScript',
  component: 'joblist-umami-script',
  argTypes: {
    websiteId: { control: 'text' },
    zone: { control: 'text' },
    src: { control: 'text' },
  },
};

const Template = ({ websiteId, zone, src }) => html`
  <joblist-umami-script
    website-id=${websiteId}
    zone=${zone}
    src=${src}
  ></joblist-umami-script>
`;

export const Default = Template.bind({});
Default.args = {
  websiteId: '479fa5c4-e9c9-4d8d-85c6-9a88c886dd24',
  zone: 'eu',
  src: 'https://eu.umami.is/script.js',
};

