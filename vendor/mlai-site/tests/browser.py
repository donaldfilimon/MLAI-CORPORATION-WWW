"""Checks the self-contained HTML review, not React hydration or the Next.js build.

Chromium navigation and clipboard are restricted by this environment's managed
policy. We render the actual self-contained HTML with set_content; no policy is
changed. Normal HTTP route availability is checked separately via urllib.
"""
from pathlib import Path
import json, os, tempfile, shutil
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
QA=Path(os.environ.get('QA_DIR',str(Path(tempfile.gettempdir())/'mlai-qa')));QA.mkdir(parents=True,exist_ok=True)
assert (ROOT/'review/index.html').exists(), 'Review pages are not implemented yet'
HTML=(ROOT/'MLAI-preview.html').read_text()
ROUTES=json.loads((ROOT/'review/manifest.json').read_text())['routes']
results=[];errors=[]
def check(name,fn):
    try:
        fn();results.append({'check':name,'status':'pass'})
    except Exception as e:
        results.append({'check':name,'status':'fail','detail':str(e)[:900]})
def require(value,message):
    assert value,message
with sync_playwright() as p:
    executable=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
    browser=p.chromium.launch(**({'executable_path':executable} if executable else {}),headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1050},accept_downloads=True)
    page=context.new_page();page.set_default_timeout(3000);page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded')
    def go(route):
        page.evaluate('(route)=>{location.hash=route}',route)
        expected=route.split('?')[0]
        if not expected.endswith('/'):expected+='/'
        expected=expected if expected in ROUTES else '/404/'
        page.wait_for_function('(r)=>document.querySelector(".site")?.dataset.route===r',arg=expected)
    check('Page identity, meaningful content, and a single H1',lambda:(require('MLAI' in page.title(),'Wrong title'),require(page.locator('h1').count()==1,'H1 count'),expect(page.locator('h1')).to_contain_text('Intelligence,')))
    check('Architecture selection changes the actual explanation',lambda:(page.locator('[data-map="wdbx"]').click(),expect(page.locator('[data-map-description]')).to_contain_text('Semantic storage'),expect(page.locator('[data-map="wdbx"]')).to_have_attribute('aria-pressed','true')))
    def search_keyboard():
        page.keyboard.press('Control+k');expect(page.locator('#search-dialog')).to_be_visible()
        page.locator('#docs-search').fill('  WAL ')
        expect(page.locator('#search-results')).to_contain_text('WDBX storage')
        page.locator('#docs-search').fill('no-such-article-zz')
        expect(page.locator('#search-results')).to_contain_text('No guides match')
        page.locator('#docs-search').fill('')
        page.keyboard.press('ArrowDown');page.keyboard.press('Enter')
        expect(page.locator('h1')).to_have_text('Getting started')
        require('/docs/getting-started/' in page.url,'Search did not navigate')
    check('Local search: body terms, no results, suggestions, arrows, and Enter navigation',search_keyboard)
    def focus_dialog():
        trigger=page.locator('.search-trigger');trigger.click()
        for _ in range(15):
            page.keyboard.press('Tab')
            require(page.evaluate('document.querySelector("#search-dialog").contains(document.activeElement)'),'Focus escaped the modal')
        page.keyboard.press('Escape')
        expect(page.locator('#search-dialog')).not_to_be_visible()
        require(page.evaluate('document.activeElement.matches(".search-trigger")'),'Trigger focus was not restored')
    check('Search focus containment, Escape, and focus restoration',focus_dialog)
    check('Search treats script-like input as text',lambda:(page.locator('.search-trigger').click(),page.locator('#docs-search').fill('<script>alert(1)</script>'),expect(page.locator('#search-results')).to_contain_text('No guides match'),page.keyboard.press('Escape'),expect(page.locator('#search-dialog')).not_to_be_visible()))
    def copy_failure():
        go('/docs/getting-started/')
        page.locator('[data-copy]').first.click()
        expect(page.locator('.copy-status').first).to_contain_text('Clipboard access is blocked')
        require('git clone' in page.evaluate('getSelection().toString()'),'Fallback did not select the code')
    check('Native restricted clipboard failure shows a usable manual-copy fallback',copy_failure)
    def copy_success_adapter():
        page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async function(text){window.__copied=text;}}})")
        page.locator('[data-copy]').first.click()
        expect(page.locator('.copy-status').first).to_contain_text('Copied to clipboard')
        require('git clone https://github.com/donaldfilimon/abi.git' in page.evaluate('window.__copied'),'Wrong code text')
        page.locator('[data-copy-page]').click()
        expect(page.locator('.page-copy-status')).to_contain_text('Copied to clipboard')
        require('Keep checks scoped' in page.evaluate('window.__copied'),'Incomplete article copy')
    check('Clipboard success branch copies exact code/article text (explicit test adapter)',copy_success_adapter)
    def anchor_and_pagination():
        page.locator('.docs-toc a[href="#use-the-project-wrapper"]').click()
        require('at=use-the-project-wrapper' in page.url,'Anchor state missing')
        box=page.locator('#use-the-project-wrapper').bounding_box()
        require(box['y']>=75,'Heading is obscured by the header')
        page.locator('.doc-pagination a').last.click()
        expect(page.locator('h1')).to_have_text('Project architecture')
        page.go_back()
        expect(page.locator('h1')).to_have_text('Getting started')
    check('Documentation anchors, next/previous paths, and browser Back',anchor_and_pagination)
    def filtering():
        go('/projects/')
        page.locator('[data-category="Framework"]').click()
        expect(page.locator('#project-count')).to_have_text('1 project')
        expect(page.locator('[data-project="gama"]')).to_be_visible()
        require('category=Framework' in page.url,'Filter is not encoded in URL')
        page.locator('#project-search').fill('no-match')
        expect(page.locator('#project-empty')).to_be_visible()
        page.locator('[data-reset-projects]').click()
        expect(page.locator('#project-count')).to_have_text('4 projects')
        go('/projects/?category=Storage&q=semantic')
        expect(page.locator('#project-count')).to_have_text('1 project')
        expect(page.locator('[data-project="wdbx"]')).to_be_visible()
    check('Project filters, query state, empty state, reset, and deep-link restoration',filtering)
    def brief():
        go('/brief/');page.locator('#brief-form [type="submit"]').click()
        expect(page.locator('#error-title')).to_contain_text('at least 3')
        expect(page.locator('#error-goal')).to_contain_text('at least 15')
        page.locator('#brief-title').fill('Storage <script>review</script>')
        page.locator('#brief-area').select_option('WDBX')
        page.locator('#brief-goal').fill('Compare a reproducible retrieval workflow on a local fixture.')
        page.locator('#brief-constraints').fill('No live provider calls or private records.')
        page.locator('#brief-form [type="submit"]').click()
        expect(page.locator('#brief-result')).to_be_visible()
        expect(page.locator('#brief-output')).to_contain_text('<script>review</script>')
        require(page.locator('#brief-output script').count()==0,'User text became HTML')
        page.locator('#brief-copy').click()
        expect(page.locator('#brief-copy-status')).to_contain_text('Copied to clipboard')
        with page.expect_download(timeout=8000) as download_info:page.locator('#brief-download').click()
        download=download_info.value;destination=QA/'downloaded-brief.txt';download.save_as(destination)
        require('No live provider calls' in destination.read_text(),'Download does not contain actual brief')
        require(download.suggested_filename=='storage-script-review-script-brief.txt','Unsafe or unexpected filename')
        page.locator('#brief-goal').fill('Change the goal and regenerate the local project brief.')
        expect(page.locator('#brief-result')).not_to_be_visible()
        page.locator('#brief-form [type="reset"]').click()
        expect(page.locator('#brief-title')).to_have_value('')
    check('Brief validation, safe text, copy adapter, actual download, stale-state invalidation, reset',brief)
    def theme():
        go('/');page.locator('[data-theme-toggle]').first.click()
        expect(page.locator('html')).to_have_attribute('data-theme','dark')
        page.screenshot(path=str(QA/'home-dark.png'),full_page=True,timeout=15000)
        go('/docs/evidence/')
        expect(page.locator('html')).to_have_attribute('data-theme','dark')
        page.locator('[data-theme-toggle]').first.click()
        expect(page.locator('html')).to_have_attribute('data-theme','light')
    check('Theme toggling and session continuity when persistent storage is denied',theme)
    def mobile_menu():
        page.set_viewport_size({'width':390,'height':844});go('/')
        page.locator('[data-open-menu]').click();expect(page.locator('#mobile-menu')).to_be_visible()
        page.keyboard.press('Escape');expect(page.locator('#mobile-menu')).not_to_be_visible()
        require(page.evaluate('document.activeElement.matches("[data-open-menu]")'),'Mobile focus not restored')
        page.locator('[data-open-menu]').click();page.set_viewport_size({'width':1440,'height':1050})
        expect(page.locator('#mobile-menu')).not_to_be_visible()
        require(not page.evaluate('document.body.matches(":has(dialog[open])")'),'Stale scroll lock')
        page.set_viewport_size({'width':390,'height':844})
        page.locator('[data-open-menu]').click();page.locator('#mobile-menu a[href="/projects/"]').click()
        expect(page.locator('h1')).to_have_text('Find your starting point.')
        expect(page.locator('#mobile-menu')).not_to_be_visible()
    check('Mobile menu: Escape, focus return, resize cleanup, and route selection',mobile_menu)
    def all_routes():
        for width in [360,390,768,1280,1440]:
            page.set_viewport_size({'width':width,'height':900})
            for route in ROUTES:
                go(route)
                require(page.locator('h1').count()==1,f'{route}@{width}: H1')
                require(not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),f'{route}@{width}: overflow')
                require(page.locator('main').inner_text().strip(),f'{route}@{width}: blank')
    check('All 18 routes at five widths: meaningful content, one H1, no page overflow',all_routes)
    def reduced_motion():
        page.emulate_media(reduced_motion='reduce');go('/')
        require(page.locator('html').evaluate('(el)=>getComputedStyle(el).scrollBehavior')=='auto','Smooth scrolling ignores reduced motion')
        require(page.locator('.button').first.evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s','Transitions ignore reduced motion')
    check('Reduced-motion disables smooth scrolling and transitions',reduced_motion)
    check('Unknown routes show a working 404 recovery path',lambda:(go('/unknown-route/'),expect(page.locator('h1')).to_contain_text('This path ends here'),page.get_by_role('link',name='Back to home',exact=True).click(),expect(page.locator('h1')).to_contain_text('Intelligence,')))
    # Check the multi-page document mount independently from the single-file router.
    raw=context.new_page();raw.set_content((ROOT/'review/index.html').read_text(),wait_until='domcontentloaded')
    def isolated_theme_control():
        before=raw.locator('html').get_attribute('data-theme')
        raw.locator('[data-map="abbey"]').click()
        require(raw.locator('html').get_attribute('data-theme')==before,'A non-theme click toggled the document theme')
    check('Multi-page enhancement does not attach theme toggle to the root HTML element',isolated_theme_control)
    check('No JavaScript runtime errors during interactive review',lambda:require(not errors,str(errors)))
    page.set_viewport_size({'width':1440,'height':1050});go('/')
    page.evaluate("document.documentElement.dataset.theme='light'")
    page.screenshot(path=str(QA/'home-desktop.png'),full_page=True,timeout=15000)
    page.screenshot(path=str(QA/'home-first-viewport.png'),full_page=False,timeout=15000)
    go('/docs/getting-started/');page.screenshot(path=str(QA/'docs-desktop.png'),full_page=True,timeout=15000)
    page.locator('.search-trigger').click();page.locator('#docs-search').fill('memory')
    page.screenshot(path=str(QA/'search-desktop.png'),full_page=False,timeout=15000);page.keyboard.press('Escape')
    page.set_viewport_size({'width':390,'height':844});go('/')
    page.screenshot(path=str(QA/'home-mobile.png'),full_page=True,timeout=15000)
    go('/docs/getting-started/');page.screenshot(path=str(QA/'docs-mobile.png'),full_page=True,timeout=15000)
    browser.close()
report={'surface':'offline self-contained review, rendered via Playwright set_content','browser':'Chromium 144; Browser plugin unavailable','environment_limits':['Managed URLBlocklist blocks navigations, including localhost. No policy was changed.','Native clipboard success is not tested; adapter-backed success and real failure fallback are separated.','Next.js, React hydration, Fumadocs compilation, and a production deployment were not run.'],'viewport_widths':[360,390,768,1280,1440],'route_count':len(ROUTES),'results':results,'runtime_errors':errors}
(QA/'browser-results.json').write_text(json.dumps(report,indent=2))
for r in results:print(r['status'].upper(),r['check'],r.get('detail',''))
print(f"{sum(r['status']=='pass' for r in results)}/{len(results)} checks passed")
if any(r['status']=='fail' for r in results):raise SystemExit(1)
