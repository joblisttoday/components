import { html } from 'lit-html';
import '../components/favicon.js';


export default {
  title: 'Components/Favicon',
  component: 'joblist-favicon',
  argTypes: {
    color: { control: 'color' },
    href: { control: 'text' },
  },
};

const Template = ({ color, href }) => html`
  <joblist-favicon color=${color} href=${href}></joblist-favicon>
`;

export const Default = Template.bind({});
Default.args = {
  // Uses default color and no href
};

