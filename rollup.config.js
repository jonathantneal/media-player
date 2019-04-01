import babelPresetEnv from '@babel/preset-env';
import rollupPluginBabel from 'rollup-plugin-babel';
import { terser as rollupPluginTerser } from 'rollup-plugin-terser';

const isBrowser  = String(process.env.NODE_ENV).includes('browser');
const isGhpages  = String(process.env.NODE_ENV).includes('gh-pages');
const isMinified = String(process.env.NODE_ENV).includes('min');

console.log({ isGhpages });

const output = isGhpages ? [
	{ file: '.gh-pages/media-player.js', format: 'iife', name: 'MediaPlayer', sourcemap: 'inline', strict: false }
] : isBrowser ? [
	{ file: 'browser.js', format: 'iife', name: 'MediaPlayer', strict: false }
] : [
	{ file: 'index.js', format: 'cjs', strict: false },
	{ file: 'index.mjs', format: 'esm', strict: false }
];

const plugins = [
	rollupPluginBabel({
		babelrc: false,
		presets: [
			[babelPresetEnv, {
				corejs: 3,
				loose: true,
				modules: false,
				useBuiltIns: 'entry'
			}]
		]
	})
].concat(isMinified
	? rollupPluginTerser()
: []);

export default { input: 'src/index.js', output, plugins };
