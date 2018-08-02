module.exports = ctx => ({
	map: ctx.options.map,
	plugins: [
		// future compatibility
		require('postcss-preset-env')({
			features: {
				'custom-properties': {
					preserve: false
				}
			},
			stage: 0
		})
	].concat(
		// neatness and compression
		process.argv.includes('--start') ? [
			require('cssnano')({
				normalizeUrl: false,
				preset: ['default', {
					normalizeUrl: false
				}]
			}),
			compress()
		] : [
			require('postcss-discard-comments')(),
			require('postcss-discard-duplicates')(),
			require('postcss-discard-overridden')(),
			require('postcss-merge-rules')(),
			require('postcss-calc')(),
			compress(),
			prettier()
		]
	)
});

// tooling
const postcss = require('postcss');

// plugin
const compress = postcss.plugin('postcss-discard-tested-duplicate-declarations', (opts) => (root) => {
	const testProp  = opts && 'testProp' in opts ? opts.testProp : (prop) => !/^:*-/.test(prop);
	const testValue = opts && 'testValue' in opts ? opts.testValue : (value) => !/(^var|^\s*-|\s+-\w+-)/.test(value);

	root.walkRules((rule) => {
		var propsMap = {};

		rule.nodes.slice(0).forEach((decl) => {
			if (testProp(decl.prop) && testValue(decl.value)) {
				const prevDecl = propsMap[decl.prop];

				if (prevDecl) {
					if (testValue(prevDecl.value)) {
						if (decl.import || !prevDecl.import) {
							prevDecl.remove();

							propsMap[decl.prop] = decl;
						} else {
							decl.remove();
						}
					}
				} else {
					propsMap[decl.prop] = decl;
				}
			}
		})
	});
});

// plugin
const prettier = postcss.plugin('postcss-prettier', () => root => {
	const raws = {
		decl: {
			before: '\n\t',
			between: ': '
		},
		rule: {
			before: '\n\n',
			between: ' ',
			semicolon: true,
			after: '\n'
		}
	};

	root.walk(node => {
		node.raws = raws[node.type] || {};

		if (node.type === 'rule') {
			node.nodes = node.nodes.sort(
				(a, b) => a.prop < b.prop
					? -1
				: a.prop > b.prop
					? 1
				: 0
			);
		}
	});
});
