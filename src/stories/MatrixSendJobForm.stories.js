import { html } from 'lit-html';
import '../components/matrix-send-job-form.js';

export default {
  title: 'Matrix/MatrixSendJobForm',
  component: 'joblist-matrix-send-job-form',
};

const Template = () => html`<joblist-matrix-send-job-form></joblist-matrix-send-job-form>`;

export const Default = Template.bind({});
Default.args = {};
