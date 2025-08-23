import { html } from 'lit-html';
import '../components/aindex.js';

export default {
  title: 'Site/Aindex',
  component: 'joblist-aindex-list',
  subcomponents: { 'JoblistAindexToc': 'joblist-aindex-toc', 'JoblistAindexList': 'joblist-aindex-list' },
  argTypes: {
    index: { control: 'object' },
  },
};

// Simple usage matching apps/aindex-list example (strings per letter)
const ListTemplate = ({ index }) => html`
  <joblist-aindex-list index='${JSON.stringify(index)}'></joblist-aindex-list>
`;

export const SimpleIndex = ListTemplate.bind({});
SimpleIndex.args = {
  index: {
    A: ['Apple', 'Alphabet'],
    B: ['Banana', 'Book'],
    C: ['Cherry'],
  },
};

// Optional: show wrapper that builds the index from a list+key
const WrapperTemplate = ({ list, key }) => html`
  <joblist-aindex index='${JSON.stringify(list)}' key='${key}'>
    <template key="item">
      <p><strong data-item></strong></p>
    </template>
  </joblist-aindex>
`;

export const FromList = WrapperTemplate.bind({});
FromList.args = {
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
  <joblist-aindex-toc index="${JSON.stringify(toc)}"></joblist-aindex-toc>
`;
TocOnly.args = {
    toc: {
        A: ['Apple', 'Alphabet'],
        B: ['Banana', 'Book'],
    }
};


export const ListOnly = ({ list }) => html`
  <joblist-aindex-list index="${JSON.stringify(list)}">
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
