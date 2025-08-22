import { html } from 'lit-html';

export default {
  title: 'Components/SocialWidget',
  component: 'joblist-social-widget',
  argTypes: {
    company: { control: 'object' },
  },
};

const Template = ({ company }) => html`
  <joblist-social-widget company=${JSON.stringify(company)}></joblist-social-widget>
`;

export const Default = Template.bind({});
Default.args = {
  company: {
    wikipedia_url: 'https://en.wikipedia.org/wiki/Example',
    linkedin_url: 'https://linkedin.com/company/example',
    twitter_url: 'https://twitter.com/example',
    youtube_url: 'https://youtube.com/example',
    facebook_url: 'https://facebook.com/example',
    instagram_url: 'https://instagram.com/example',
  },
};

export const NoSocialLinks = Template.bind({});
NoSocialLinks.args = {
  company: {},
};
