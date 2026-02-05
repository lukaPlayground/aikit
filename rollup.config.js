import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const banner = `/*!
 * AIKit v0.1.0
 * Universal AI API Client Framework
 * (c) 2025 Luka (lukaPlayground)
 * Released under the MIT License
 */`;

export default [
    // UMD build (for browsers via <script> tag)
    {
        input: 'src/index.js',
        output: {
            name: 'AIKit',
            file: 'dist/aikit.js',
            format: 'umd',
            banner,
            sourcemap: true
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
            name: 'AIKit',
            file: 'dist/aikit.min.js',
            format: 'umd',
            banner,
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs(),
            terser({
                format: {
                    comments: /^!/
                }
            })
        ]
    }
];
