import "../src/styles/index.css";
import "../src/index.js"; // Import all components

/** @type { import('@storybook/web-components').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      extractComponentDescription: (component, { notes }) => {
        if (notes) {
          return typeof notes === "string" ? notes : notes.markdown || notes.text;
        }
        return null;
      },
    },
    options: {
      storySort: {
        order: ["Introduction", "Components", "*"],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;