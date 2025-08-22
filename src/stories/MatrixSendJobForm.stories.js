import { html } from 'lit-html';
import '../components/matrix-send-job-form.js';

export default {
  title: 'Components/Matrix/MatrixSendJobForm',
  component: 'matrix-send-job-form',
};

const Template = () => html`<matrix-send-job-form></matrix-send-job-form>`;

export const Default = Template.bind({});
Default.args = {};