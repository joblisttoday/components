import { html } from 'lit-html';
import '../components/aindex.js';


export default {
  title: 'Components/Aindex',
  component: 'joblist-aindex',
  subcomponents: { 'JoblistAindexToc': 'joblist-aindex-toc', 'JoblistAindexList': 'joblist-aindex-list' },
  argTypes: {
    list: { control: 'object' },
    key: { control: 'text' },
  },
};

const Template = ({ list, key }) => {
  return html`
    <joblist-aindex list=${JSON.stringify(list)} key=${key}>
      <template key="item">
        <p><strong data-item></strong></p>
      </template>
    </joblist-aindex>
  `;
};

export const Default = Template.bind({});
Default.args = {
  list: [
    { title: 'Apple' },
    { title: 'Banana' },
    { title: 'Cherry' },
    { title: 'Avocado' },
    { title: 'Blueberry' },
  ],
  key: 'title',
};


export const TocOnly = ({ toc }) => html`
  <joblist-aindex-toc index=${JSON.stringify(toc)}></joblist-aindex-toc>
`;
TocOnly.args = {
    toc: {
        A: ['Apple', 'Alphabet'],
        B: ['Banana', 'Book'],
    }
};


export const ListOnly = ({ list }) => html`
  <joblist-aindex-list index=${JSON.stringify(list)}>
    <template key="item">
      <p><strong data-item></strong></p>
    </template>
  </joblist-aindex-list>
`;
ListOnly.args = {
    list: {
        A: [{ title: 'Apple' }, { title: 'Alphabet' }],
        B: [{ title: 'Banana' }, { title: 'Book' }],
    }
};

