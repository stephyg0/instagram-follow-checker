const fs=require('node:fs'), vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const elements=new Map();
function element(){return {hidden:true,value:'',textContent:'',children:[],style:{},classList:{add(){},remove(){}},addEventListener(){},setAttribute(){},replaceChildren(...c){this.children=c;},append(...c){this.children.push(...c)},focus(){}};}
const registered=[];
const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,modelContext:{registerTool(t){registered.push(t)}}};
// The HTML fixture shim supplies anchor attributes; browser DOMParser itself is not emulated or tested.
class DOMParser {parseFromString(text){return {querySelectorAll(){return [...text.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>({getAttribute(){return m[1]}}))}}}}
const context=vm.createContext({document,window:{addEventListener(){}},URL,DOMParser,TextDecoder,DecompressionStream,Uint8Array,Uint32Array,DataView,Blob,File,setTimeout,console});
const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(source);vm.runInContext(source,context);
function file(p){return new File([fs.readFileSync(p)],path.basename(p));}
function evaluate(code){return vm.runInContext(code,context)}
async function run(files){context.selected=files;await evaluate('run(selected)');}
const base=path.join(__dirname,'fixtures');
(async()=>{
 await run(fs.readdirSync(path.join(base,'batch')).sort().map(n=>file(path.join(base,'batch',n))));
 assert.equal(document.getElementById('results').hidden,false);
 assert.equal(document.getElementById('followersCount').textContent,'33');
 assert.equal(document.getElementById('followingCount').textContent,'4');
 assert.equal(document.getElementById('missingCount').textContent,'2');
 assert.deepEqual(Array.from(evaluate('accounts')),['another.one','not_mutual']);
 console.log('PASS 34 ZIPs: deflate, media skipping, duplicate normalization, new following schema, exact difference');
 assert.equal(registered.length,1);registered[0].execute({query:'another'});assert.equal(document.getElementById('list').children.length,1);
 assert.throws(()=>registered[0].execute({query:17}));
 console.log('PASS shared search action and WebMCP valid/invalid inputs in a mocked registry');
 await run([file(path.join(base,'zip64.zip'))]);assert.equal(document.getElementById('error').hidden,true);assert.equal(document.getElementById('missingCount').textContent,'1');console.log('PASS ZIP64 with 65,538 entries and forced local ZIP64 header');
 await run([file(path.join(base,'empty.zip'))]);assert.equal(document.getElementById('error').hidden,true);assert.equal(document.getElementById('missingCount').textContent,'0');console.log('PASS valid empty JSON lists');
 await run([file(path.join(base,'html.zip'))]);assert.equal(document.getElementById('missingCount').textContent,'1');assert.equal(document.getElementById('error').hidden,true);console.log('PASS HTML href extraction with parser shim');
 await run([file(path.join(base,'corrupt.zip')),file(path.join(base,'batch/export-33.zip'))]);assert.equal(document.getElementById('results').hidden,true);assert.match(evaluate('auditLines.join(" ")'),/checksum failed/);console.log('PASS corrupt CRC prevents partial results');
 await run([file(path.join(base,'split.zip'))]);assert.equal(document.getElementById('results').hidden,true);assert.match(evaluate('auditLines.join(" ")'),/Split ZIP/);console.log('PASS true split ZIP rejected with extraction instructions');
 await run([file(path.join(base,'batch/export-01.zip'))]);assert.match(document.getElementById('error').textContent,/following files/);console.log('PASS missing following list prevents comparison');
 await run([new File(['invalid'],'followers_1.json'),new File(['{"relationships_following":[]}'],'following.json')]);assert.equal(document.getElementById('results').hidden,true);console.log('PASS malformed JSON prevents partial results');
 context.selected=fs.readdirSync(path.join(base,'batch')).map(n=>file(path.join(base,'batch',n)));const pending=evaluate('run(selected)');evaluate('cancelled=true');await pending;assert.equal(document.getElementById('results').hidden,true);assert.match(document.getElementById('error').textContent,/cancelled/);console.log('PASS cancellation hides partial results');
 assert.equal(evaluate('fromURL("https://instagram.com.evil.test/user/")'),null);assert.equal(evaluate('normalize("<script>")'),null);console.log('PASS account URL and username validation');
})().catch(e=>{console.error(e);process.exitCode=1});
