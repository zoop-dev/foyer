// ─────────────────────────────────────────────────────────────────────────
//  foyer-toasts — a vanilla, dependency-free port of react-toastify.
//
//  Reproduces react-toastify's UI and behaviour 1:1 — themes (light / dark /
//  colored), transitions (bounce / slide / zoom / flip), the auto-dismiss
//  progress bar, coloured variants + icons, custom icons & close buttons,
//  draggable swipe-to-dismiss, pause-on-hover, pause-on-focus-loss,
//  newest-on-top, rtl, a visible limit, onOpen/onClose, controlled progress,
//  and the full toast() / .update() / .dismiss() / .promise() / .loading() API
//  — all without React, so it drops into Foyer's vanilla admin.
//
//  CSS, keyframes and icon paths adapted from:
//    react-toastify — © Fadi Khadra — MIT License
//    https://github.com/fkhadra/react-toastify
//  Ported to plain DOM for Foyer ("foyer-toasts"). MIT terms preserved.
// ─────────────────────────────────────────────────────────────────────────
(function () {
  if (window.foyerToast) return;

  // ── theme variables (override any of these in your own CSS :root) ────────
  var VARS = `:root{
--toastify-color-light:#fff;--toastify-color-dark:#121212;
--toastify-color-info:#3498db;--toastify-color-success:#07bc0c;--toastify-color-warning:#f1c40f;--toastify-color-error:#e74c3c;
--toastify-color-transparent:rgba(255,255,255,.7);
--toastify-icon-color-info:var(--toastify-color-info);--toastify-icon-color-success:var(--toastify-color-success);--toastify-icon-color-warning:var(--toastify-color-warning);--toastify-icon-color-error:var(--toastify-color-error);
--toastify-toast-width:320px;--toastify-toast-offset:16px;--toastify-toast-min-height:64px;--toastify-toast-max-height:800px;--toastify-toast-bd-radius:6px;
--toastify-font-family:sans-serif;--toastify-z-index:9999;
--toastify-text-color-light:#757575;--toastify-text-color-dark:#fff;
--toastify-spinner-color:#616161;--toastify-spinner-color-empty-area:#e0e0e0;
--toastify-color-progress-light:linear-gradient(to right,#4cd964,#5ac8fa,#007aff,#34aadc,#5856d6,#ff2d55);
--toastify-color-progress-dark:#bb86fc;
--toastify-color-progress-info:var(--toastify-color-info);--toastify-color-progress-success:var(--toastify-color-success);--toastify-color-progress-warning:var(--toastify-color-warning);--toastify-color-progress-error:var(--toastify-color-error);
}`;

  var CSS = `
.Toastify__toast-container{z-index:var(--toastify-z-index);-webkit-transform:translate3d(0,0,9999px);position:fixed;width:var(--toastify-toast-width);box-sizing:border-box;color:#fff;display:flex;flex-direction:column;pointer-events:none;}
.Toastify__toast-container--top-left{top:var(--toastify-toast-offset);left:var(--toastify-toast-offset);}
.Toastify__toast-container--top-center{top:var(--toastify-toast-offset);left:50%;transform:translateX(-50%);}
.Toastify__toast-container--top-right{top:var(--toastify-toast-offset);right:var(--toastify-toast-offset);}
.Toastify__toast-container--bottom-left{bottom:var(--toastify-toast-offset);left:var(--toastify-toast-offset);}
.Toastify__toast-container--bottom-center{bottom:var(--toastify-toast-offset);left:50%;transform:translateX(-50%);}
.Toastify__toast-container--bottom-right{bottom:var(--toastify-toast-offset);right:var(--toastify-toast-offset);}
.Toastify__toast-container--rtl{direction:rtl;}
@media only screen and (max-width:480px){
  .Toastify__toast-container{width:100vw;padding:0;left:0;margin:0;}
  .Toastify__toast-container--top-left,.Toastify__toast-container--top-center,.Toastify__toast-container--top-right{top:0;transform:translateX(0);}
  .Toastify__toast-container--bottom-left,.Toastify__toast-container--bottom-center,.Toastify__toast-container--bottom-right{bottom:0;transform:translateX(0);}
  .Toastify__toast{margin-bottom:0;border-radius:0;}
}
.Toastify__toast{position:relative;touch-action:none;min-height:var(--toastify-toast-min-height);box-sizing:border-box;margin-bottom:1rem;padding:8px;border-radius:var(--toastify-toast-bd-radius);box-shadow:0 1px 10px 0 rgba(0,0,0,.1),0 2px 15px 0 rgba(0,0,0,.05);display:flex;justify-content:space-between;max-height:var(--toastify-toast-max-height);font-family:var(--toastify-font-family);cursor:default;direction:ltr;z-index:0;overflow:hidden;will-change:transform,opacity;}
.Toastify__toast--rtl{direction:rtl;}
.Toastify__toast--close-on-click{cursor:pointer;}
.Toastify__toast-body{margin:auto 0;flex:1 1 auto;padding:6px;display:flex;align-items:center;font-size:14px;line-height:1.3;}
.Toastify__toast-body>div:last-child{word-break:break-word;flex:1;}
.Toastify__toast-icon{margin-inline-end:10px;width:22px;flex-shrink:0;display:flex;align-items:center;}
.Toastify__toast-icon svg{width:20px;height:20px;fill:currentColor;}
.Toastify__toast-theme--light{background:var(--toastify-color-light);color:var(--toastify-text-color-light);}
.Toastify__toast-theme--dark{background:var(--toastify-color-dark);color:var(--toastify-text-color-dark);}
.Toastify__toast-theme--colored.Toastify__toast--default{background:var(--toastify-color-light);color:var(--toastify-text-color-light);}
.Toastify__toast-theme--colored.Toastify__toast--info{color:#fff;background:var(--toastify-color-info);}
.Toastify__toast-theme--colored.Toastify__toast--success{color:#fff;background:var(--toastify-color-success);}
.Toastify__toast-theme--colored.Toastify__toast--warning{color:#fff;background:var(--toastify-color-warning);}
.Toastify__toast-theme--colored.Toastify__toast--error{color:#fff;background:var(--toastify-color-error);}
.Toastify__toast-theme--light.Toastify__toast--info .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--info .Toastify__toast-icon{color:var(--toastify-icon-color-info);}
.Toastify__toast-theme--light.Toastify__toast--success .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--success .Toastify__toast-icon{color:var(--toastify-icon-color-success);}
.Toastify__toast-theme--light.Toastify__toast--warning .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--warning .Toastify__toast-icon{color:var(--toastify-icon-color-warning);}
.Toastify__toast-theme--light.Toastify__toast--error .Toastify__toast-icon,.Toastify__toast-theme--dark.Toastify__toast--error .Toastify__toast-icon{color:var(--toastify-icon-color-error);}
.Toastify__close-button{color:#000;background:transparent;outline:none;border:none;padding:0;cursor:pointer;opacity:.3;transition:opacity .3s ease;align-self:flex-start;z-index:1;}
.Toastify__toast-theme--dark .Toastify__close-button,.Toastify__toast-theme--colored .Toastify__close-button{color:#fff;opacity:.7;}
.Toastify__close-button svg{fill:currentColor;height:16px;width:14px;}
.Toastify__close-button:hover,.Toastify__close-button:focus{opacity:1;}
.Toastify__progress-bar{position:absolute;bottom:0;left:0;width:100%;height:5px;z-index:1;opacity:.7;transform-origin:left;}
.Toastify__progress-bar--rtl{right:0;left:auto;transform-origin:right;}
.Toastify__progress-bar--animated{animation:Toastify__trackProgress linear 1 forwards;}
.Toastify__progress-bar--controlled{transition:transform .2s;}
.Toastify__progress-bar-theme--light.Toastify__progress-bar--info,.Toastify__progress-bar-theme--dark.Toastify__progress-bar--info{background:var(--toastify-color-progress-info);}
.Toastify__progress-bar-theme--light.Toastify__progress-bar--success,.Toastify__progress-bar-theme--dark.Toastify__progress-bar--success{background:var(--toastify-color-progress-success);}
.Toastify__progress-bar-theme--light.Toastify__progress-bar--warning,.Toastify__progress-bar-theme--dark.Toastify__progress-bar--warning{background:var(--toastify-color-progress-warning);}
.Toastify__progress-bar-theme--light.Toastify__progress-bar--error,.Toastify__progress-bar-theme--dark.Toastify__progress-bar--error{background:var(--toastify-color-progress-error);}
.Toastify__progress-bar-theme--light.Toastify__progress-bar--default{background:var(--toastify-color-progress-light);}
.Toastify__progress-bar-theme--dark.Toastify__progress-bar--default{background:var(--toastify-color-progress-dark);}
.Toastify__progress-bar-theme--colored{background:var(--toastify-color-transparent)!important;}
@keyframes Toastify__trackProgress{0%{transform:scaleX(1);}100%{transform:scaleX(0);}}
.Toastify--animate{animation-fill-mode:both;animation-duration:.7s;}
.Toastify--animate-icon{animation-fill-mode:both;animation-duration:.3s;}
@keyframes Toastify__bounceInRight{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}from{opacity:0;transform:translate3d(3000px,0,0);}60%{opacity:1;transform:translate3d(-25px,0,0);}75%{transform:translate3d(10px,0,0);}90%{transform:translate3d(-5px,0,0);}to{transform:none;}}
@keyframes Toastify__bounceOutRight{20%{opacity:1;transform:translate3d(-20px,0,0);}to{opacity:0;transform:translate3d(2000px,0,0);}}
@keyframes Toastify__bounceInLeft{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}0%{opacity:0;transform:translate3d(-3000px,0,0);}60%{opacity:1;transform:translate3d(25px,0,0);}75%{transform:translate3d(-10px,0,0);}90%{transform:translate3d(5px,0,0);}to{transform:none;}}
@keyframes Toastify__bounceOutLeft{20%{opacity:1;transform:translate3d(20px,0,0);}to{opacity:0;transform:translate3d(-2000px,0,0);}}
@keyframes Toastify__bounceInUp{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}from{opacity:0;transform:translate3d(0,3000px,0);}60%{opacity:1;transform:translate3d(0,-20px,0);}75%{transform:translate3d(0,10px,0);}90%{transform:translate3d(0,-5px,0);}to{transform:translate3d(0,0,0);}}
@keyframes Toastify__bounceOutDown{20%{transform:translate3d(0,10px,0);}40%,45%{opacity:1;transform:translate3d(0,-20px,0);}to{opacity:0;transform:translate3d(0,2000px,0);}}
@keyframes Toastify__bounceInDown{from,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);}0%{opacity:0;transform:translate3d(0,-3000px,0);}60%{opacity:1;transform:translate3d(0,25px,0);}75%{transform:translate3d(0,-10px,0);}90%{transform:translate3d(0,5px,0);}to{transform:none;}}
@keyframes Toastify__bounceOutUp{20%{transform:translate3d(0,-10px,0);}40%,45%{opacity:1;transform:translate3d(0,20px,0);}to{opacity:0;transform:translate3d(0,-2000px,0);}}
.Toastify__bounce-enter--right{animation-name:Toastify__bounceInRight;}.Toastify__bounce-enter--left{animation-name:Toastify__bounceInLeft;}.Toastify__bounce-enter--down{animation-name:Toastify__bounceInDown;}.Toastify__bounce-enter--up{animation-name:Toastify__bounceInUp;}
.Toastify__bounce-exit--right{animation-name:Toastify__bounceOutRight;}.Toastify__bounce-exit--left{animation-name:Toastify__bounceOutLeft;}.Toastify__bounce-exit--down{animation-name:Toastify__bounceOutUp;}.Toastify__bounce-exit--up{animation-name:Toastify__bounceOutDown;}
@keyframes Toastify__slideInRight{from{transform:translate3d(110%,0,0);visibility:visible;}to{transform:translate3d(0,0,0);}}
@keyframes Toastify__slideInLeft{from{transform:translate3d(-110%,0,0);visibility:visible;}to{transform:translate3d(0,0,0);}}
@keyframes Toastify__slideInUp{from{transform:translate3d(0,110%,0);visibility:visible;}to{transform:translate3d(0,0,0);}}
@keyframes Toastify__slideInDown{from{transform:translate3d(0,-110%,0);visibility:visible;}to{transform:translate3d(0,0,0);}}
@keyframes Toastify__slideOutRight{from{transform:translate3d(0,0,0);}to{visibility:hidden;transform:translate3d(110%,0,0);}}
@keyframes Toastify__slideOutLeft{from{transform:translate3d(0,0,0);}to{visibility:hidden;transform:translate3d(-110%,0,0);}}
@keyframes Toastify__slideOutDown{from{transform:translate3d(0,0,0);}to{visibility:hidden;transform:translate3d(0,500px,0);}}
@keyframes Toastify__slideOutUp{from{transform:translate3d(0,0,0);}to{visibility:hidden;transform:translate3d(0,-500px,0);}}
.Toastify__slide-enter--right{animation-name:Toastify__slideInRight;}.Toastify__slide-enter--left{animation-name:Toastify__slideInLeft;}.Toastify__slide-enter--down{animation-name:Toastify__slideInDown;}.Toastify__slide-enter--up{animation-name:Toastify__slideInUp;}
.Toastify__slide-exit--right{animation-name:Toastify__slideOutRight;}.Toastify__slide-exit--left{animation-name:Toastify__slideOutLeft;}.Toastify__slide-exit--down{animation-name:Toastify__slideOutUp;}.Toastify__slide-exit--up{animation-name:Toastify__slideOutDown;}
@keyframes Toastify__zoomIn{from{opacity:0;transform:scale3d(.3,.3,.3);}50%{opacity:1;}}
@keyframes Toastify__zoomOut{from{opacity:1;}50%{opacity:0;transform:scale3d(.3,.3,.3);}to{opacity:0;}}
.Toastify__zoom-enter{animation-name:Toastify__zoomIn;}.Toastify__zoom-exit{animation-name:Toastify__zoomOut;}
@keyframes Toastify__flipIn{from{transform:perspective(400px) rotate3d(1,0,0,90deg);animation-timing-function:ease-in;opacity:0;}40%{transform:perspective(400px) rotate3d(1,0,0,-20deg);animation-timing-function:ease-in;}60%{transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1;}80%{transform:perspective(400px) rotate3d(1,0,0,-5deg);}to{transform:perspective(400px);}}
@keyframes Toastify__flipOut{from{transform:perspective(400px);}30%{transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1;}to{transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0;}}
.Toastify__flip-enter{animation-name:Toastify__flipIn;}.Toastify__flip-exit{animation-name:Toastify__flipOut;}
.Toastify__spinner{width:20px;height:20px;box-sizing:border-box;border:2px solid;border-radius:100%;border-color:var(--toastify-spinner-color-empty-area);border-right-color:var(--toastify-color-info);animation:Toastify__spin .65s linear infinite;}
@keyframes Toastify__spin{0%{transform:rotate(0);}100%{transform:rotate(360deg);}}`;

  var ICONS = {
    info: '<svg viewBox="0 0 24 24"><path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z"/></svg>',
    success:
      '<svg viewBox="0 0 24 24"><path d="M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"/></svg>',
    warning:
      '<svg viewBox="0 0 24 24"><path d="M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.776-1.095h2.717c.526.005.833.476.776 1.096z"/></svg>',
    error:
      '<svg viewBox="0 0 24 24"><path d="M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"/></svg>',
    spinner: '<div class="Toastify__spinner"></div>',
  };
  var CLOSE =
    '<svg aria-hidden="true" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48z"/></svg>';

  // direction key per position (drives bounce/slide enter/exit)
  function dirOf(pos) {
    if (pos === "top-center") return "down";
    if (pos === "bottom-center") return "up";
    return pos.indexOf("left") > -1 ? "left" : "right";
  }
  var TRANS = {
    bounce: { d: 700, dir: 1 },
    slide: { d: 750, dir: 1 },
    zoom: { d: 550, dir: 0 },
    flip: { d: 750, dir: 0 },
  };
  function enterCls(t, pos) {
    return "Toastify__" + t + "-enter" + (TRANS[t].dir ? "--" + dirOf(pos) : "");
  }
  function exitCls(t, pos) {
    return "Toastify__" + t + "-exit" + (TRANS[t].dir ? "--" + dirOf(pos) : "");
  }

  // ── defaults (override with foyerToast.configure({...})) ─────────────────
  var defaults = {
    type: "default",
    position: "top-right",
    theme: "light",
    autoClose: 5000,
    hideProgressBar: false,
    closeButton: true,
    icon: true,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    draggable: true,
    draggablePercent: 80,
    transition: "bounce",
    rtl: false,
    newestOnTop: false,
    delay: 0,
    limit: 0,
    role: "alert",
    html: false,
    className: "",
    style: "",
    bodyClassName: "",
    progressClassName: "",
    progressStyle: "",
    onOpen: null,
    onClose: null,
  };

  function injectCss() {
    if (document.getElementById("foyer-toasts-css")) return;
    var v = document.createElement("style");
    v.id = "foyer-toasts-vars";
    v.textContent = VARS;
    var s = document.createElement("style");
    s.id = "foyer-toasts-css";
    s.textContent = CSS;
    var head = document.head || document.documentElement;
    head.appendChild(v);
    head.appendChild(s);
  }
  function escapeText(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var active = {}; // id -> entry
  var queues = {}; // containerKey -> [pending fns]
  var counts = {}; // containerKey -> visible count
  var containers = {}; // containerKey -> element
  var seq = 0;
  var paused = false; // focus-loss pause

  function ckey(o) {
    return o.position + "|" + (o.rtl ? "rtl" : "ltr");
  }
  function container(o) {
    var k = ckey(o);
    if (containers[k]) return containers[k];
    var el = document.createElement("div");
    el.className =
      "Toastify__toast-container Toastify__toast-container--" +
      o.position +
      (o.rtl ? " Toastify__toast-container--rtl" : "");
    el.setAttribute("role", "region");
    document.body.appendChild(el);
    containers[k] = el;
    counts[k] = 0;
    queues[k] = [];
    return el;
  }
  function release(k) {
    counts[k]--;
    if (queues[k] && queues[k].length) {
      var fn = queues[k].shift();
      fn();
    } else if (counts[k] <= 0 && containers[k] && !containers[k].children.length) {
      containers[k].remove();
      delete containers[k];
    }
  }

  function iconHtmlFor(o) {
    if (o.icon === false) return "";
    var ic = o.icon;
    if (o.loading) ic = ICONS.spinner;
    else if (ic === true || ic == null) ic = o.type === "default" ? "" : ICONS[o.type];
    else if (typeof ic === "string" && !/[<&]/.test(ic)) ic = escapeText(ic); // plain text / emoji icon
    return ic ? '<div class="Toastify__toast-icon Toastify--animate-icon">' + ic + "</div>" : "";
  }
  function progressClasses(o) {
    return (
      "Toastify__progress-bar Toastify__progress-bar-theme--" +
      o.theme +
      " Toastify__progress-bar--" +
      o.type +
      (o.rtl ? " Toastify__progress-bar--rtl" : "") +
      (o.progressClassName ? " " + o.progressClassName : "")
    );
  }
  function wireType(toast, o, entering) {
    toast.className =
      "Toastify__toast Toastify__toast-theme--" +
      o.theme +
      " Toastify__toast--" +
      o.type +
      (o.closeOnClick ? " Toastify__toast--close-on-click" : "") +
      (o.rtl ? " Toastify__toast--rtl" : "") +
      (entering ? " Toastify--animate " + enterCls(o.transition, o.position) : "") +
      (o.className ? " " + o.className : "");
    if (entering) toast.style.animationDuration = TRANS[o.transition].d / 1000 + "s";
    if (o.style) toast.style.cssText += o.style;
  }

  function render(entry, entering) {
    var o = entry.o,
      toast = entry.el;
    var content = o.html ? o.message : escapeText(o.message);
    toast.innerHTML =
      '<div class="Toastify__toast-body' +
      (o.bodyClassName ? " " + o.bodyClassName : "") +
      '">' +
      iconHtmlFor(o) +
      "<div>" +
      content +
      "</div></div>" +
      (o.closeButton === false
        ? ""
        : '<button class="Toastify__close-button" type="button" aria-label="close">' +
          (typeof o.closeButton === "string" ? o.closeButton : CLOSE) +
          "</button>");
    entry.controlled = typeof o.progress === "number";
    var hasBar = !o.hideProgressBar && (o.autoClose !== false || entry.controlled);
    entry.bar = null;
    if (hasBar) {
      var bar = document.createElement("div");
      bar.className =
        progressClasses(o) +
        (entry.controlled
          ? " Toastify__progress-bar--controlled"
          : " Toastify__progress-bar--animated");
      if (o.progressStyle) bar.style.cssText += o.progressStyle;
      if (entry.controlled) {
        bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, o.progress)) + ")";
        bar.style.opacity = "1";
      } else {
        bar.style.animationDuration = o.autoClose / 1000 + "s";
        bar.addEventListener("animationend", function () {
          close(entry);
        });
      }
      toast.appendChild(bar);
      entry.bar = bar;
      if (!entry.controlled && paused && o.pauseOnFocusLoss)
        bar.style.animationPlayState = "paused";
    }
    var cb = toast.querySelector(".Toastify__close-button");
    if (cb)
      cb.addEventListener("click", function (e) {
        e.stopPropagation();
        close(entry);
      });
    wireType(toast, o, entering);
  }

  function show(message, opts) {
    injectCss();
    var o = {};
    for (var k in defaults) o[k] = defaults[k];
    for (var k2 in opts || {}) o[k2] = opts[k2];
    o.message = message;
    if (!ICONS[o.type] && o.type !== "default") o.type = "default";
    if (!TRANS[o.transition]) o.transition = "bounce";
    var id = o.toastId != null ? o.toastId : ++seq;
    if (active[id]) {
      update(id, opts || {});
      return id;
    } // re-show existing id → update in place

    var k = ckey(o);
    function mount() {
      var cont = container(o);
      var toast = document.createElement("div");
      toast.setAttribute("role", o.role || "alert");
      var entry = { id: id, el: toast, o: o, k: k, removed: false };
      render(entry, true);
      if (o.newestOnTop) cont.insertBefore(toast, cont.firstChild);
      else cont.appendChild(toast);
      active[id] = entry;
      bindInteractions(entry);
      if (typeof o.onOpen === "function")
        try {
          o.onOpen();
        } catch (e) {}
    }
    var run = function () {
      if (o.delay && o.delay > 0)
        setTimeout(function () {
          o.delay = 0;
          mount();
        }, o.delay);
      else mount();
    };
    counts[k] = counts[k] || 0;
    if (o.limit && o.limit > 0 && counts[k] >= o.limit) {
      (queues[k] = queues[k] || []).push(run);
    } else {
      counts[k]++;
      run();
    }
    return id;
  }

  // Toast-level listeners live on the persistent element (kept across update()),
  // so we bind once and read the current flags from entry.o live.
  function bindInteractions(entry) {
    if (entry.bound) return;
    entry.bound = true;
    var toast = entry.el;
    toast.addEventListener("mouseenter", function () {
      if (entry.o.pauseOnHover && entry.bar && !entry.controlled)
        entry.bar.style.animationPlayState = "paused";
    });
    toast.addEventListener("mouseleave", function () {
      if (entry.o.pauseOnHover && entry.bar && !entry.removed && !entry.controlled && !paused)
        entry.bar.style.animationPlayState = "running";
    });
    toast.addEventListener("click", function () {
      if (entry.o.closeOnClick && !entry.dragging) close(entry);
    });
    makeDraggable(entry);
  }

  function makeDraggable(entry) {
    var toast = entry.el,
      startX = 0,
      delta = 0,
      dragging = false,
      w = 0;
    toast.addEventListener("pointerdown", function (e) {
      if (!entry.o.draggable) return;
      if (e.button != null && e.button !== 0) return;
      dragging = true;
      entry.dragging = false;
      startX = e.clientX;
      w = toast.offsetWidth;
      toast.style.transition = "none";
      if (entry.bar) entry.bar.style.animationPlayState = "paused";
      try {
        toast.setPointerCapture(e.pointerId);
      } catch (err) {}
    });
    toast.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      delta = e.clientX - startX;
      if (Math.abs(delta) > 3) entry.dragging = true;
      toast.style.transform = "translate3d(" + delta + "px,0,0)";
      toast.style.opacity = String(Math.max(0, 1 - Math.abs(delta) / (w || 1)));
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      if (w && Math.abs(delta) >= w * (entry.o.draggablePercent / 100)) {
        entry.flingDir = delta < 0 ? -1 : 1;
        close(entry, true);
      } else {
        toast.style.transition = "transform .2s,opacity .2s";
        toast.style.transform = "";
        toast.style.opacity = "";
        if (entry.bar && !entry.controlled && !paused)
          entry.bar.style.animationPlayState = "running";
      }
      setTimeout(function () {
        entry.dragging = false;
      }, 0);
      delta = 0;
    }
    toast.addEventListener("pointerup", end);
    toast.addEventListener("pointercancel", end);
  }

  function close(entry, fromDrag) {
    if (entry.removed) return;
    entry.removed = true;
    delete active[entry.id];
    var o = entry.o,
      toast = entry.el;
    var done = function () {
      toast.removeEventListener("animationend", done);
      toast.remove();
      if (typeof o.onClose === "function")
        try {
          o.onClose();
        } catch (e) {}
      release(entry.k);
    };
    if (fromDrag) {
      toast.style.transition = "transform .3s,opacity .3s";
      toast.style.transform =
        "translate3d(" + toast.offsetWidth * 2 * (entry.flingDir || 1) + "px,0,0)";
      toast.style.opacity = "0";
      setTimeout(done, 300);
      return;
    }
    toast.classList.remove(enterCls(o.transition, o.position));
    toast.classList.add(exitCls(o.transition, o.position));
    toast.style.animationDuration = TRANS[o.transition].d / 1000 + "s";
    toast.addEventListener("animationend", done);
  }

  function update(id, opts) {
    var entry = active[id];
    if (!entry) return;
    var o = entry.o,
      was = entry.el;
    for (var k in opts) if (k !== "toastId") o[k] = opts[k];
    if (opts.message !== undefined) o.message = opts.message;
    if (!ICONS[o.type] && o.type !== "default") o.type = "default";
    render(entry, false); // re-render in place (no enter animation)
    bindInteractions(entry); // (was cleared by innerHTML; re-bind on same element listeners are additive but element kept)
    return id;
  }

  // ── public API ───────────────────────────────────────────────────────────
  var api = function (message, opts) {
    return show(message, opts);
  };
  ["success", "error", "info", "warning"].forEach(function (t) {
    api[t] = function (message, opts) {
      opts = opts || {};
      opts.type = t;
      return show(message, opts);
    };
  });
  api.warn = api.warning;
  api.dark = function (message, opts) {
    opts = opts || {};
    opts.theme = "dark";
    return show(message, opts);
  };
  api.loading = function (message, opts) {
    opts = opts || {};
    opts.type = "default";
    opts.loading = true;
    opts.autoClose = false;
    opts.closeOnClick = false;
    opts.closeButton = opts.closeButton != null ? opts.closeButton : false;
    opts.draggable = false;
    return show(message, opts);
  };
  api.update = function (id, opts) {
    return update(id, opts || {});
  };
  api.isActive = function (id) {
    return !!active[id];
  };
  api.dismiss = function (id) {
    if (id == null) {
      for (var k in active) close(active[k]);
      return;
    }
    if (active[id]) close(active[id]);
  };
  api.configure = function (cfg) {
    for (var k in cfg || {}) defaults[k] = cfg[k];
  };
  api.promise = function (promise, msgs, opts) {
    msgs = msgs || {};
    opts = opts || {};
    var base = {};
    for (var k in opts) base[k] = opts[k];
    var id = api.loading(msgs.pending || "Loading…", base);
    function resolveOpts(m, type) {
      var r = m && typeof m === "object" && m.render !== undefined ? m : { render: m };
      var u = {};
      for (var k in base) u[k] = base[k];
      for (var k2 in r) if (k2 !== "render") u[k2] = r[k2];
      u.type = type;
      u.loading = false;
      u.icon = r.icon !== undefined ? r.icon : true;
      u.autoClose =
        u.autoClose === undefined || u.autoClose === false ? defaults.autoClose : u.autoClose;
      u.closeOnClick = u.closeOnClick === undefined ? true : u.closeOnClick;
      u.closeButton = u.closeButton === undefined ? true : u.closeButton;
      u.draggable = u.draggable === undefined ? true : u.draggable;
      u.message = r.render;
      return u;
    }
    return Promise.resolve(promise).then(
      function (val) {
        if (msgs.success !== undefined)
          update(
            id,
            resolveOpts(
              typeof msgs.success === "function" ? msgs.success(val) : msgs.success,
              "success"
            )
          );
        else api.dismiss(id);
        return val;
      },
      function (err) {
        if (msgs.error !== undefined)
          update(
            id,
            resolveOpts(typeof msgs.error === "function" ? msgs.error(err) : msgs.error, "error")
          );
        else api.dismiss(id);
        throw err;
      }
    );
  };
  api.POSITION = {
    TOP_LEFT: "top-left",
    TOP_CENTER: "top-center",
    TOP_RIGHT: "top-right",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_CENTER: "bottom-center",
    BOTTOM_RIGHT: "bottom-right",
  };
  api.TYPE = {
    INFO: "info",
    SUCCESS: "success",
    WARNING: "warning",
    ERROR: "error",
    DEFAULT: "default",
  };
  api.THEME = { LIGHT: "light", DARK: "dark", COLORED: "colored" };
  api.TRANSITIONS = { BOUNCE: "bounce", SLIDE: "slide", ZOOM: "zoom", FLIP: "flip" };

  // pause-on-focus-loss (react-toastify default)
  window.addEventListener("blur", function () {
    paused = true;
    for (var id in active) {
      var e = active[id];
      if (e.o.pauseOnFocusLoss && e.bar && !e.controlled) e.bar.style.animationPlayState = "paused";
    }
  });
  window.addEventListener("focus", function () {
    paused = false;
    for (var id in active) {
      var e = active[id];
      if (e.o.pauseOnFocusLoss && e.bar && !e.controlled && !e.removed)
        e.bar.style.animationPlayState = "running";
    }
  });

  window.foyerToast = api;
})();
