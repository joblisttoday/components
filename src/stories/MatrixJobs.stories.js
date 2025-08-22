import { html } from 'lit-html';
import '../components/matrix-jobs.js';
import mwc from '../libs/mwc.js';

// Mock the mwc library by directly setting componentDefinitions
if (!mwc.componentDefinitions['matrix-room']) {
  mwc.componentDefinitions['matrix-room'] = class MatrixRoom extends HTMLElement {
    connectedCallback() {
      let content = 'Mock Matrix Room';
      if (this.hasAttribute('filter')) {
        content += ` Filter: ${this.getAttribute('filter')}`;
      }
      if (this.hasAttribute('show-event-info')) {
        content += ' Show Event Info';
      }
      if (this.hasAttribute('show-context')) {
        content += ' Show Context';
      }
      if (this.hasAttribute('origin')) {
        content += ` Origin: ${this.getAttribute('origin')}`;
      }
      
      this.textContent = content;
    }
  };
}

export default {
  title: 'Components/Matrix/MatrixJobs',
  component: 'joblist-matrix-jobs',
  argTypes: {
    filter: { control: 'object' },
    showEventInfo: { control: 'boolean' },
    showContext: { control: 'boolean' },
    origin: { control: 'text' },
    profileId: { control: 'text' },
  },
};

const Template = ({ filter, showEventInfo, showContext, origin, profileId }) => html`
  <joblist-matrix-jobs
    .filter=${filter}
    ?show-event-info=${showEventInfo}
    ?show-context=${showContext}
    origin=${origin}
    profile-id=${profileId}
  ></joblist-matrix-jobs>
`;

export const Default = Template.bind({});
Default.args = {
  filter: { a: 1 },
  showEventInfo: false,
  showContext: false,
  origin: '',
  profileId: '',
};

