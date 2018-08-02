import rollupConfig from './rollup.config.js';
import { uglify as rollupPluginUglify } from 'rollup-plugin-uglify';

rollupConfig.plugins.push(rollupPluginUglify())

export default rollupConfig;
