const preactPreset = require('jest-preset-preact');
const path = require('path');

module.exports = {
    ...preactPreset,
    preset: "jest-preset-preact",
    transform: {
        ...preactPreset.transform,
        '^.+\\.(mjs|js|jsx|ts|tsx)$': path.join(__dirname, 'babelTest.js'),
    },
    setupFiles: [
        ...preactPreset.setupFiles,
        "<rootDir>/tests/__mocks__/browserMocks.ts",
        "<rootDir>/tests/__mocks__/setupTests.ts",
    ]
};
