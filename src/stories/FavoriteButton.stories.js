import { html } from 'lit-html';
import '../components/favorite-button.js';

export default {
  title: 'Components/FavoriteButton',
  component: 'joblist-favorite-button',
  argTypes: {
    itemId: { control: 'text' },
    itemType: { control: { type: 'radio' }, options: ['company', 'job'] },
  },
};

const Template = ({ itemId, itemType }) => html`
  <joblist-favorite-button item-id=${itemId} item-type=${itemType}></joblist-favorite-button>
`;

export const Company = Template.bind({});
Company.args = {
  itemId: 'spacex',
  itemType: 'company',
};

export const Job = Template.bind({});
Job.args = {
  itemId: 'example-job-123',
  itemType: 'job',
};

export const MultipleExamples = () => html`
  <div style="display: flex; align-items: center; gap: 1rem; margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
    <span>SpaceX Company:</span>
    <joblist-favorite-button item-id="spacex" item-type="company"></joblist-favorite-button>
  </div>
  <div style="display: flex; align-items: center; gap: 1rem; margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
    <span>Example Job:</span>
    <joblist-favorite-button item-id="example-job-123" item-type="job"></joblist-favorite-button>
  </div>
  <div style="display: grid; gap: 0.5rem; margin: 1rem 0;">
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border: 1px solid #eee;">
      <span>Ableton</span>
      <joblist-favorite-button item-id="ableton" item-type="company"></joblist-favorite-button>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border: 1px solid #eee;">
      <span>Frontend Developer Job</span>
      <joblist-favorite-button item-id="frontend-dev-job" item-type="job"></joblist-favorite-button>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border: 1px solid #eee;">
      <span>Backend Developer Job</span>
      <joblist-favorite-button item-id="backend-dev-job" item-type="job"></joblist-favorite-button>
    </div>
  </div>
`;