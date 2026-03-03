(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode('.embed-tool--loading .embed-tool__caption{display:none}.embed-tool--loading .embed-tool__preloader{display:block}.embed-tool--loading .embed-tool__content{display:none}.embed-tool__preloader{display:none;position:relative;height:200px;box-sizing:border-box;border-radius:5px;border:1px solid #e6e9eb}.embed-tool__preloader:before{content:"";position:absolute;z-index:3;left:50%;top:50%;width:30px;height:30px;margin-top:-25px;margin-left:-15px;border-radius:50%;border:2px solid #cdd1e0;border-top-color:#388ae5;box-sizing:border-box;animation:embed-preloader-spin 2s infinite linear}.embed-tool__url{position:absolute;bottom:20px;left:50%;transform:translate(-50%);max-width:250px;color:#7b7e89;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.embed-tool__content{width:100%}.embed-tool__caption{margin-top:7px}.embed-tool__caption[contentEditable=true][data-placeholder]:before{position:absolute;content:attr(data-placeholder);color:#707684;font-weight:400;opacity:0}.embed-tool__caption[contentEditable=true][data-placeholder]:empty:before{opacity:1}.embed-tool__caption[contentEditable=true][data-placeholder]:empty:focus:before{opacity:0}@keyframes embed-preloader-spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}')),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
const S = {
  vimeo: {
    regex: /(?:http[s]?:\/\/)?(?:www.)?(?:player.)?vimeo\.co(?:.+\/([^\/]\d+)(?:#t=[\d]+)?s?$)/,
    embedUrl: "https://player.vimeo.com/video/<%= remote_id %>?title=0&byline=0",
    html: '<iframe style="width:100%;" height="320" frameborder="0"></iframe>',
    height: 320,
    width: 580
  },
  youtube: {
    regex: /(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be\/)|(?:youtube\.com)\/(?:v\/|u\/\w\/|embed\/|watch))(?:(?:\?v=)?([^#&?=]*))?((?:[?&]\w*=\w*)*)/,
    embedUrl: "https://www.youtube.com/embed/<%= remote_id %>",
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580,
    id: ([n, i]) => {
      if (!i && n)
        return n;
      const r = {
        start: "start",
        end: "end",
        t: "start",
        // eslint-disable-next-line camelcase
        time_continue: "start",
        list: "list"
      };
      let e = i.slice(1).split("&").map((t) => {
        const [s, a] = t.split("=");
        return !n && s === "v" ? (n = a, null) : !r[s] || a === "LL" || a.startsWith("RDMM") || a.startsWith("FL") ? null : `${r[s]}=${a}`;
      }).filter((t) => !!t);
      return n + "?" + e.join("&");
    }
  },
  coub: {
    regex: /https?:\/\/coub\.com\/view\/([^\/\?\&]+)/,
    embedUrl: "https://coub.com/embed/<%= remote_id %>",
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580
  },
  vine: {
    regex: /https?:\/\/vine\.co\/v\/([^\/\?\&]+)/,
    embedUrl: "https://vine.co/v/<%= remote_id %>/embed/simple/",
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580
  },
  imgur: {
    regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
    embedUrl: "http://imgur.com/<%= remote_id %>/embed",
    html: '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000"></iframe>',
    height: 500,
    width: 540
  },
  gfycat: {
    regex: /https?:\/\/gfycat\.com(?:\/detail)?\/([a-zA-Z]+)/,
    embedUrl: "https://gfycat.com/ifr/<%= remote_id %>",
    html: `<iframe frameborder='0' scrolling='no' style="width:100%;" height='436' allowfullscreen ></iframe>`,
    height: 436,
    width: 580
  },
  "twitch-channel": {
    regex: /https?:\/\/www\.twitch\.tv\/([^\/\?\&]*)\/?$/,
    embedUrl: "https://player.twitch.tv/?channel=<%= remote_id %>",
    html: '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600
  },
  "twitch-video": {
    regex: /https?:\/\/www\.twitch\.tv\/(?:[^\/\?\&]*\/v|videos)\/([0-9]*)/,
    embedUrl: "https://player.twitch.tv/?video=v<%= remote_id %>",
    html: '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600
  },
  "yandex-music-album": {
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/?$/,
    embedUrl: "https://music.yandex.ru/iframe/#album/<%= remote_id %>/",
    html: '<iframe frameborder="0" style="border:none;width:540px;height:400px;" style="width:100%;" height="400"></iframe>',
    height: 400,
    width: 540
  },
  "yandex-music-track": {
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/track\/([0-9]*)/,
    embedUrl: "https://music.yandex.ru/iframe/#track/<%= remote_id %>/",
    html: '<iframe frameborder="0" style="border:none;width:540px;height:100px;" style="width:100%;" height="100"></iframe>',
    height: 100,
    width: 540,
    id: (n) => n.join("/")
  },
  "yandex-music-playlist": {
    regex: /https?:\/\/music\.yandex\.ru\/users\/([^\/\?\&]*)\/playlists\/([0-9]*)/,
    embedUrl: "https://music.yandex.ru/iframe/#playlist/<%= remote_id %>/show/cover/description/",
    html: '<iframe frameborder="0" style="border:none;width:540px;height:400px;" width="540" height="400"></iframe>',
    height: 400,
    width: 540,
    id: (n) => n.join("/")
  },
  codepen: {
    regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
    embedUrl: "https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2",
    html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
    height: 300,
    width: 600,
    id: (n) => n.join("/embed/")
  },
  instagram: {
    //it support both reel and post
    regex: /^https:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/(.*)/,
    embedUrl: "https://www.instagram.com/p/<%= remote_id %>/embed",
    html: '<iframe width="400" height="505" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 505,
    width: 400,
    id: (n) => {
      var i;
      return (i = n == null ? void 0 : n[0]) == null ? void 0 : i.split("/")[0];
    }
  },
  twitter: {
    regex: /^https?:\/\/(www\.)?(?:twitter\.com|x\.com)\/.+\/status\/(\d+)/,
    embedUrl: "https://platform.twitter.com/embed/Tweet.html?id=<%= remote_id %>",
    html: '<iframe width="600" height="600" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 300,
    width: 600,
    id: (n) => n[1]
  },
  pinterest: {
    regex: /https?:\/\/([^\/\?\&]*).pinterest.com\/pin\/([^\/\?\&]*)\/?$/,
    embedUrl: "https://assets.pinterest.com/ext/embed.html?id=<%= remote_id %>",
    html: "<iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; min-height: 400px; max-height: 1000px;'></iframe>",
    id: (n) => n[1]
  },
  facebook: {
    regex: /https?:\/\/www.facebook.com\/([^\/\?\&]*)\/(.*)/,
    embedUrl: "https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/<%= remote_id %>&width=500",
    html: "<iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; min-height: 500px; max-height: 1000px;'></iframe>",
    id: (n) => n.join("/")
  },
  aparat: {
    regex: /(?:http[s]?:\/\/)?(?:www.)?aparat\.com\/v\/([^\/\?\&]+)\/?/,
    embedUrl: "https://www.aparat.com/video/video/embed/videohash/<%= remote_id %>/vt/frame",
    html: '<iframe width="600" height="300" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 300,
    width: 600
  },
  miro: {
    regex: /https:\/\/miro.com\/\S+(\S{12})\/(\S+)?/,
    embedUrl: "https://miro.com/app/live-embed/<%= remote_id %>",
    html: '<iframe width="700" height="500" style="margin: 0 auto;" allowFullScreen frameBorder="0" scrolling="no"></iframe>'
  },
  github: {
    regex: /https?:\/\/gist.github.com\/([^\/\?\&]*)\/([^\/\?\&]*)/,
    embedUrl: 'data:text/html;charset=utf-8,<head><base target="_blank" /></head><body><script src="https://gist.github.com/<%= remote_id %>" ><\/script></body>',
    html: '<iframe width="100%" height="350" frameborder="0" style="margin: 0 auto;"></iframe>',
    height: 300,
    width: 600,
    id: (n) => `${n.join("/")}.js`
  }
};
function w(n, i, r) {
  var e, t, s, a, o;
  i == null && (i = 100);
  function d() {
    var h = Date.now() - a;
    h < i && h >= 0 ? e = setTimeout(d, i - h) : (e = null, r || (o = n.apply(s, t), s = t = null));
  }
  var l = function() {
    s = this, t = arguments, a = Date.now();
    var h = r && !e;
    return e || (e = setTimeout(d, i)), h && (o = n.apply(s, t), s = t = null), o;
  };
  return l.clear = function() {
    e && (clearTimeout(e), e = null);
  }, l.flush = function() {
    e && (o = n.apply(s, t), s = t = null, clearTimeout(e), e = null);
  }, l;
}
w.debounce = w;
var _ = w;
class m {
  /**
   * @param {{data: EmbedData, config: EmbedConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   *   readOnly - read-only mode flag
   */
  constructor({ data: i, api: r, readOnly: e }) {
    this.api = r, this._data = {}, this.element = null, this.readOnly = e, this.data = i;
  }
  /**
   * @param {EmbedData} data - embed data
   * @param {RegExp} [data.regex] - pattern of source URLs
   * @param {string} [data.embedUrl] - URL scheme to embedded page. Use '<%= remote_id %>' to define a place to insert resource id
   * @param {string} [data.html] - iframe which contains embedded content
   * @param {number} [data.height] - iframe height
   * @param {number} [data.width] - iframe width
   * @param {string} [data.caption] - caption
   */
  set data(i) {
    var h;
    if (!(i instanceof Object))
      throw Error("Embed Tool data should be object");
    const { service: r, source: e, embed: t, width: s, height: a, caption: o = "", meta: d } = i;
    this._data = {
      service: r || this.data.service,
      source: e || this.data.source,
      embed: t || this.data.embed,
      width: s || this.data.width,
      height: a || this.data.height,
      caption: o || this.data.caption || "",
      meta: d || this.data.meta
    };
    const l = this.element;
    l && ((h = l.parentNode) == null || h.replaceChild(this.render(), l));
  }
  /**
   * @returns {EmbedData}
   */
  get data() {
    if (this.element) {
      const i = this.element.querySelector(`.${this.api.styles.input}`);
      this._data.caption = i ? i.innerHTML : "";
    }
    return this._data;
  }
  /**
   * Get plugin styles
   *
   * @returns {object}
   */
  get CSS() {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      container: "embed-tool",
      containerLoading: "embed-tool--loading",
      preloader: "embed-tool__preloader",
      caption: "embed-tool__caption",
      url: "embed-tool__url",
      content: "embed-tool__content"
    };
  }
  /**
   * Render Embed tool content
   *
   * @returns {HTMLElement}
   */
  render() {
    if (!this.data.service) {
      const p = document.createElement("div");
      return this.element = p, p;
    }
    const i = m.services[this.data.service], { html: r } = i, e = document.createElement("div"), t = document.createElement("div"), s = document.createElement("template"), a = this.createPreloader();
    e.classList.add(this.CSS.baseClass, this.CSS.container, this.CSS.containerLoading), t.classList.add(this.CSS.input, this.CSS.caption), e.appendChild(a), t.contentEditable = (!this.readOnly).toString(), t.dataset.placeholder = this.api.i18n.t("Enter a caption"), t.innerHTML = this.data.caption || "";
    const o = this.computeRemoteId(this.data.service, this.data.source), d = Object.assign(
      {},
      {
        remote_id: o,
        embed: this.data.embed,
        source: this.data.source,
        service: this.data.service,
        width: this.data.width,
        height: this.data.height,
        caption: this.data.caption
      },
      this.data.meta || {}
    ), l = this.interpolate(r, d);
    try {
      console.log("[Embed] render", {
        service: this.data.service,
        templateKeys: Object.keys(d),
        hasMeta: !!this.data.meta
      });
    } catch {
    }
    s.innerHTML = l, s.content.firstChild && (s.content.firstChild.classList.add(this.CSS.content), s.content.firstChild.getAttribute && !s.content.firstChild.getAttribute("src") && this.data.embed && s.content.firstChild.setAttribute("src", this.data.embed));
    const h = this.embedIsReady(e);
    return s.content.firstChild && e.appendChild(s.content.firstChild), e.appendChild(t), h.then(() => {
      e.classList.remove(this.CSS.containerLoading);
    }), this.element = e, e;
  }
  /**
   * Creates preloader to append to container while data is loading
   *
   * @returns {HTMLElement}
   */
  createPreloader() {
    const i = document.createElement("preloader"), r = document.createElement("div");
    return r.textContent = this.data.source, i.classList.add(this.CSS.preloader), r.classList.add(this.CSS.url), i.appendChild(r), i;
  }
  /**
   * Save current content and return EmbedData object
   *
   * @returns {EmbedData}
   */
  save() {
    return this.data;
  }
  /**
   * Handle pasted URL and switch logic based on service configuration.
   * - Meta-driven branch: if `metaEndpoint` is configured for the service, we
   *   treat regex as a mere matcher (the entire source URL goes to oEmbed),
   *   fetch metadata, whitelist top-level fields per `metaFields` and store
   *   them into `data.meta`. Width/height can be adopted from the response
   *   if not provided explicitly in config.
   * - Legacy branch: if `metaEndpoint` is not configured, we extract
   *   `remote_id` via `regex` + `id()` and build `embed` from `embedUrl`.
   * In both cases, assigning `this.data` triggers re-render.
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(i) {
    var g;
    const { key: r, data: e } = i.detail, t = m.services[r], { regex: s, embedUrl: a, width: o, height: d, id: l = (u) => u.shift() || "" } = t, h = ((g = s.exec(e)) == null ? void 0 : g.slice(1)) || [], p = l(h);
    try {
      console.log("[Embed] поимка URL", { service: r, url: e }), console.log(t.metaEndpoint ? "[Embed] поймали новый embed (metaEndpoint)" : "[Embed] поймали старый embed (legacy)");
    } catch {
    }
    if (t.metaEndpoint) {
      this.data = {
        service: r,
        source: e,
        embed: "",
        width: o,
        height: d
      };
      const u = this.buildMetaUrl(t.metaEndpoint, e, t.metaKey);
      try {
        console.log("[Embed] meta fetch", { service: r, endpointUrl: u });
      } catch {
      }
      this.fetchJson(u).then((c) => {
        if (!c || typeof c != "object")
          return;
        const b = Array.isArray(t.metaFields) && t.metaFields.length ? t.metaFields : ["type", "url", "provider_name", "title"], y = this.pickFields(c, b), v = this.data.width ?? c.width, x = this.data.height ?? c.height;
        try {
          console.log("[Embed] meta response", {
            service: r,
            keys: Object.keys(c),
            picked: y,
            width: v,
            height: x
          });
        } catch {
        }
        this.data = {
          ...this.data,
          meta: y,
          width: v,
          height: x
        };
      }).catch((c) => {
        try {
          console.log("[Embed] meta fetch failed", { service: r, endpointUrl: u, err: c });
        } catch {
        }
      });
      return;
    }
    const f = h.length ? (a || "").replace(/<%=\s*remote_id\s*%>/g, p) : "";
    try {
      console.log("[Embed] поймали старый embed (legacy)", { service: r, url: e }), console.log("[Embed] legacy build", { service: r, url: e, remoteId: p, embedUrl: a, embed: f });
    } catch {
    }
    this.data = {
      service: r,
      source: e,
      embed: f,
      width: o,
      height: d
    };
  }
  /**
   * Analyze provided config and make object with services to use
   *
   * @param {EmbedConfig} config - configuration of embed block element
   */
  static prepare({ config: i = {} }) {
    const { services: r = {} } = i;
    let e = Object.entries(S);
    const t = Object.entries(r).filter(([a, o]) => typeof o == "boolean" && o === !0).map(([a]) => a), s = Object.entries(r).filter(([a, o]) => typeof o == "object").filter(([a, o]) => m.checkServiceConfig(o)).map(([a, o]) => {
      const { regex: d, embedUrl: l, html: h, height: p, width: f, id: g, metaEndpoint: u, metaKey: c, metaFields: b } = o;
      return [a, {
        regex: d,
        embedUrl: l,
        html: h,
        height: p,
        width: f,
        id: g,
        metaEndpoint: u,
        metaKey: c,
        metaFields: b
      }];
    });
    t.length && (e = e.filter(([a]) => t.includes(a))), e = e.concat(s), m.services = e.reduce((a, [o, d]) => o in a ? (a[o] = Object.assign({}, a[o], d), a) : (a[o] = d, a), {}), m.patterns = e.reduce((a, [o, d]) => (d && typeof d != "boolean" && (a[o] = d.regex), a), {});
    try {
      console.log("[Embed] services prepared", {
        services: Object.keys(m.services || {}),
        patterns: Object.keys(m.patterns || {})
      });
    } catch {
    }
  }
  /**
   * Check if Service config is valid and determine available branches.
   * Valid config must contain:
   *  - regex: RegExp
   *  - html: string
   *  - and either embedUrl (legacy branch) or metaEndpoint (meta branch)
   *
   * @param {Service} config - configuration of embed block element
   * @returns {boolean}
   */
  static checkServiceConfig(i) {
    const { regex: r, embedUrl: e, html: t, height: s, width: a, id: o, metaEndpoint: d } = i;
    let l = !!(r && r instanceof RegExp) && !!(t && typeof t == "string");
    return l = l && !!(e && typeof e == "string" || d && typeof d == "string"), l = l && (o !== void 0 ? o instanceof Function : !0), l = l && (s !== void 0 ? Number.isFinite(s) : !0), l = l && (a !== void 0 ? Number.isFinite(a) : !0), l;
  }
  /**
   * Paste configuration to enable pasted URLs processing by Editor
   *
   * @returns {object} - object of patterns which contain regx for pasteConfig
   */
  static get pasteConfig() {
    return {
      patterns: m.patterns
    };
  }
  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return !0;
  }
  /**
   * Checks that mutations in DOM have finished after appending iframe content
   *
   * @param {HTMLElement} targetNode - HTML-element mutations of which to listen
   * @returns {Promise<any>} - result that all mutations have finished
   */
  embedIsReady(i) {
    let e;
    return new Promise((t, s) => {
      e = new MutationObserver(_.debounce(t, 450)), e.observe(i, {
        childList: !0,
        subtree: !0
      });
    }).then(() => {
      e.disconnect();
    });
  }
  /**
   * Compute remote id using service regex and id() mapper from source URL
   */
  computeRemoteId(i, r) {
    var a;
    const e = m.services[i];
    if (!e || !e.regex)
      return "";
    const t = ((a = e.regex.exec(r)) == null ? void 0 : a.slice(1)) || [];
    return (e.id || ((o) => o.shift() || ""))(t);
  }
  /**
   * Simple template interpolation for `<%= key %>` placeholders
   */
  interpolate(i, r) {
    return i ? i.replace(/<%=\s*([a-zA-Z0-9_]+)\s*%>/g, (e, t) => {
      const s = r[t];
      return s == null ? "" : String(s);
    }) : "";
  }
  /**
   * Build meta endpoint URL with url and optional key params
   */
  buildMetaUrl(i, r, e) {
    const t = `${i}?url=${encodeURIComponent(r)}`;
    return e ? `${t}&key=${encodeURIComponent(e)}` : t;
  }
  /**
   * Fetch JSON with basic error handling
   */
  async fetchJson(i) {
    const r = new AbortController(), e = setTimeout(() => r.abort(), 1e4);
    try {
      const t = await fetch(i, { headers: { Accept: "application/json" }, signal: r.signal });
      if (clearTimeout(e), !t.ok)
        throw new Error("Bad status");
      return await t.json();
    } finally {
      clearTimeout(e);
    }
  }
  /**
   * Pick only allowed top-level fields from a meta object
   */
  pickFields(i, r) {
    const e = {};
    for (const t of r)
      Object.prototype.hasOwnProperty.call(i, t) && (e[t] = i[t]);
    return e;
  }
}
export {
  m as default
};
