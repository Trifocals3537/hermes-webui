// Isolated composer check: real markup, styles and functions, with synthetic state.
// No server, credentials, model requests or saved conversations are used.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const output = process.env.COMPOSER_ARTIFACT_DIR;
if (!output) throw new Error('Set COMPOSER_ARTIFACT_DIR to a disposable output folder.');
fs.mkdirSync(output, {recursive:true});
const before = process.env.COMPOSER_BEFORE_REF;
const read = (name, ref) => ref
  ? execFileSync('git', ['show', `${ref}:${name}`], {cwd:root, encoding:'utf8', maxBuffer:8*1024*1024})
  : fs.readFileSync(path.join(root, name), 'utf8');
function extract(source, name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, 'm'));
  assert.ok(start >= 0, name);
  const rest = source.slice(start + 1);
  const end = rest.search(/^(?:async )?function \w+\(/m);
  return source.slice(start, end < 0 ? undefined : start + 1 + end);
}

(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {})});
  const results = [];
  try {
    for (const [label, ref] of [...(before ? [['before', before]] : []), ['after', null]]) {
      const ui = read('static/ui.js', ref);
      const functions = ['getComposerPrimaryAction', '_applyBusyComposerPlaceholder',
        '_setComposerPrimaryButtonIcon', 'updateSendBtn'].map(name => extract(ui, name)).join('\n')
        + '\n' + extract(read('static/messages.js', ref), 'send');
      for (const width of [1440, 900, 390]) {
        for (const theme of ['light', 'dark']) {
          const page = await browser.newPage({viewport:{width, height:700}, isMobile:width===390, hasTouch:width===390});
          await page.route('**/*', route => route.abort());
          await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>');
          await page.evaluate(({html, theme}) => {
            const parsed = new DOMParser().parseFromString(html, 'text/html');
            document.documentElement.classList.toggle('dark', theme==='dark');
            document.body.innerHTML = '<main style="width:calc(100% - 32px);max-width:780px;margin:80px auto"><h2>Desktop conversation</h2><p>Example conversation for a layout check.</p>'
              + parsed.getElementById('composerBox').outerHTML + '</main>';
          }, {html:read('static/index.html', ref), theme});
          await page.addStyleTag({content:read('static/style.css', ref)});
          await page.addScriptTag({content:`
            const S={session:{},busy:false,activeStreamId:null,pendingFiles:[]};
            const $=id=>document.getElementById(id);
            let _compressionPlaceholderSaved=null;
            const assistantDisplayName=()=> 'Hermes';
            const _composerHasContent=()=>!!$('msg').value;
            const _getExplicitBusyCommandAction=()=>null;
            const showToast=(text,duration)=>window.lastToast={text,duration};
            ${functions}
          `});
          await page.evaluate(label => {
            S.session={chat_read_only_reason:label==='before'
              ? "This conversation belongs to another Hermes client. Continuing it requires WebUI's local Gateway session connection. Continue in the original client or configure webui_gateway_session_transport: local."
              : 'Read-only in WebUI. Continue in Desktop.',chat_read_only_can_connect:true};
            updateSendBtn();
          }, label);
          const box = page.locator('#composerBox');
          await box.screenshot({path:path.join(output, `${label}-${width}-${theme}.png`)});
          const metrics = await page.evaluate(() => {
            const notice=$('composerChatReadOnlyNotice')||$('composerChatReadOnlyReason');
            const rect=notice.getBoundingClientRect();
            return {noticeHeight:rect.height, placeholder:$('msg').placeholder,
              readOnly:$('msg').readOnly,sendDisabled:$('btnSend').disabled,
              fits:rect.left>=0&&rect.right<=innerWidth,
              help:$('composerChatReadOnlyHelp')?.getAttribute('href')};
          });
          assert.ok(metrics.fits);
          assert.ok(metrics.readOnly && metrics.sendDisabled);
          if(label==='after') {
            assert.equal(metrics.placeholder, 'Read-only in WebUI');
            assert.ok(metrics.noticeHeight<=44, JSON.stringify({width,theme,...metrics}));
            assert.ok(metrics.help.endsWith('#gateway-session-connection'));
            await page.locator('#msg').focus();
            await page.keyboard.type('must not be entered');
            assert.equal(await page.locator('#msg').inputValue(), '');
            await page.evaluate(async () => {
              $('msg').value='keep this draft';
              await send();
            });
            assert.equal(await page.locator('#msg').inputValue(), 'keep this draft');
            assert.equal(await page.evaluate(()=>lastToast.duration),3000);
            await page.evaluate(() => {
              S.busy=true;S.activeStreamId='test-stream';updateSendBtn();
            });
            assert.equal(await page.locator('#btnSend').getAttribute('data-action'),'stop');
            await page.evaluate(() => {
              S.busy=false;S.activeStreamId=null;
              S.session={chat_read_only_reason:'Read-only in WebUI.'};updateSendBtn();
            });
            assert.ok(await page.locator('#composerChatReadOnlyHelp').isHidden());
            await page.evaluate(() => {S.session={session_source:'webui'};updateSendBtn();});
            assert.equal(await page.locator('#msg').getAttribute('placeholder'),'Message Hermes…');
            assert.equal(await page.locator('#msg').inputValue(),'keep this draft');
            assert.equal(await page.locator('#msg').evaluate(el=>el.readOnly),false);
            assert.ok(await page.locator('#composerChatReadOnlyNotice').isHidden());
          }
          results.push({label,width,theme,...metrics});
          await page.close();
        }
      }
    }
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify(results));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
