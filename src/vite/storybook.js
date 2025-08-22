import { defineConfig } from "vite";
import { readFileSync } from "fs";

const packageJson = JSON.parse(
  readFileSync("./package.json", { encoding: "utf8" })
);

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  optimizeDeps: {
    include: [
      "@storybook/web-components",
      "@storybook/blocks",
    ],
  },
});