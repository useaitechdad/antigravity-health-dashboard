/*
 * Copyright 2026 Use AI with Tech Dad
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * NOTICE: This file has been modified by Use AI with Tech Dad for the Antigravity series.
 */

const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  // 1. Extension Build Context (Node.js/CommonJS)
  const extensionCtx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js', // Direct file output
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    sourcemap: !production,
    minify: production,
    logLevel: 'info',
    loader: { '.ts': 'ts' }
  });

  // 2. Webview Build Context (Browser/ESM)
  const webviewCtx = await esbuild.context({
    entryPoints: ['src/view/webview/webview.ts'],
    bundle: true,
    outfile: 'dist/webview.js', // Direct file output
    format: 'esm', // ES Modules for browser
    platform: 'browser',
    sourcemap: !production,
    minify: production,
    logLevel: 'info',
    plugins: [
      {
        name: 'webview-css-loader',
        setup(build) {
          build.onLoad({ filter: /\.css$/ }, async () => ({ loader: 'css' }));
        }
      }
    ],
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.css': 'css'
    }
  });

  if (watch) {
    await Promise.all([
      extensionCtx.watch(),
      webviewCtx.watch()
    ]);
  } else {
    await Promise.all([
      extensionCtx.rebuild(),
      webviewCtx.rebuild()
    ]);
    await Promise.all([
      extensionCtx.dispose(),
      webviewCtx.dispose()
    ]);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
