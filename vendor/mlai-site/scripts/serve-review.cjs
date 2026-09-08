const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../review');const port=Number(process.env.PORT||8765);
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Invalid request');return;}
 let target=path.resolve(root,'.'+pathname);
 if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);res.end('Forbidden');return;}
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 let status=200;if(!fs.existsSync(target)||!fs.statSync(target).isFile()){target=path.join(root,'404.html');status=404;}
 res.writeHead(status,{'Content-Type':target.endsWith('.json')?'application/json; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});fs.createReadStream(target).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Review only: http://127.0.0.1:${port}`));
