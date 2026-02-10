import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // ESM build (for import)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/aikit.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  // UMD build (for require and browser)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/aikit.umd.js',
      format: 'umd',
      name: 'AIKit',
      sourcemap: true,
      exports: 'default'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  // Minified UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/aikit.min.js',
      format: 'umd',
      name: 'AIKit',
      sourcemap: true,
      exports: 'default'
    },
    plugins: [
      resolve(),
      commonjs(),
      terser()
    ]
  }
];
