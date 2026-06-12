// ─────────────────────────────────────────────────────────────────────────
//  foyer-toasts — a vanilla, dependency-free port of react-toastify's UI.
//
//  The look (toast card, slide/bounce animation, auto-dismiss progress bar,
//  coloured success / error / info / warning variants, icons, close button,
//  pause-on-hover) is reproduced 1:1 from react-toastify's stylesheet and
//  behaviour, re-implemented without React so it drops into Foyer's vanilla
//  admin. CSS + icon paths adapted from:
//
//    react-toastify — © Fadi Khadra — MIT License
//    https://github.com/fkhadra/react-toastify
//
//  Ported to plain DOM for Foyer ("foyer-toasts"). MIT terms preserved.
// ─────────────────────────────────────────────────────────────────────────
(function () {
  if (window.foyerToast) return;

  var CSS = `
.Toastify__toast-container{z-index:var(--toastify-z-index,9999);-webkit-transform:translate3d(0,0,9999px);position:fixed;width:var(--toastify-toast-width,320px);box-sizing:border-box;color:#fff;display:flex;flex-direction:column;pointer-events:none;}
.Toastify__toast-container--top-left{top:1em;left:1em;}
.Toastify__toast-container--top-center{top:1em;left:50%;transform:translateX(-50%);}
.Toastify__toast-container--top-right{top:1em;right:1em;}
.Toastify__toast-container--bottom-left{bottom:1em;left:1em;}
.Toastify__toast-container--bottom-center{bottom:1em;left:50%;transform:translateX(-50%);}
.Toastify__toast-container--bottom-right{bottom:1em;right:1em;}
@media only screen and (max-width:480px){
  .Toastify__toast-container{width:100vw;padding:0;left:0;margin:0;}
  .Toastify__toast-container--top-left,.Toastify__toast-container--top-center,.Toastify__toast-container--top-right{top:0;transform:translateX(0);}
  .Toastify__toast-container--bottom-left,.Toastify__toast-container--bottom-center,.Toastify__toast-container--bottom-right{bottom:0;transform:translateX(0);}
  .Toastify__toast{margin-bottom:0;border-radius:0;}
}
.Toastify__toast{--y:0;position:relative;touch-action:none;min-height:var(--toastify-toast-min-height,64px);box-sizing:border-box;margin-bottom:1rem;padding:8px;border-radius:6px;box-shadow:0 1px 10px 0 rgba(0,0,0,.1),0 2px 15px 0 rgba(0,0,0,.05);display:flex;justify-content:space-between;max-height:var(--toastify-toast-max-height,800px);font-family:var(--toastify-font-family,sans-serif);cursor:default;direction:ltr;z-index:0;overflow:hidden;pointer-events:auto;}
.Toastify__toast--close-on-click{cursor:pointer;}
.Toastify__toast-body{margin:auto 0;flex:1 1 auto;padding:6px;display:flex;align-items:center;font-size:14px;line-height:1.3;}
.Toastify__toast-body>div:last-child{word-break:break-word;flex:1;}
.Toastify__toast-icon{margin-inline-end:10px;width:20px;flex-shrink:0;display:flex;align-items:center;}
.Toastify__toast-icon svg{width:20px;height:20px;fill:currentColor;}
.Toastify__toast-theme--light{background:var(--toastify-color-light,#fff);color:var(--toastify-text-color-light,#757575);}
.Toastify__toast-theme--dark{background:var(--toastify-color-dark,#121212);color:var(--toastify-text-color-dark,#fff);}
.Toastify__toast-theme--light.Toastify__toast--info .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--info .Toastify__toast-icon{color:var(--toastify-color-info,#3498db);}
.Toastify__toast-theme--light.Toastify__toast--success .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--success .Toastify__toast-icon{color:var(--toastify-color-success,#07bc0c);}
.Toastify__toast-theme--light.Toastify__toast--warning .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--warning .Toastify__toast-icon{color:var(--toastify-color-warning,#f1c40f);}
.Toastify__toast-theme--light.Toastify__toast--error .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--error .Toastify__toast-icon{color:var(--toastify-color-error,#e74c3c);}
.Toastify__close-button{color:#000;background:transparent;outline:none;border:none;padding:0;cursor:pointer;opacity:.3;transition:opacity .3s ease;align-self:flex-start;z-index:1;}
.Toastify__toast-theme--dark .Toastify__close-button{color:#fff;opacity:.7;}
.Toastify__close-button svg{fill:currentColor;height:16px;width:14px;}
.Toastify__close-button:hover,.Toastify__close-button:focus{opacity:1;}
.Toastify__progress-bar{position:absolute;bottom:0;left:0;width:100%;height:5px;z-index:1;opacity:.7;transform-origin:left;border-bottom-left-radius:6px;}
.Toastify__progress-bar--animated{animation:Toastify__trackProgress linear 1 forwards;}
.Toastify__progress-bar--info{background:var(--toastify-color-info,#3498db);}
.Toastify__progress-bar--success{background:var(--toastify-color-success,#07bc0c);}
.Toastify__progress-bar--warning{background:var(--toastify-color-warning,#f1c40f);}
.Toastify__progress-bar--error{background:var(--toastify-color-error,#e74c3c);}
.Toastify__progress-bar--default{background:linear-gradient(to right,#4cd964,#5ac8fa,#007aff,#34aadc,#5856d6,#ff2d55);}
@keyframes Toastify__trackProgress{0%{transform:scaleX(1);}100%{transform:scaleX(0);}}
.Toastify--animate{animation-fill-mode:both;animation-duration:.7s;}
.Toastify--animate-icon{animation-fill-mode:both;animation-duration:.3s;}
@keyframes Toastify__bounceInRight{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}from{opacity:0;transform:translate3d(3000px,0,0);}60%{opacity:1;transform:translate3d(-25px,0,0);}75%{transform:translate3d(10px,0,0);}90%{transform:translate3d(-5px,0,0);}to{transform:none;}}
@keyframes Toastify__bounceOutRight{20%{opacity:1;transform:translate3d(-20px,0,0);}to{opacity:0;transform:translate3d(2000px,0,0);}}
@keyframes Toastify__bounceInLeft{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}0%{opacity:0;transform:translate3d(-3000px,0,0);}60%{opacity:1;transform:translate3d(25px,0,0);}75%{transform:translate3d(-10px,0,0);}90%{transform:translate3d(5px,0,0);}to{transform:none;}}
@keyframes Toastify__bounceOutLeft{20%{opacity:1;transform:translate3d(20px,0,0);}to{opacity:0;transform:translate3d(-2000px,0,0);}}
@keyframes Toastify__bounceInUp{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}from{opacity:0;transform:translate3d(0,3000px,0);}60%{opacity:1;transform:translate3d(0,-20px,0);}75%{transform:translate3d(0,10px,0);}90%{transform:translate3d(0,-5px,0);}to{transform:translate3d(0,0,0);}}
@keyframes Toastify__bounceOutUp{20%{transform:translate3d(0,-10px,0);}40%,45%{opacity:1;transform:translate3d(0,20px,0);}to{opacity:0;transform:translate3d(0,-2000px,0);}}
@keyframes Toastify__bounceInDown{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}0%{opacity:0;transform:translate3d(0,-3000px,0);}60%{opacity:1;transform:translate3d(0,25px,0);}75%{transform:translate3d(0,-10px,0);}90%{transform:translate3d(0,5px,0);}to{transform:none;}}
@keyframes Toastify__bounceOutDown{20%{transform:translate3d(0,10px,0);}40%,45%{opacity:1;transform:translate3d(0,-20px,0);}to{opacity:0;transform:translate3d(0,2000px,0);}}
.Toastify__bounce-enter--top-left,.Toastify__bounce-enter--bottom-left{animation-name:Toastify__bounceInLeft;}
.Toastify__bounce-enter--top-right,.Toastify__bounce-enter--bottom-right{animation-name:Toastify__bounceInRight;}
.Toastify__bounce-enter--top-center{animation-name:Toastify__bounceInDown;}
.Toastify__bounce-enter--bottom-center{animation-name:Toastify__bounceInUp;}
.Toastify__bounce-exit--top-left,.Toastify__bounce-exit--bottom-left{animation-name:Toastify__bounceOutLeft;}
.Toastify__bounce-exit--top-right,.Toastify__bounce-exit--bottom-right{animation-name:Toastify__bounceOutRight;}
.Toastify__bounce-exit--top-center{animation-name:Toastify__bounceOutUp;}
.Toastify__bounce-exit--bottom-center{animation-name:Toastify__bounceOutDown;}
.Toastify__spinner{width:20px;height:20px;box-sizing:border-box;border:2px solid;border-radius:100%;border-color:var(--toastify-spinner-color-empty-area,#e0e0e0);border-right-color:var(--toastify-color-info,#3498db);animation:Toastify__spin .65s linear infinite;}
@keyframes Toastify__spin{0%{transform:rotate(0);}100%{transform:rotate(360deg);}}`;

  var ICONS = {
    info: '<svg viewBox="0 0 24 24"><path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z"/></svg>',
    success: '<svg viewBox="0 0 24 24"><path d="M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.776-1.095h2.717c.526.005.833.476.776 1.096z"/></svg>',
    error: '<svg viewBox="0 0 24 24"><path d="M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"/></svg>',
    "default": '<div class="Toastify__spinner"></div>'
  };
  var CLOSE = '<svg aria-hidden="true" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48z"/></svg>';

  function injectCss() {
    if (document.getElementById('foyer-toasts-css')) return;
    var s = document.createElement('style');
    s.id = 'foyer-toasts-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  var containers = {};
  function container(position) {
    if (containers[position]) return containers[position];
    var el = document.createElement('div');
    el.className = 'Toastify__toast-container Toastify__toast-container--' + position;
    el.setAttribute('role', 'region');
    document.body.appendChild(el);
    containers[position] = el;
    return el;
  }

  function show(message, opts) {
    injectCss();
    opts = opts || {};
    var type = opts.type || 'default';
    if (!ICONS[type]) type = 'default';
    var position = opts.position || 'top-right';
    var theme = opts.theme || 'light';
    var autoClose = opts.autoClose === false ? false : (typeof opts.autoClose === 'number' ? opts.autoClose : 5000);
    var top = position.indexOf('top') === 0;
    var cont = container(position);

    var toast = document.createElement('div');
    toast.className = 'Toastify__toast Toastify__toast-theme--' + theme + ' Toastify__toast--' + type
      + ' Toastify__toast--close-on-click Toastify--animate Toastify__bounce-enter--' + position;
    toast.setAttribute('role', 'alert');

    var icon = opts.icon === false ? '' : '<div class="Toastify__toast-icon Toastify--animate-icon">' + ICONS[type] + '</div>';
    var bar = autoClose === false ? '' :
      '<div class="Toastify__progress-bar Toastify__progress-bar--animated Toastify__progress-bar--' + type
      + '" style="animation-duration:' + (autoClose / 1000) + 's;"></div>';
    toast.innerHTML =
      '<div class="Toastify__toast-body">' + icon + '<div>' + (opts.html ? message : escapeText(message)) + '</div></div>'
      + (opts.closeButton === false ? '' : '<button class="Toastify__close-button" type="button" aria-label="close">' + CLOSE + '</button>')
      + bar;

    if (top) cont.appendChild(toast); else cont.insertBefore(toast, cont.firstChild);

    var removed = false;
    function exit() {
      if (removed) return; removed = true;
      toast.classList.remove('Toastify__bounce-enter--' + position);
      toast.className = toast.className.replace('Toastify--animate', 'Toastify--animate') + ' Toastify__bounce-exit--' + position;
      var done = function () {
        toast.removeEventListener('animationend', done);
        toast.remove();
        if (!cont.children.length) { cont.remove(); delete containers[position]; }
      };
      toast.addEventListener('animationend', done);
    }

    var progress = toast.querySelector('.Toastify__progress-bar');
    if (progress) {
      progress.addEventListener('animationend', exit);
      // pause-on-hover (react-toastify default)
      toast.addEventListener('mouseenter', function () { progress.style.animationPlayState = 'paused'; });
      toast.addEventListener('mouseleave', function () { progress.style.animationPlayState = 'running'; });
    }
    var closeBtn = toast.querySelector('.Toastify__close-button');
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); exit(); });
    if (opts.closeOnClick !== false) toast.addEventListener('click', exit);

    return { close: exit, el: toast };
  }
  function escapeText(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var api = function (message, opts) { return show(message, opts); };
  ['success', 'error', 'info', 'warning'].forEach(function (t) {
    api[t] = function (message, opts) { opts = opts || {}; opts.type = t; return show(message, opts); };
  });
  api.warn = api.warning;
  api.dark = function (message, opts) { opts = opts || {}; opts.theme = 'dark'; return show(message, opts); };
  api.dismiss = function () { for (var k in containers) { containers[k].remove(); delete containers[k]; } };
  window.foyerToast = api;
})();
