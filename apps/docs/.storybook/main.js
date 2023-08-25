const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],

  babel: async (config) => {
    config.plugins.push('babel-plugin-styled-components');
    return config;
  },

  typescript: {
    reactDocgen: false,
  },

  webpack: async (config) => {
    if (config.mode === 'production') {
      config.devtool = false;
    }

    if (config.resolve.plugins === null) {
      config.resolve.plugins = [];
    }

    config.resolve.plugins.push(new TsconfigPathsPlugin());

    // @see https://github.com/graphql/graphql-js/issues/1272#issuecomment-393903706
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    return config;
  },
};
