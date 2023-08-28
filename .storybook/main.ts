import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../**/*.stories.mdx",
    "../**/*.stories.@(ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/addon-themes"
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config, options) => {
    config.resolve!.alias = {
      ...config.resolve?.alias,
      '@': path.resolve(__dirname, "../"),
    }
    return config;
  },
  env: (config) => {
    return {
      ...config,
      STORY_BOOK: 'true',
    }

  },
};
export default config;
