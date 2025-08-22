import { html } from 'lit-html';
import '../components/storage-widget.js';

export default {
  title: 'Components/StorageWidget',
  component: 'joblist-storage-widget',
};

const Template = () => html`<joblist-storage-widget></joblist-storage-widget>`;

export const Disconnected = Template.bind({});
Disconnected.args = {};

export const Connected = Template.bind({});
Connected.args = {};

export const ConnectedLocal = Template.bind({});
ConnectedLocal.args = {};