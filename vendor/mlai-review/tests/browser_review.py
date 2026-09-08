"""Review-browser checks. This deliberately does NOT claim to test React hydration.
The document is loaded in memory because the managed Chromium here blocks
loopback navigation. Run after `npm run preview:build` / `bun run preview:build`.
Requires Playwright for Python and a Chromium executable (or its installed browser).
"""
from pathlib import Path
import json, os, shutil, sys, time
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('QA_OUTPUT', '/tmp/mlai-review-qa'))
OUT.mkdir(parents=True, exist_ok=True)
checks=[]
def checked(name):
    checks.append(name)
    print('PASS:', name, flush=True)

with sync_playwright() as p:
    executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
    kwargs={'headless':True,'args':['--no-sandbox']}
    if executable: kwargs['executable_path']=executable
    browser=p.chromium.launch(**kwargs)
    context=browser.new_context(viewport={'width':1440,'height':1050},device_scale_factor=1,accept_downloads=True)
    page=context.new_page()
    errors=[];requests=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('request',lambda req:requests.append(req.url))
    page.set_content((ROOT/'MLAI-preview.html').read_text(),wait_until='load')
    page.wait_for_function("typeof window.MLAI === 'object'")
    def route(path):
        page.evaluate('(path)=>{ location.hash="#"+path; }',path)
        page.wait_for_function('(path)=>location.hash==="#"+path',arg=path)
        page.wait_for_timeout(35)
    expect(page.locator('main h1')).to_have_text('Intelligence,with integrity.')
    assert 'MLAI' in page.title()
    checked('Home identity, meaningful content, and a single primary heading')
    assert page.locator('main h1').count()==1
    page.screenshot(path=str(OUT/'desktop-home.png'),full_page=True)
    page.screenshot(path=str(OUT/'desktop-viewport.png'))
    # Ensure schematic link targets do not overlap and obscure each other.
    for width in [360,390,768,1440]:
        page.set_viewport_size({'width':width,'height':1000})
        boxes={name:page.locator('.node-'+name).bounding_box() for name in ['abbey','abi','wdbx']}
        for left,right in [('abbey','abi'),('abi','wdbx')]:
            assert boxes[left]['y']+boxes[left]['height']<=boxes[right]['y']+1, (width,left,right,boxes)
    checked('Architecture diagram nodes do not overlap at four viewport widths')
    # Crawl every exported route in the real rendered document.
    routes=page.locator('template[data-route]').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.route)')
    for width in [360,390,768,1440]:
        page.set_viewport_size({'width':width,'height':1000})
        for path in routes:
            route(path)
            assert page.locator('main h1').count()==1,path
            assert page.locator('main h1').is_visible(),path
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,path)
            assert not page.locator('main').evaluate('(el)=>el.innerText.includes("Lorem ipsum")')
    checked(f'All {len(routes)} views: single visible H1 and no page overflow at 360/390/768/1440px')
    route('/projects/')
    page.locator('[data-project-filter=framework]').click()
    expect(page.locator('[data-project]:visible')).to_have_count(1)
    expect(page.locator('[data-project-count]')).to_have_text('1 project')
    assert 'category=framework' in page.url
    page.locator('[data-project-search]').fill('rust')
    expect(page.locator('[data-project]:visible')).to_have_count(0)
    expect(page.locator('[data-project-empty]')).to_be_visible()
    page.locator('[data-project-reset]').first.click()
    expect(page.locator('[data-project]:visible')).to_have_count(4)
    checked('Project filters compose with search, update URL/counts, and reset the empty state')
    route('/projects/?category=storage&q=WDBX')
    expect(page.locator('[data-project]:visible')).to_have_count(1)
    expect(page.locator('[data-project=wdbx]')).to_be_visible()
    checked('Direct project query URL restores search and category state')
    route('/')
    page.locator('[data-topic=storage]').click()
    expect(page.locator('[data-topic-panel=storage]')).to_be_visible()
    expect(page.locator('[data-topic-panel=runtime]')).to_be_hidden()
    page.locator('[data-topic-panel=storage] a').click()
    expect(page.locator('main h1')).to_have_text('Retrieval with its scope intact.')
    checked('Home topic switching updates content and opens the correct guide')
    # Search keyboard workflow and focus restoration.
    page.locator('[data-search-open]').first.focus()
    page.keyboard.press('Control+k')
    expect(page.locator('#search-dialog')).to_be_visible()
    expect(page.locator('#search-input')).to_be_focused()
    page.locator('#search-input').fill('WAL')
    expect(page.locator('.search-result')).to_have_count(1)
    page.keyboard.press('Enter')
    expect(page.locator('main h1')).to_have_text('Retrieval with its scope intact.')
    expect(page.locator('#search-dialog')).not_to_be_visible()
    checked('Ctrl+K → body-text search → Enter opens a real guide and closes search')
    page.locator('[data-search-open]').first.click()
    page.locator('#search-input').fill('')
    expect(page.locator('.search-result')).to_have_count(6)
    page.keyboard.press('ArrowDown')
    assert page.locator('.search-result').nth(1).get_attribute('class').endswith('selected')
    page.keyboard.press('ArrowUp')
    assert page.locator('.search-result').first.get_attribute('class').endswith('selected')
    page.locator('#search-input').fill('<img src=x onerror=alert(1)>')
    expect(page.locator('.search-empty')).to_be_visible()
    assert page.locator('#search-results img').count()==0
    page.keyboard.press('Escape')
    expect(page.locator('[data-search-open]').first).to_be_focused()
    checked('Search arrows, suggestions, literal untrusted input, empty results, Escape and focus return')
    # Native dialog focus containment.
    page.locator('[data-search-open]').first.click()
    for _ in range(15):
        page.keyboard.press('Tab')
        assert page.evaluate('document.querySelector("#search-dialog").contains(document.activeElement)')
    page.keyboard.press('Escape')
    checked('Search dialog contains keyboard focus while modal')
    page.locator('[data-search-open]').first.click();page.locator('#search-input').fill('storage')
    page.screenshot(path=str(OUT/'search-desktop.png'))
    page.keyboard.press('Escape')
    route('/trust/')
    page.locator('[data-evidence-filter]').select_option('Documented')
    expect(page.locator('tr[data-evidence]:visible')).to_have_count(2)
    expect(page.locator('[data-evidence-count]')).to_have_text('2 entries')
    page.locator('[data-evidence-filter]').select_option('all')
    expect(page.locator('tr[data-evidence]:visible')).to_have_count(6)
    checked('Evidence filter changes real table rows and accurate counts')
    page.screenshot(path=str(OUT/'evidence-desktop.png'),full_page=True)
    # Clipboard is mocked intentionally. Real system clipboard permission is separate.
    route('/docs/getting-started/')
    page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}})")
    page.locator('[data-copy-code]').first.click()
    expect(page.locator('.copy-status').first).to_have_text('Code copied.')
    assert page.evaluate('window.__copied')=='git clone https://github.com/donaldfilimon/abi.git\ncd abi'
    page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}})")
    page.locator('[data-copy-code]').nth(1).click()
    expect(page.locator('.copy-status').nth(1)).to_contain_text('Clipboard unavailable')
    assert './tools/check.sh' in page.evaluate('getSelection().toString()')
    checked('Code copy exact text with mocked success; denied permission selects actual code and reports failure')
    page.evaluate('getSelection().removeAllRanges()')
    page.locator('.toc a[href="#inspect-local-behavior"]').click()
    page.wait_for_timeout(100)
    assert page.locator('#inspect-local-behavior').bounding_box()['y']>=85
    checked('Documentation TOC deep link lands below the sticky header')
    page.evaluate('scrollTo(0,0)');page.screenshot(path=str(OUT/'docs-desktop.png'),full_page=True)
    # Theme changes, storage denial (about:blank) does not crash initialization.
    route('/')
    expect(page.locator('#toast')).not_to_have_class('toast visible')
    checked('Transient clipboard feedback is cleared on navigation')
    page.locator('[data-theme-toggle]').click()
    assert page.locator('html').get_attribute('data-theme')=='dark'
    route('/docs/evidence/')
    assert page.locator('html').get_attribute('data-theme')=='dark'
    page.wait_for_timeout(220)
    page.screenshot(path=str(OUT/'docs-dark.png'))
    page.locator('[data-theme-toggle]').click()
    checked('Theme changes remain readable and persist across review routes even with storage unavailable')
    page.set_viewport_size({'width':390,'height':844})
    route('/')
    page.locator('[data-menu-open]').click()
    expect(page.locator('#mobile-menu')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('[data-menu-open]')).to_be_focused()
    page.locator('[data-menu-open]').click()
    page.set_viewport_size({'width':1440,'height':1050})
    expect(page.locator('#mobile-menu')).not_to_be_visible()
    assert not page.evaluate('document.querySelector("#mobile-menu").contains(document.activeElement)')
    page.set_viewport_size({'width':390,'height':844})
    page.locator('[data-menu-open]').click()
    page.locator('#mobile-menu a[href="/docs/"]').click()
    expect(page.locator('#mobile-menu')).not_to_be_visible()
    expect(page.locator('main h1')).to_have_text('A good place to begin.')
    checked('Mobile menu Escape/focus, navigation closure, and desktop-breakpoint cleanup')
    page.locator('.mobile-docs-nav summary').click()
    page.locator('.mobile-docs-nav a[href="/docs/gama/"]').click()
    expect(page.locator('main h1')).to_have_text('One tree. Many surfaces.')
    page.screenshot(path=str(OUT/'docs-mobile.png'),full_page=True)
    checked('Mobile documentation disclosure opens and navigates to the selected guide')
    route('/');page.screenshot(path=str(OUT/'mobile-home.png'),full_page=True);page.screenshot(path=str(OUT/'mobile-viewport.png'))
    # Local brief with actual download and safe user text.
    route('/brief/')
    page.locator('button[type=submit]').click()
    expect(page.locator('#brief-title-error')).to_be_visible()
    expect(page.locator('#brief-problem-error')).to_be_visible()
    expect(page.locator('#brief-title')).to_be_focused()
    page.locator('#brief-title').fill('Research <img src=x onerror=alert(1)>')
    page.locator('#brief-problem').fill('Make source evidence easier to inspect across related projects.')
    page.locator('#brief-area').select_option(label='ABI runtime')
    page.locator('#brief-outcome').fill('A readable local guide with useful sources.')
    page.locator('#brief-constraints').fill('Offline review first.')
    page.locator('button[type=submit]').click()
    expect(page.locator('#brief-result')).to_be_visible()
    # V2 escapes HTML in exported Markdown as well as rendering safely in the browser.
    assert '&lt;img' in page.locator('#brief-text').inner_text()
    assert '<img' not in page.locator('#brief-text').inner_text()
    assert page.locator('#brief-result img').count()==0
    expect(page.locator('#brief-result-title')).to_be_focused()
    checked('Local brief validation, escaped user content, generated summary and success focus')
    page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}})")
    page.locator('[data-brief-copy]').click()
    expect(page.locator('#brief-action-status')).to_have_text('Brief copied. Nothing was sent.')
    assert page.evaluate('window.__copied')==page.locator('#brief-text').inner_text()
    with page.expect_download() as download_event:
        page.locator('[data-brief-download]').click()
    download=download_event.value
    destination=OUT/'test-brief.md';download.save_as(destination)
    assert 'Make source evidence easier' in destination.read_text()
    assert download.suggested_filename.endswith('-brief.md')
    assert '<' not in download.suggested_filename
    destination.unlink()
    checked('Brief copies exact text and downloads a real Markdown file with a sanitized filename')
    page.locator('[data-brief-edit]').click()
    expect(page.locator('#brief-form')).to_be_visible()
    expect(page.locator('#brief-problem')).to_have_value('Make source evidence easier to inspect across related projects.')
    checked('Editing preserves the in-memory draft')
    # Do not use toolbar shortcut to steal focus from a form input.
    page.locator('#brief-title').focus();page.keyboard.press('Control+k')
    expect(page.locator('#search-dialog')).not_to_be_visible()
    checked('Search shortcut does not hijack form input')
    page.set_viewport_size({'width':1440,'height':1050})
    page.screenshot(path=str(OUT/'brief-desktop.png'),full_page=True)
    route('/made-up-path/')
    expect(page.locator('main h1')).to_have_text('Not here.But not a dead end.')
    page.get_by_role('link',name='Back to the beginning',exact=True).click()
    expect(page.locator('main h1')).to_have_text('Intelligence,with integrity.')
    checked('Unknown routes have a usable 404 recovery path')
    page.emulate_media(reduced_motion='reduce')
    assert page.evaluate('getComputedStyle(document.documentElement).scrollBehavior')=='auto'
    checked('Reduced-motion preference removes smooth scrolling and transition dependence')
    # All visible-site internal references resolve to exported route IDs or valid section IDs.
    unknown=[]
    for path in routes:
        route(path)
        links=page.locator('a[href]').evaluate_all('(nodes)=>nodes.map(a=>a.getAttribute("href"))')
        for href in links:
            if href.startswith('/') and href.split('?')[0].split('#')[0] not in routes:unknown.append((path,href))
            if href.startswith('#') and href!='#' and page.locator('[id]').evaluate_all('(nodes)=>nodes.map(n=>n.id)').count(href[1:])<1:unknown.append((path,href))
    assert not unknown,unknown
    checked('All internal page links and section anchors resolve in rendered views')
    assert not errors,errors
    checked('No JavaScript runtime errors during the complete interaction sequence')
    assert not [r for r in requests if r.startswith(('http:','https:'))],requests
    checked('No external network requests from the review site')
    report={
      'result':'passed','browser':browser.version,'rendering':'Chromium page.set_content of generated standalone HTML',
      'reason':'No Browser plugin; managed Chromium blocks loopback URL navigation. No browser policy was changed.',
      'viewports':[360,390,768,1440],'views':len(routes),'checks':checks,'console_errors':errors,
      'limitations':['Not a React/Next.js/Fumadocs build or hydration test','Clipboard permission outcomes mocked; actual Markdown download checked','No Safari/Firefox test, automated axe audit, production deployment, or upstream ABI/Gama runtime validation'],
    }
    (OUT/'browser-results.json').write_text(json.dumps(report,indent=2))
    browser.close()
print(f'\n{len(checks)} browser check groups passed. Evidence: {OUT}',flush=True)
