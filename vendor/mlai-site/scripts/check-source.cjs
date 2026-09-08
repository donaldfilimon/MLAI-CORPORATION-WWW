const fs=require('node:fs'),path=require('node:path');
const {ts}=require('./ts-loader.cjs');const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=['app','components','lib'].flatMap(p=>walk(path.join(root,p))).concat(path.join(root,'source.config.ts')).filter(p=>/\.tsx?$/.test(p)&&!p.endsWith('.d.ts'));
let errors=0;
for(const file of files){const result=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve,isolatedModules:true}});for(const d of result.diagnostics||[]){if(d.category===ts.DiagnosticCategory.Error){errors++;console.error(path.relative(root,file),ts.flattenDiagnosticMessageText(d.messageText,'\n'));}}}
console.log(`${files.length} TypeScript/TSX files syntax-transpiled; ${errors} syntax diagnostics. This is not full dependency type-checking.`);if(errors)process.exitCode=1;
