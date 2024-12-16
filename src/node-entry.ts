//// node cli的入口
export { default as rollup, defineConfig } from './rollup/rollup';
export { default as watch } from './watch/watch-proxy';
export { version as VERSION } from 'package.json';
