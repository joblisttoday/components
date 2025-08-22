import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import '../components/menu.js';
import '../components/icon.js';


export default {
  title: 'Components/Menu',
  component: 'joblist-menu',
  argTypes: {
    open: { control: 'boolean' },
    pin: { control: 'boolean' },
    showDefault: { control: 'boolean' },
    showFavicon: { control: 'boolean' },
    href: { control: 'text' },
    slotContent: { control: 'text' },
  },
};

const Template = ({ open, pin, showDefault, showFavicon, href, slotContent }) => html`
  <joblist-menu
    ?open=${open}
    ?pin=${pin}
    ?show-default=${showDefault}
    ?show-favicon=${showFavicon}
    href=${href}
  >
    ${slotContent ? unsafeHTML(slotContent) : ''}
  </joblist-menu>
`;

export const Default = Template.bind({});
Default.args = {
  open: true,
  pin: true,
  showDefault: true,
  showFavicon: true,
  slotContent: `
    <menu>
        <li>
            <a href="../../">Components home</a>
        </li>
    </menu>
  `,
};

