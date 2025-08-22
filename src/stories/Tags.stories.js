import { html } from 'lit-html';

export default {
  title: 'Components/Tags',
  component: 'joblist-tags',
  argTypes: {
    origin: { control: 'text' },
    limit: { control: 'number' },
    threshold: { control: 'number' },
  },
};

const Template = ({ origin, limit, threshold }) => html`
  <joblist-tags
    origin=${origin}
    limit=${limit}
    threshold=${threshold}
  ></joblist-tags>
`;

export const Default = Template.bind({});
Default.args = {
  origin: '#/tags/',
  limit: 10,
  threshold: 1,
};

export const HigherThreshold = Template.bind({});
HigherThreshold.args = {
  ...Default.args,
  threshold: 2,
};

export const LimitedTags = Template.bind({});
LimitedTags.args = {
  ...Default.args,
  limit: 2,
};
