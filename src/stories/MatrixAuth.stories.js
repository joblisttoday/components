import { html } from 'lit-html';


export default {
  title: 'Matrix/MatrixAuth',
  component: 'joblist-matrix-auth',
  argTypes: {
    showUser: { control: 'boolean', description: 'Whether to show user information' },
  },
};

const Template = ({ showUser }) => html`<joblist-matrix-auth ?show-user=${showUser}></joblist-matrix-auth>`;

export const Default = Template.bind({});
Default.args = {
  showUser: false,
};
