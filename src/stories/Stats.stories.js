import { html } from 'lit-html';
import '../components/stats.js';

export default {
  title: 'Components/Stats',
  component: 'joblist-stats',
  argTypes: {
    parquetBase: { control: 'text' },
  },
};

const Template = ({ parquetBase }) => html`<joblist-stats parquet-base=${parquetBase}></joblist-stats>`;

export const Default = Template.bind({});
Default.args = {
  parquetBase: undefined, // Use component's default
};

export const WithCustomParquetBase = Template.bind({});
WithCustomParquetBase.args = {
  parquetBase: 'https://custom.joblist.today',
};