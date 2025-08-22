import { html } from 'lit-html';
import '../components/tag.js';
import '../components/icon.js'; // Tag depends on Icon


export default {
  title: 'Components/Tag',
  component: 'joblist-tag',
  argTypes: {
    tag: { control: 'text' },
    origin: { control: 'text' },
  },
};

const Template = ({ tag, origin }) => html`
  <joblist-tag 
    tag='"${tag}"' 
    origin=${origin}
  ></joblist-tag>
`;

export const Default = Template.bind({});
Default.args = {
  tag: 'web-components',
  origin: '#/search?q=',
};

