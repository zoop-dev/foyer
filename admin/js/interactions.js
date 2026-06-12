










var FOYER_INTERACTIVE = new Set(['cta', 'buttongroup', 'links', 'link', 'image', 'hero', 'cards', 'gallery', 'banner', 'imgtext', 'logos', 'badges', 'social']);
function foyerInteractive(type) { return FOYER_INTERACTIVE.has(type); }

(function () {
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('beta') === '1') localStorage.setItem('foyer_beta', '1');
    else if (q.get('beta') === '0') localStorage.removeItem('foyer_beta');
  } catch (e) {}
})();
function foyerInteractionsBeta() {
  try { return localStorage.getItem('foyer_beta') === '1' || (window.foyerFlags && window.foyerFlags.interactions === '1'); } catch (e) { return false; }
}

var BLOCKLY_VER = '10.4.3';
var BLOCKLY_BASE = 'https://unpkg.com/blockly@' + BLOCKLY_VER + '/';
var _blocklyReady = null;
function ensureBlockly() {
  if (window.Blockly && window.Blockly.JavaScript) return Promise.resolve();
  if (_blocklyReady) return _blocklyReady;
  function load(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('load ' + src)); }; document.head.appendChild(s); }); }
  _blocklyReady = load(BLOCKLY_BASE + 'blockly_compressed.js')
    .then(function () { return load(BLOCKLY_BASE + 'msg/en.js'); })
    .then(function () { return load(BLOCKLY_BASE + 'javascript_compressed.js'); })
    .then(function () { defineFoyerBlocks(); });
  return _blocklyReady;
}

var _blocksDefined = false;
function defineFoyerBlocks() {
  if (_blocksDefined) return; _blocksDefined = true;
  var B = window.Blockly;

  var EVENT_COLOUR = '#f59e0b', ACTION_COLOUR = '#3b82f6', ADV_COLOUR = '#8b5cf6', SECTION_COLOUR = '#d6209a', TYPE_COLOUR = '#14b8a6';
  var EV = [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }];
  B.defineBlocksWithJsonArray([

    { type: 'foyer_on_click', message0: '👆  when this block is clicked %1 %2', args0: EV, colour: EVENT_COLOUR, tooltip: 'Runs the blocks tucked inside whenever a visitor clicks this block.' },
    { type: 'foyer_on_hover', message0: '🖱️  when the mouse moves over this block %1 %2', args0: EV, colour: EVENT_COLOUR, tooltip: 'Runs when the visitor’s pointer moves onto this block.' },
    { type: 'foyer_on_load', message0: '🔄  when the page opens %1 %2', args0: EV, colour: EVENT_COLOUR, tooltip: 'Runs once, right after the page finishes loading.' },
    { type: 'foyer_on_visible', message0: '👁️  when this block scrolls into view %1 %2', args0: EV, colour: EVENT_COLOUR, tooltip: 'Runs the first time this block appears on screen as the visitor scrolls down.' },

    {
      type: 'foyer_toast',
      message0: '💬  show a pop-up message %1', args0: [{ type: 'field_input', name: 'TEXT', text: 'Hello!' }],
      message1: 'colour %1 theme %2', args1: [
        { type: 'field_dropdown', name: 'TYPE', options: [['grey', 'default'], ['green ✓', 'success'], ['red ✕', 'error'], ['blue ℹ', 'info'], ['amber ⚠', 'warning']] },
        { type: 'field_dropdown', name: 'THEME', options: [['colourful', 'colored'], ['light', 'light'], ['dark', 'dark']] }
      ],
      message2: 'at %1 for %2 sec, animate %3', args2: [
        { type: 'field_dropdown', name: 'POS', options: [['top right', 'top-right'], ['top centre', 'top-center'], ['top left', 'top-left'], ['bottom right', 'bottom-right'], ['bottom centre', 'bottom-center'], ['bottom left', 'bottom-left']] },
        { type: 'field_number', name: 'SECS', value: 4, min: 0, precision: 0.5 },
        { type: 'field_dropdown', name: 'TRANS', options: [['bounce', 'bounce'], ['slide', 'slide'], ['zoom', 'zoom'], ['flip', 'flip']] }
      ],
      previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Shows a pop-up message in the corner. Set the seconds to 0 to keep it up until the visitor closes it.'
    },
    { type: 'foyer_go', message0: '🔗  go to the web page %1 open in a new tab %2', args0: [{ type: 'field_input', name: 'URL', text: 'https://' }, { type: 'field_checkbox', name: 'NEWTAB', checked: false }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Sends the visitor to a web address. Tick the box to open it in a new tab instead.' },
    { type: 'foyer_scroll', message0: '⬇️  smoothly scroll to the section %1', args0: [{ type: 'field_input', name: 'SEL', text: '#about' }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Glides the page down (or up) to a section. Type the #name you gave the section in its “anchor” setting, e.g. #about.' },
    { type: 'foyer_show', message0: '👁️  show %1', args0: [{ type: 'field_input', name: 'SEL', text: '' }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Makes something appear. Leave the box empty to mean THIS block, or type a section’s #name.' },
    { type: 'foyer_hide', message0: '🙈  hide %1', args0: [{ type: 'field_input', name: 'SEL', text: '' }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Makes something disappear. Leave the box empty to mean THIS block, or type a section’s #name.' },
    { type: 'foyer_toggle', message0: '🔁  show or hide %1', args0: [{ type: 'field_input', name: 'SEL', text: '' }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Flips between shown and hidden each time. Leave the box empty to mean THIS block.' },
    { type: 'foyer_settext', message0: '✏️  change the words of %1 to %2', args0: [{ type: 'field_input', name: 'SEL', text: '' }, { type: 'field_input', name: 'TEXT', text: 'New text' }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Replaces the visible text. Leave the first box empty to mean THIS block.' },
    { type: 'foyer_copy', message0: '📋  copy %1 to the clipboard', args0: [{ type: 'field_input', name: 'TEXT', text: 'Copied!' }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Puts some text on the visitor’s clipboard so they can paste it.' },
    { type: 'foyer_sound', message0: '🔊  play a sound from %1', args0: [{ type: 'field_input', name: 'URL', text: 'https://' }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Plays an audio file (mp3/wav) from a link.' },
    { type: 'foyer_wait', message0: '⏳  wait %1 seconds, then keep going', args0: [{ type: 'field_number', name: 'N', value: 1, min: 0, precision: 0.1 }], previousStatement: null, nextStatement: null, colour: ACTION_COLOUR, tooltip: 'Pauses before running the next block below.' },
    { type: 'foyer_toggleclass', message0: '🎨  (advanced) switch style %1 on/off for %2', args0: [{ type: 'field_input', name: 'CLS', text: 'active' }, { type: 'field_input', name: 'SEL', text: '' }], previousStatement: null, nextStatement: null, colour: ADV_COLOUR, tooltip: 'Advanced: adds/removes a CSS class name. Leave the target empty for THIS block.' },

    { type: 'foyer_this_show', message0: '👁️  show this section', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Makes this very block appear.' },
    { type: 'foyer_this_hide', message0: '🙈  hide this section', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Makes this very block disappear.' },
    { type: 'foyer_this_toggle', message0: '🔁  show or hide this section', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Flips this block between shown and hidden.' },
    { type: 'foyer_this_scroll', message0: '⬇️  scroll to this section', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Glides the page to this block.' },
    { type: 'foyer_this_flash', message0: '✨  flash this section', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'A quick attention pulse on this block.' },
    { type: 'foyer_this_shake', message0: '📳  shake this section', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Wiggles this block side to side — good for “wrong answer” feedback.' },
    { type: 'foyer_this_fadein', message0: '🌅  fade this section in', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Reveals this block with a soft fade.' },
    { type: 'foyer_this_fadeout', message0: '🌇  fade this section out', previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Hides this block with a soft fade.' },
    { type: 'foyer_this_bg', message0: '🎨  set this section’s background to %1', args0: [{ type: 'field_input', name: 'COLOR', text: '#ffd54a' }], previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Changes this block’s background. Use a colour name (red) or hex (#ffd54a).' },
    { type: 'foyer_this_color', message0: '🖍️  set this section’s text colour to %1', args0: [{ type: 'field_input', name: 'COLOR', text: '#111111' }], previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Changes the text colour of this block.' },
    { type: 'foyer_this_text', message0: '✏️  set this section’s text to %1', args0: [{ type: 'field_input', name: 'TEXT', text: 'New text' }], previousStatement: null, nextStatement: null, colour: SECTION_COLOUR, tooltip: 'Replaces the text shown in this block.' },

    { type: 'foyer_btn_text', message0: '🔘  set this button’s text to %1', args0: [{ type: 'field_input', name: 'TEXT', text: 'Click me' }], previousStatement: null, nextStatement: null, colour: TYPE_COLOUR, tooltip: 'Changes the words on this button.' },
    { type: 'foyer_btn_disable', message0: '🚫  disable this button', previousStatement: null, nextStatement: null, colour: TYPE_COLOUR, tooltip: 'Greys the button out so it can’t be clicked.' },
    { type: 'foyer_btn_enable', message0: '✅  enable this button', previousStatement: null, nextStatement: null, colour: TYPE_COLOUR, tooltip: 'Re-enables a disabled button.' },
    { type: 'foyer_img_src', message0: '🖼️  change this image to %1', args0: [{ type: 'field_input', name: 'URL', text: 'https://' }], previousStatement: null, nextStatement: null, colour: TYPE_COLOUR, tooltip: 'Swaps the picture for the one at this link.' }
  ]);

  var JS = B.JavaScript;
  var S = function (v) { return JSON.stringify(v == null ? '' : v); };
  var gen = {
    foyer_on_click: function (b) { return 'ctx.el.addEventListener("click", async function(event){\n' + JS.statementToCode(b, 'DO') + '});\n'; },
    foyer_on_hover: function (b) { return 'ctx.el.addEventListener("mouseenter", async function(event){\n' + JS.statementToCode(b, 'DO') + '});\n'; },
    foyer_on_load: function (b) { return '(async function(){\n' + JS.statementToCode(b, 'DO') + '})();\n'; },
    foyer_on_visible: function (b) { return 'ctx.onVisible(async function(){\n' + JS.statementToCode(b, 'DO') + '});\n'; },
    foyer_toast: function (b) {
      var secs = Number(b.getFieldValue('SECS'));
      var opts = { type: b.getFieldValue('TYPE'), theme: b.getFieldValue('THEME'), position: b.getFieldValue('POS'), transition: b.getFieldValue('TRANS'), autoClose: secs > 0 ? Math.round(secs * 1000) : false };
      return 'ctx.toast(' + S(b.getFieldValue('TEXT')) + ',' + JSON.stringify(opts) + ');\n';
    },
    foyer_go: function (b) { return 'ctx.go(' + S(b.getFieldValue('URL')) + ',' + (b.getFieldValue('NEWTAB') === 'TRUE') + ');\n'; },
    foyer_scroll: function (b) { return 'ctx.scrollToSel(' + S(b.getFieldValue('SEL')) + ');\n'; },
    foyer_show: function (b) { return 'ctx.show(' + S(b.getFieldValue('SEL')) + ');\n'; },
    foyer_hide: function (b) { return 'ctx.hide(' + S(b.getFieldValue('SEL')) + ');\n'; },
    foyer_toggle: function (b) { return 'ctx.toggle(' + S(b.getFieldValue('SEL')) + ');\n'; },
    foyer_toggleclass: function (b) { return 'ctx.toggleClass(' + S(b.getFieldValue('SEL')) + ',' + S(b.getFieldValue('CLS')) + ');\n'; },
    foyer_settext: function (b) { return 'ctx.setText(' + S(b.getFieldValue('SEL')) + ',' + S(b.getFieldValue('TEXT')) + ');\n'; },
    foyer_copy: function (b) { return 'ctx.copy(' + S(b.getFieldValue('TEXT')) + ');\n'; },
    foyer_sound: function (b) { return 'ctx.playSound(' + S(b.getFieldValue('URL')) + ');\n'; },
    foyer_wait: function (b) { return 'await ctx.wait(' + (Number(b.getFieldValue('N')) * 1000) + ');\n'; },
    foyer_this_show: function () { return 'ctx.show("");\n'; },
    foyer_this_hide: function () { return 'ctx.hide("");\n'; },
    foyer_this_toggle: function () { return 'ctx.toggle("");\n'; },
    foyer_this_scroll: function () { return 'ctx.scrollHere();\n'; },
    foyer_this_flash: function () { return 'ctx.flash();\n'; },
    foyer_this_shake: function () { return 'ctx.shake();\n'; },
    foyer_this_fadein: function () { return 'ctx.fadeIn();\n'; },
    foyer_this_fadeout: function () { return 'ctx.fadeOut();\n'; },
    foyer_this_bg: function (b) { return 'ctx.setBg(' + S(b.getFieldValue('COLOR')) + ');\n'; },
    foyer_this_color: function (b) { return 'ctx.setColor(' + S(b.getFieldValue('COLOR')) + ');\n'; },
    foyer_this_text: function (b) { return 'ctx.setText("",' + S(b.getFieldValue('TEXT')) + ');\n'; },
    foyer_btn_text: function (b) { return 'ctx.setText("a,button",' + S(b.getFieldValue('TEXT')) + ');\n'; },
    foyer_btn_disable: function () { return 'ctx.disable("a,button");\n'; },
    foyer_btn_enable: function () { return 'ctx.enable("a,button");\n'; },
    foyer_img_src: function (b) { return 'ctx.setImg(' + S(b.getFieldValue('URL')) + ');\n'; }
  };
  for (var k in gen) { JS[k] = gen[k]; if (JS.forBlock) JS.forBlock[k] = gen[k]; }
}

var _darkTheme = null;
function foyerDarkTheme() {
  if (_darkTheme) return _darkTheme;
  var B = window.Blockly;
  try {
    _darkTheme = B.Theme.defineTheme('foyerDark', {
      base: B.Themes.Classic,
      componentStyles: {
        workspaceBackgroundColour: '#0d1117',
        toolboxBackgroundColour: '#11161d',
        toolboxForegroundColour: '#cdd6e0',
        flyoutBackgroundColour: '#161b22',
        flyoutForegroundColour: '#cdd6e0',
        flyoutOpacity: 1,
        scrollbarColour: '#39414d',
        scrollbarOpacity: 0.5,
        insertionMarkerColour: '#ffffff',
        insertionMarkerOpacity: 0.35,
        cursorColour: '#ffffff',
        selectedGlowColour: '#4dbd6a',
        markerColour: '#4dbd6a'
      },
      fontStyle: { family: '"Helvetica Neue", Arial, sans-serif', size: 13, weight: '500' }
    });
  } catch (e) { _darkTheme = undefined; }
  return _darkTheme;
}

var CAT_WHEN = '<category name="When…" colour="#f59e0b">' +
  '<block type="foyer_on_click"></block><block type="foyer_on_hover"></block><block type="foyer_on_load"></block><block type="foyer_on_visible"></block>' +
  '</category>';
var CAT_DO = '<category name="Do…" colour="#3b82f6">' +
  '<block type="foyer_toast"></block><block type="foyer_go"></block><block type="foyer_scroll"></block>' +
  '<block type="foyer_show"></block><block type="foyer_hide"></block><block type="foyer_toggle"></block>' +
  '<block type="foyer_toggleclass"></block><block type="foyer_settext"></block><block type="foyer_copy"></block>' +
  '<block type="foyer_sound"></block><block type="foyer_wait"></block>' +
  '</category>';
var CAT_SECTION = '<category name="For this section" colour="#d6209a">' +
  '<block type="foyer_this_show"></block><block type="foyer_this_hide"></block><block type="foyer_this_toggle"></block>' +
  '<block type="foyer_this_scroll"></block><block type="foyer_this_flash"></block><block type="foyer_this_shake"></block>' +
  '<block type="foyer_this_fadein"></block><block type="foyer_this_fadeout"></block>' +
  '<block type="foyer_this_bg"></block><block type="foyer_this_color"></block><block type="foyer_this_text"></block>' +
  '</category>';

var CAT_BUTTON = '<category name="🔘 Button only" colour="#14b8a6"><block type="foyer_btn_text"></block><block type="foyer_btn_disable"></block><block type="foyer_btn_enable"></block></category>';
var CAT_IMAGE = '<category name="🖼️ Image only" colour="#14b8a6"><block type="foyer_img_src"></block></category>';
var TYPE_CATS = { cta: CAT_BUTTON, buttongroup: CAT_BUTTON, image: CAT_IMAGE, imgtext: CAT_IMAGE, hero: CAT_IMAGE, banner: CAT_IMAGE };
function buildToolbox(type) { return '<xml>' + CAT_WHEN + CAT_DO + CAT_SECTION + (TYPE_CATS[type] || '') + '</xml>'; }



function injectBhvFieldCss() {
  if (document.getElementById('foyer-bhv-css')) return;
  var s = document.createElement('style');
  s.id = 'foyer-bhv-css';
  s.textContent = '.blocklyHtmlInput{caret-color:#111!important;color:#111!important;background:#fff!important;border-radius:5px!important;}'
    + '.blocklyWidgetDiv .goog-menuitem,.blocklyDropDownDiv .blocklyMenuItemContent{color:#111;}';
  document.head.appendChild(s);
}

var _bhvWs = null, _bhvSectionId = null;
function openInteractions(sectionId) {
  injectBhvFieldCss();
  _bhvSectionId = sectionId;
  var sec = (typeof bldState !== 'undefined' && bldState.sections || []).find(function (s) { return s.id === sectionId; });
  if (!sec) return;
  var ov = document.createElement('div');
  ov.id = 'bhvOverlay';
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(4,7,11,.72);display:flex;align-items:center;justify-content:center;padding:2.5vh 2.5vw;';
  ov.innerHTML =
    '<div style="background:var(--panel,#0d1117);border:1px solid var(--border,#222);border-radius:12px;width:100%;max-width:1000px;height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.1rem;border-bottom:1px solid var(--border,#222);">' +
    '<div style="font-weight:300;letter-spacing:.02em;color:var(--white,#e8eef5);">⚡ Interactions <span style="opacity:.5;font-size:.7rem;">· ' + (sec.type || '') + ' <span style="background:#7fa6d8;color:#070a0e;font-size:.5rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.1rem .35rem;border-radius:3px;">Beta</span></span></div>' +
    '<div style="display:flex;gap:.5rem;"><button id="bhvClear" class="btn btn-sm" type="button" style="opacity:.8;">Clear</button><button id="bhvCancel" class="btn btn-sm" type="button">Cancel</button><button id="bhvSave" class="btn btn-sm" type="button" style="background:var(--accent,#4dbd6a);color:#06120a;">Save</button></div>' +
    '</div>' +
    '<div id="bhvCanvas" style="flex:1;min-height:0;"></div>' +
    '<div style="padding:.5rem 1.1rem;border-top:1px solid var(--border,#222);font-size:.62rem;font-weight:200;color:var(--muted,#7c8a99);">Snap an orange <b>When…</b> block, then nest blue <b>Do…</b> actions inside it. Targets accept a CSS selector or <b>#anchor</b>. Runs live for visitors when the <b>interactions</b> flag is on (or with ?beta=1).</div>' +
    '</div>';
  document.body.appendChild(ov);
  var close = function () { try { if (_bhvWs) _bhvWs.dispose(); } catch (e) {} _bhvWs = null; ov.remove(); };
  ov.querySelector('#bhvCancel').addEventListener('click', close);
  ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });

  ensureBlockly().then(function () {
    var B = window.Blockly;
    _bhvWs = B.inject(ov.querySelector('#bhvCanvas'), { toolbox: buildToolbox(sec.type), renderer: 'zelos', trashcan: true, zoom: { controls: true, wheel: true, startScale: .85 }, grid: { spacing: 26, length: 2, colour: 'rgba(255,255,255,.06)', snap: true }, theme: foyerDarkTheme() });
    if (sec.behaviors && sec.behaviors.workspace) { try { B.serialization.workspaces.load(sec.behaviors.workspace, _bhvWs); } catch (e) {} }
    setTimeout(function () { B.svgResize(_bhvWs); }, 30);
  }).catch(function () { toast('Could not load the Blockly editor (offline?)', true); close(); });

  ov.querySelector('#bhvClear').addEventListener('click', function () { if (_bhvWs) _bhvWs.clear(); });
  ov.querySelector('#bhvSave').addEventListener('click', function () {
    var B = window.Blockly;
    if (!_bhvWs) { close(); return; }
    var code = B.JavaScript.workspaceToCode(_bhvWs).trim();
    var ws = B.serialization.workspaces.save(_bhvWs);
    var hasBlocks = ws && ws.blocks && ws.blocks.blocks && ws.blocks.blocks.length;
    sec.behaviors = (hasBlocks && code) ? { workspace: ws, code: code } : null;
    if (!sec.behaviors) delete sec.behaviors;
    if (typeof bldDrawCanvas === 'function') bldDrawCanvas();
    if (typeof bldSaveDraft === 'function') bldSaveDraft();
    toast(sec.behaviors ? 'Interactions saved' : 'Interactions cleared', false, { type: sec.behaviors ? 'success' : 'info' });
    close();
  });
}
