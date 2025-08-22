import { html } from 'lit-html';
import '../components/boards.js';
import '../components/board.js';
import '../providers/greenhouse.js';
import '../providers/lever.js';


export default {
  title: 'Components/Boards',
  component: 'joblist-boards',
};

const Template = () => html`<joblist-boards></joblist-boards>`;

export const Default = Template.bind({});
Default.args = {};

