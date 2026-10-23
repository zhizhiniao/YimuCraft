const fs=require('fs');
require('esbuild').buildSync({entryPoints:['src/model-view-entry.js'],bundle:true,minify:true,format:'iife',platform:'browser',target:'chrome140',outfile:'src/model-view.js',legalComments:'external'});
fs.copyFileSync('node_modules/three/LICENSE','src/third-party/Three-LICENSE.txt');
