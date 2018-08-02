import rollupPluginBabel from 'rollup-plugin-babel';
import babelPluginExternalHelpers from 'babel-plugin-external-helpers';
import babelPresetEnv from 'babel-preset-env';

export default {
	plugins: [
		rollupPluginBabel({
			babelrc: false,
			plugins: [
				babelPluginExternalHelpers
			],
			presets: [
				[
					babelPresetEnv,
					{
						modules: false
					}
				]
			]
		})
	]
};
