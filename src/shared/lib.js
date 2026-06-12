






(function () {
  var F = window.F || (window.F = {});

  F.esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  F.escAttr = function (s) { return F.esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); };

  F.$ = function (sel, root) { return (root || document).querySelector(sel); };
  F.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  F.on = function (t, ev, fn, opts) { if (t) t.addEventListener(ev, fn, opts); return fn; };
  F.el = function (tag, props, kids) {
    var e = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === 'class') e.className = props[k];
      else if (k === 'style' && props[k] && typeof props[k] === 'object') Object.assign(e.style, props[k]);
      else if (k === 'html') e.innerHTML = props[k];
      else if (k === 'text') e.textContent = props[k];
      else if (k.slice(0, 2) === 'on' && typeof props[k] === 'function') e.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (props[k] != null) e.setAttribute(k, props[k]);
    }
    (kids == null ? [] : [].concat(kids)).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  };

  F.store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? (d === undefined ? null : d) : v; } catch (e) { return d === undefined ? null : d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    json: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : (d === undefined ? null : d); } catch (e) { return d === undefined ? null : d; } }
  };

  F.fmt = {

    bytes: function (b) { b = Number(b) || 0; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB'; return (b / 1073741824).toFixed(1) + ' GB'; },

    timeAgo: function (str) { var d = new Date(String(str).endsWith('Z') ? str : str + 'Z'); var s = Math.floor((Date.now() - d) / 1000); if (s < 60) return 'just now'; var m = Math.floor(s / 60); if (m < 60) return m + 'm ago'; var h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; return Math.floor(h / 24) + 'd ago'; },

    ago: function (input) {
      var raw = String(input || ''); var d = (input instanceof Date) ? input : new Date(raw.replace(' ', 'T') + (/(Z|[+-]\d\d:?\d\d)$/.test(raw) ? '' : 'Z'));
      var s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
      if (s < 60) return s + 's'; if (s < 3600) return Math.floor(s / 60) + 'm';
      if (s < 86400) return Math.floor(s / 3600) + 'h'; if (s < 2592000) return Math.floor(s / 86400) + 'd';
      return d.toLocaleDateString();
    },

    rgb: function (hex, a) {
      try { var h = String(hex || '').replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; var n = parseInt(h, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return a == null ? ('rgb(' + r + ',' + g + ',' + b + ')') : ('rgba(' + r + ',' + g + ',' + b + ',' + a + ')'); } catch (e) { return hex; }
    }
  };

  F.debounce = function (fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 200); }; };
  F.clamp = function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); };

  F.api = function (path, opts) {
    opts = opts || {};
    var headers = Object.assign({}, opts.headers), body = opts.body;
    if (body != null && typeof body === 'object' && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
    return fetch(path, { method: opts.method || (body ? 'POST' : 'GET'), headers: headers, body: body, credentials: opts.credentials }).then(function (r) {
      return r.text().then(function (t) {
        var d; try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
        if (!r.ok) { var err = new Error((d && d.error) || ('HTTP ' + r.status)); err.status = r.status; err.data = d; throw err; }
        return d;
      });
    });
  };
})();
