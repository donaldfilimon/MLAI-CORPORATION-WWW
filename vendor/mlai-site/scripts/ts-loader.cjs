// Review/export helper only. This does not implement React or verify Next.js.
const fs=require('node:fs');
const Module=require('node:module');
const path=require('node:path');
function compiler(){
 try { return require('typescript'); } catch {
  if(process.env.TYPESCRIPT_PATH) return require(process.env.TYPESCRIPT_PATH);
  throw new Error('Install dependencies first, or set TYPESCRIPT_PATH to a local TypeScript compiler.');
 }
}
const ts=compiler();
function register(){
 for(const ext of ['.ts','.tsx']) require.extensions[ext]=function(module,filename){
  const source=fs.readFileSync(filename,'utf8');
  const output=ts.transpileModule(source,{fileName:filename,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'__h',jsxFragmentFactory:'__Fragment',esModuleInterop:true}});
  const errors=(output.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors.length) throw new Error(errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('\n'));
  const prefix=`const {h:__h,Fragment:__Fragment}=require(${JSON.stringify(path.join(__dirname,'review-renderer.cjs'))});\n`;
  module._compile(prefix+output.outputText,filename);
 };
}
module.exports={ts,register};
