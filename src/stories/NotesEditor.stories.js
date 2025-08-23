import { html } from 'lit-html';
import '../components/notes-editor.js';

export default {
  title: 'RemoteStorage/Notes Editor',
  component: 'joblist-notes-editor',
  argTypes: {
    itemId: { control: 'text' },
    itemType: { control: { type: 'radio' }, options: ['company', 'job'] },
    placeholder: { control: 'text' },
  },
};

const Template = ({ itemId, itemType, placeholder }) => html`
  <joblist-notes-editor
    item-id=${itemId}
    item-type=${itemType}
    placeholder=${placeholder}
  ></joblist-notes-editor>
`;

export const CompanyNotes = Template.bind({});
CompanyNotes.args = {
  itemId: 'spacex',
  itemType: 'company',
  placeholder: 'Write your notes about SpaceX here...',
};

export const JobNotes = Template.bind({});
JobNotes.args = {
  itemId: 'spacex-frontend-role',
  itemType: 'job',
  placeholder: 'Track your application progress, interview notes, etc...',
};
