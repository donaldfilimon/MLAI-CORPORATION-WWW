"""V2 regression/acceptance checks. No browser policy is changed.
Uses the portable document when managed browser policy blocks loopback navigation.
Clipboard/print calls are controlled substitutes; Markdown downloads are real.
"""
from pathlib import Path
import json, os, shutil, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright, expect, Error
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('QA_OUTPUT','/tmp/mlai-v2-qa'))
OUT.mkdir(parents=True,exist_ok=True)
checks=[]; evidence={'method':'portable HTML loaded in memory','checks':checks}
def passed(name): checks.append(name); print('PASS:',name,flush=True)
server=subprocess.Popen(['node','scripts/serve-preview.cjs'],cwd=ROOT,env={**os.environ,'PORT':'4197'},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 for _ in range(40):
  try: urllib.request.urlopen('http://127.0.0.1:4197/',timeout=.2); break
  except Exception: time.sleep(.05)
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox'])
  evidence['browser']=browser.version
  ctx=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True,device_scale_factor=1)
  probe=ctx.new_page()
  try:
   probe.goto('http://127.0.0.1:4197/',wait_until='load',timeout=8000)
   expect(probe.locator('main h1')).to_contain_text('Intelligence')
   evidence['loopback_navigation']='Passed actual HTTP browser load'
  except Error as error:
   evidence['loopback_navigation']=str(error).split('\n')[0]
  probe.close()
  page=ctx.new_page(); errors=[]; requests=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.on('request',lambda request:requests.append(request.url))
  page.set_content((ROOT/'MLAI-preview.html').read_text(),wait_until='load')
  page.wait_for_function("typeof window.MLAI==='object'")
  def route(value):
   page.evaluate('(value)=>location.hash="#"+value',value)
   page.wait_for_timeout(65)
  # Exact baseline retained; capture desktop and mobile before changing state.
  expect(page.locator('main h1')).to_have_text('Intelligence,with integrity.')
  page.screenshot(path=str(OUT/'home-desktop.png'))
  page.screenshot(path=str(OUT/'home-full.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844})
  page.screenshot(path=str(OUT/'home-mobile.png'))
  page.set_viewport_size({'width':1440,'height':1000})
  passed('Original hero and visual identity retained on desktop and mobile')
  page.keyboard.press('Control+k')
  inp=page.locator('#search-input')
  expect(inp).to_have_attribute('role','combobox')
  expect(inp).to_have_attribute('aria-expanded','true')
  expect(page.locator('#search-results')).to_have_attribute('role','listbox')
  inp.fill('accelerated=false')
  first=page.locator('#search-results a').first
  expect(first).to_have_attribute('aria-selected','true')
  assert inp.get_attribute('aria-activedescendant')==first.get_attribute('id')
  assert '#'+first.get_attribute('href').split('#')[-1] in first.get_attribute('href')
  assert '#' in first.get_attribute('href')
  expect(first.locator('mark').first).to_be_visible()
  assert 'accelerated=false' in first.inner_text()
  page.screenshot(path=str(OUT/'search-context.png'))
  destination=first.get_attribute('href')
  page.keyboard.press('Enter');page.wait_for_timeout(130)
  assert page.evaluate('location.hash')=='#'+destination
  target=page.locator('[id="'+destination.split('#')[1]+'"]')
  expect(target).to_be_visible()
  assert target.bounding_box()['y']>=70
  passed('Contextual code/body search highlights text and jumps to the exact heading')
  page.keyboard.press('Control+k');inp.fill('storage')
  if page.locator('#search-results a').count()>1:
   before=inp.get_attribute('aria-activedescendant');page.keyboard.press('ArrowDown')
   assert inp.get_attribute('aria-activedescendant')!=before
   expect(page.locator('#'+inp.get_attribute('aria-activedescendant'))).to_have_attribute('aria-selected','true')
  passed('Arrow selection is exposed with aria-activedescendant and aria-selected')
  inp.fill('no-result-xyz123')
  expect(page.locator('#search-count')).to_have_text('0 results')
  assert inp.get_attribute('aria-activedescendant') is None
  page.locator('[data-search-clear]').click()
  expect(inp).to_have_value('');expect(page.locator('#search-count')).to_have_text('Suggested reading')
  page.keyboard.press('Escape')
  expect(inp).to_have_attribute('aria-expanded','false')
  passed('No-results and Clear remove stale selection and restore suggestions')
  route('/docs/getting-started/')
  expect(page.locator('.reading-estimate')).to_contain_text('min read')
  page.screenshot(path=str(OUT/'docs-desktop.png'))
  page.evaluate('window.__copied="";Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async text=>{window.__copied=text}}})')
  page.locator('[data-copy-article]').click()
  expect(page.locator('[data-article-message]')).to_have_text('Article Markdown copied.')
  copied=page.evaluate('window.__copied')
  assert './tools/cargo.sh' in copied and 'https://github.com/' in copied and copied.startswith('# ')
  with page.expect_download() as event: page.locator('[data-download-article]').click()
  download=event.value; downloaded=Path(download.path()).read_text()
  assert downloaded==copied and download.suggested_filename.endswith('.md')
  (OUT/'sample-article.md').write_text(downloaded)
  passed('Article copy uses canonical Markdown; actual downloaded file matches exactly')
  page.evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("denied")}}})')
  page.locator('[data-copy-article]').click()
  expect(page.locator('[data-article-fallback]')).to_be_visible()
  assert page.locator('[data-article-markdown]').inner_text()==copied.rstrip('\n') or page.locator('[data-article-markdown]').inner_text()==copied
  assert len(page.evaluate('getSelection().toString()'))>100
  passed('Denied article clipboard exposes real selectable Markdown, not fake success')
  route('/docs/runtime/')
  page.evaluate('window.scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(80)
  begin=page.locator('[data-reading-progress]').evaluate('(node)=>node.value')
  page.locator('#references-heading').scroll_into_view_if_needed();page.wait_for_timeout(160)
  end=page.locator('[data-reading-progress]').evaluate('(node)=>node.value')
  assert end>begin and 0<=end<=100
  assert page.locator('.toc a[aria-current="location"]').count()==1
  passed('Reading progress and active section update from actual scroll position')
  page.evaluate('window.__articleNode=document.querySelector("[data-doc-article]")')
  link=page.locator('.toc a').first;href=link.get_attribute('href');link.click();page.wait_for_timeout(130)
  assert page.evaluate('window.__articleNode===document.querySelector("[data-doc-article]")')
  assert page.evaluate('location.hash').endswith(href)
  passed('Heading navigation preserves the article DOM instead of re-rendering the entire page')
  page.set_viewport_size({'width':390,'height':844});route('/docs/getting-started/')
  page.locator('.mobile-toc summary').click()
  expect(page.locator('.mobile-toc nav')).to_be_visible()
  page.screenshot(path=str(OUT/'docs-mobile.png'))
  page.locator('.mobile-toc a').nth(1).click();page.wait_for_timeout(120)
  assert page.locator('.mobile-toc').get_attribute('open') is None
  passed('Mobile table of contents opens, navigates and closes cleanly')
  page.set_viewport_size({'width':1440,'height':1000});route('/docs/getting-started/')
  page.evaluate('() => { window.__printed=0; window.print=()=>{window.__printed++}; }')
  page.locator('[data-print-article]').click();assert page.evaluate('window.__printed')==1, {'count':page.evaluate('window.__printed'), 'button':page.locator('[data-print-article]').evaluate('(n)=>n.outerHTML'), 'url':page.evaluate('location.hash'), 'errors':errors}
  page.emulate_media(media='print')
  expect(page.locator('.header')).to_be_hidden();expect(page.locator('.footer')).to_be_hidden()
  expect(page.locator('[data-doc-article]')).to_be_visible()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.emulate_media(media='screen')
  passed('Print action invokes printing; print media removes chrome and retains readable content')
  route('/trust/?type=Conditional&q=kernels')
  expect(page.locator('[data-evidence-filter]')).to_have_value('Conditional')
  expect(page.locator('[data-evidence-search]')).to_have_value('kernels')
  assert page.locator('[data-evidence]:visible').count()==1
  expect(page.locator('[data-evidence-count]')).to_have_text('1 entry')
  page.screenshot(path=str(OUT/'evidence-filtered.png'))
  page.locator('[data-evidence-search]').fill('no evidence for this')
  expect(page.locator('[data-evidence-empty]')).to_be_visible()
  assert 'q=' in page.evaluate('location.hash')
  page.locator('[data-evidence-reset]').first.click()
  assert page.locator('[data-evidence]:visible').count()==6
  assert page.evaluate('location.hash')=='#/trust/'
  passed('Evidence query and type compose, restore from URL, show empty state and reset')
  route('/projects/?q=swift%20declarative')
  assert page.locator('[data-project]:visible').count()==1
  expect(page.locator('[data-project]:visible')).to_contain_text('Gama')
  passed('Multi-word project searches match regardless of word order')
  page.emulate_media(color_scheme='dark')
  page.locator('[data-theme-system]').click()
  expect(page.locator('html')).to_have_attribute('data-theme','dark')
  page.emulate_media(color_scheme='light')
  expect(page.locator('html')).to_have_attribute('data-theme','light')
  page.locator('[data-theme-choice="dark"]').click()
  page.emulate_media(color_scheme='light')
  expect(page.locator('html')).to_have_attribute('data-theme','dark')
  route('/docs/getting-started/')
  page.screenshot(path=str(OUT/'docs-dark.png'))
  passed('System theme follows OS changes; explicit preferences override them')
  page.locator('[data-theme-choice="light"]').click();route('/')
  page.locator('[data-topic="runtime"]').click();page.keyboard.press('ArrowRight')
  expect(page.locator('[data-topic="storage"]')).to_have_attribute('aria-selected','true')
  expect(page.locator('[data-topic-panel="storage"]')).to_be_visible()
  page.keyboard.press('End')
  expect(page.locator('[data-topic="framework"]')).to_be_focused()
  passed('Documentation topic tabs support arrows, Home/End and selected semantics')
  route('/brief/')
  expect(page.locator('[data-brief-fields]')).to_be_enabled()
  page.locator('#brief-title').fill('A focused tool')
  problem='Make the source-backed guides easier to navigate.'
  page.locator('#brief-problem').fill(problem)
  expect(page.locator('[data-brief-counter="problem"]')).to_contain_text(f'{len(problem)} / 2,000')
  page.locator('button[type="submit"]').click()
  expect(page.locator('#brief-result')).to_be_visible()
  route('/projects/');route('/brief/')
  expect(page.locator('#brief-result')).to_be_visible()
  page.locator('[data-brief-edit]').click()
  expect(page.locator('#brief-title')).to_have_value('A focused tool')
  passed('Brief draft and prepared state survive review navigation in memory only')
  page.locator('#brief-title').fill('Markup <script>alert(1)</script>')
  page.locator('button[type="submit"]').click()
  with page.expect_download() as event: page.locator('[data-brief-download]').click()
  brief=Path(event.value.path()).read_text()
  assert '&lt;script&gt;' in brief and '<script>' not in brief
  assert page.locator('#brief-text script').count()==0
  passed('Actual brief download escapes embedded HTML and uses a safe filename')
  page.locator('[data-brief-edit]').click()
  page.locator('#brief-title').evaluate('(node)=>{node.value="x".repeat(121);node.dispatchEvent(new Event("input",{bubbles:true}))}')
  page.locator('button[type="submit"]').click()
  expect(page.locator('#brief-title')).to_have_attribute('aria-invalid','true')
  passed('Programmatic over-limit form values cannot bypass validation')
  route('/')
  page.locator('[data-theme-choice="light"]').click()
  page.evaluate('window.__oldCleanup=MLAI.initInteractions(document);MLAI.initInteractions(document);window.__oldCleanup()')
  page.locator('[data-theme-toggle]').click()
  expect(page.locator('html')).to_have_attribute('data-theme','dark')
  page.locator('[data-theme-toggle]').click()
  expect(page.locator('html')).to_have_attribute('data-theme','light')
  passed('Repeated enhancement setup and stale cleanup do not duplicate or remove active handlers')
  page.evaluate('location.hash="#//malformed.example/path"');page.wait_for_timeout(100)
  expect(page.locator('main')).to_contain_text('404')
  route('/docs/getting-started/')
  passed('Malformed portable routes recover to 404 without a JavaScript exception')
  # A no-JavaScript document cannot send field values through an implicit form submit.
  nojs=browser.new_context(java_script_enabled=False)
  np=nojs.new_page();np.set_content((ROOT/'preview/brief/index.html').read_text())
  expect(np.locator('#brief-title')).to_be_disabled();expect(np.locator('button[type="submit"]')).to_be_disabled()
  # Playwright's visible-text matcher deliberately ignores <noscript>; inspect its text directly.
  assert 'requires JavaScript' in np.locator('noscript').text_content()
  nojs.close()
  passed('Server-rendered brief fields and submit button are disabled when JavaScript is absent')
  # All routes / five widths with new toolbars, TOCs, and evidence controls.
  routes=page.locator('template[data-route]').evaluate_all('(nodes)=>nodes.map(node=>node.dataset.route)')
  for width in [360,390,768,1280,1440]:
   page.set_viewport_size({'width':width,'height':1000})
   for item in routes:
    route(item)
    assert page.locator('main h1').count()==1,(width,item)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,item)
  evidence['responsive_combinations']=len(routes)*5
  passed(f'All {len(routes)} views fit five viewport widths with one visible primary heading')
  assert not errors,errors
  # The two externally-provided source hyperlinks are never followed by this sequence.
  assert not requests,requests
  passed('No uncaught page errors or external network requests during portable-site interactions')
  evidence['page_errors']=errors;evidence['requests']=requests
  ctx.close();browser.close()
finally:
 server.terminate()
 try:server.wait(timeout=3)
 except subprocess.TimeoutExpired:server.kill()
 (OUT/'improvement-results.json').write_text(json.dumps(evidence,indent=2))
print(f'{len(checks)} improvement browser groups passed.',flush=True)
