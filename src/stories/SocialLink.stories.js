import { html } from 'lit-html';

export default {
  title: 'Site/Social Link',
  component: 'joblist-social-link',
  argTypes: {
    url: { control: 'text' },
    provider: { control: 'text' },
    showEmbed: { control: 'boolean' },
  },
};

const Template = ({ url, provider, showEmbed }) => html`
  <joblist-social-link
    url=${url}
    provider=${provider}
    ?show-embed=${showEmbed}
  ></joblist-social-link>
`;

export const Default = Template.bind({});
Default.args = {
  url: 'https://twitter.com/joblist',
  provider: 'twitter',
  showEmbed: false,
};

export const WithEmbed = Template.bind({});
WithEmbed.args = {
  ...Default.args,
  showEmbed: true,
};
