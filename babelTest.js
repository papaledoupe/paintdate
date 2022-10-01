// copy of jest-preset-preact with extra babel plugins added where needed
// https://github.com/preactjs/jest-preset-preact/blob/master/src/babel.js

const babelJest = require('babel-jest');

module.exports = babelJest.default.createTransformer({
    presets: [
        [
            '@babel/preset-typescript',
            {
                jsxPragma: 'h',
                jsxPragmaFrag: 'Fragment',
            },
        ],
        '@babel/preset-env',
    ],
    plugins: [
        [
            '@babel/plugin-transform-react-jsx',
            {
                pragma: 'h',
                pragmaFrag: 'Fragment',
            },
        ],
        [
            '@babel/plugin-proposal-decorators',
            {
                version: 'legacy',
            }
        ],
        '@babel/plugin-proposal-class-properties',
    ],
    babelrc: false,
    configFile: false,
});