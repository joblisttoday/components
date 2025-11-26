import { html } from 'lit-html';
import '../components/stats.js';

export default {
  title: 'DuckDB/Stats',
  component: 'joblist-stats',
  argTypes: {
    parquetBase: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Reads aggregate counts (jobs, companies, generated_at) from stats.parquet at the configured base.',
      },
    },
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
