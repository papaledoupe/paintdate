/**
 * Function that mutates the original webpack config.
 * Supports asynchronous changes when a promise is returned (or it's an async function).
 *
 * @param {import('preact-cli').Config} config - original webpack config
 * @param {import('preact-cli').Env} env - current environment and options pass to the CLI
 * @param {import('preact-cli').Helpers} helpers - object with useful helpers for working with the webpack config
 * @param {Record<string, unknown>} options - this is mainly relevant for plugins (will always be empty in the config), default to an empty object
 */
export default (config, env, helpers, options) => {
    // don't obfuscate class names as we rely on them for serializations
    if (config.optimization && config.optimization.minimizer) {
        const terser = config.optimization.minimizer.find(p => p.constructor.name === 'TerserPlugin');
        if (terser) {
            terser.options.terserOptions.mangle = {
                keep_fnames: true,
                keep_classnames: true,
            };
            terser.options.terserOptions.compress.keep_fnames = true;
            terser.options.terserOptions.compress.keep_classnames = true;
        }
    }
};