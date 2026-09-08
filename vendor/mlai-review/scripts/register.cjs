/* Review-only TS/TSX loader. This is a serializer input, NOT a React renderer. */
const fs=require('node:fs');const Module=require('node:module');
let ts;for(const name of ['typescript',process.env.TYPESCRIPT_PATH,'/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript']){if(!name)continue;try{ts=require(name);break}catch{}}if(!ts)throw new Error('The source exporter needs TypeScript installed. The checked-in preview runs without it.');
const old=Module._load;const Fragment=Symbol.for('mlai.review.fragment');
Module._load=function(id,...rest){if(id==='react/jsx-runtime')return {jsx:(type,props)=>({type,props:props||{}}),jsxs:(type,props)=>({type,props:props||{}}),Fragment};return old.call(this,id,...rest)};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>{const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;module._compile(code,file)};
exports.ts=ts;exports.Fragment=Fragment;
