import React from "react";
import { Decorator, Preview } from "@storybook/react";
import '@fortawesome/fontawesome-svg-core/styles.css';
import "./fonts.scss";
import '@/css/globals.scss';
import "@/css/prism.scss";

import { ThemeProvider } from "next-themes";

const CustomDecorator: Decorator = (Story: any, context: any) => {

  const { theme } = context.globals;

  return (
    <ThemeProvider attribute="class" forcedTheme={ theme } themes={ ['light', 'dark'] }>
      <Story { ...context } />
    </ThemeProvider>
  )
}


const preview: Preview = {
  decorators: [CustomDecorator],
  globalTypes: {
    theme: {
      description: "global theme for component",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true
      }
    }
  },
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
