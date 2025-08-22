import { html } from 'lit-html';
import '../components/board.js';
import '../providers/greenhouse.js'; // Ensure a provider is loaded for the story
import '../providers/personio.js'; // Ensure a provider is loaded for the story


export default {
  title: 'Components/Board',
  component: 'joblist-board',
  parameters: {
    docs: {
      description: {
        component: 'The Board component is a factory that renders a specific job board provider based on the `provider-name` attribute. The provider component will then fetch and display the jobs for the given `provider-hostname`.\n\n## Events\n\n- `jobs-loaded`: Dispatched by the provider component when the jobs are loaded. The event detail contains the list of jobs.',
      },
    },
  },
  argTypes: {
    providerUrl: { control: 'text' },
    providerHostname: { control: 'text' },
    providerName: { control: 'text' },
    onJobsLoaded: { action: 'jobs-loaded' },
  },
};

const Template = ({ providerUrl, providerHostname, providerName }) => html`
  <joblist-board
    provider-url=${providerUrl}
    provider-hostname=${providerHostname}
    provider-name=${providerName}
  ></joblist-board>
`;

export const FromUrl = Template.bind({});
FromUrl.args = {
  providerUrl: 'https://boards.greenhouse.io/greenhouse',
};

