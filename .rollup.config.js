module.exports = {
	input: 'media-player.js',
	name: 'MediaPlayer',
	plugins: [
		require('rollup-plugin-babel')({
			babelrc: false,
			plugins: [
				require('babel-plugin-external-helpers')
			],
			presets: [
				[
					require('babel-preset-env'),
					{
						modules: false
					}
				]
			]
		})
	].concat(
		// neatness
		process.argv.includes('--compress') ? [
			require('rollup-plugin-uglify')()
		] : []
	)
};
