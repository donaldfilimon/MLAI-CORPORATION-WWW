// A deterministic HTML serializer for this review's pure TSX components.
// Not a React renderer, hydration shim, or framework runtime.
const Fragment=Symbol('fragment');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function h(tag,props,...children){return{tag,props:props||{},children:children.flat(Infinity)}}
const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const booleans=new Set(['hidden','disabled','required','multiple','checked','selected','open','autofocus','readOnly','noValidate']);
const names={className:'class',htmlFor:'for',tabIndex:'tabindex',autoFocus:'autofocus',readOnly:'readonly',noValidate:'novalidate',strokeWidth:'stroke-width',strokeLinecap:'stroke-linecap',strokeLinejoin:'stroke-linejoin',fillRule:'fill-rule',clipRule:'clip-rule'};
function render(node){
 if(node==null||typeof node==='boolean')return '';
 if(Array.isArray(node))return node.map(render).join('');
 if(typeof node!=='object')return escape(node);
 if(typeof node.tag==='function')return render(node.tag({...node.props,children:node.children}));
 if(node.tag===Fragment)return render(node.children);
 let attrs='';
 for(let [k,v] of Object.entries(node.props)){
  if(k==='children'||k==='key'||v==null||typeof v==='function')continue;
  if(k==='dangerouslySetInnerHTML')throw Error('Raw markup is not allowed in review components');
  if(k==='defaultValue') k='value';
  if(k==='style')v=Object.entries(v).map(([p,x])=>`${p.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${x}`).join(';');
  if(booleans.has(k)){if(v)attrs+=' '+(names[k]||k);continue;}
  attrs+=` ${names[k]||k}="${escape(v)}"`;
 }
 return `<${node.tag}${attrs}>`+(voids.has(node.tag)?'':render(node.children)+`</${node.tag}>`);
}
module.exports={h,Fragment,render,escape};
