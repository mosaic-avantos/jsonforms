import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import { visualizer } from 'rollup-plugin-visualizer';
import typescript from 'rollup-plugin-typescript2';
import packageJson from './package.json';

const baseConfig = {
  input: 'src/index.ts',
  external: [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ].filter((dep) => !dep.includes('tslib')),
};

const basePlugins = [
  json(),
  nodeResolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }),
  cleanup({ extensions: ['ts', 'tsx', 'js', 'jsx'] }),
  visualizer({ template: 'sunburst' }),
];

export default [
  // ESM build
  {
    ...baseConfig,
    output: {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      ...basePlugins,
      typescript({
        tsconfig: './tsconfig.json',
        check: false,
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
  // CommonJS build
  {
    ...baseConfig,
    output: {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      ...basePlugins,
      typescript({
        tsconfig: './tsconfig.json',
        check: false,
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
          },
        },
      }),
      commonjs(),
    ],
  },
];