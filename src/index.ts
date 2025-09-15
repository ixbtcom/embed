import SERVICES from './services';
import './index.css';
import { debounce } from 'debounce';
import type { ServiceConfig, ServicesConfigType } from './serviceConfig';
import type { API , PatternPasteEventDetail } from '@editorjs/editorjs';

/**
 * @description Embed Tool data
 */
export interface EmbedData {
  /** Service name */
  service: string;
  /** Source URL of embedded content */
  source: string;
  /** URL to source embed page */
  embed: string;
  /** Embedded content width */
  width?: number;
  /** Embedded content height */
  height?: number;
  /** Content caption */
  caption?: string;
  /** Picked oEmbed metadata (flat, top-level keys only) */
  meta?: Record<string, unknown>;
}

/**
 * @description Embed tool configuration object
 */
interface EmbedConfig {
  /** Additional services provided by user */
  services?: ServicesConfigType;
}

/**
 * @description CSS object
 */
interface CSS {
  /** Base class for CSS */
  baseClass: string;
  /** CSS class for input */
  input: string;
  /** CSS class for container */
  container: string;
  /** CSS class for loading container */
  containerLoading: string;
  /** CSS class for preloader */
  preloader: string;
  /** CSS class for caption */
  caption: string;
  /** CSS class for URL */
  url: string;
  /** CSS class for content */
  content: string;
}

interface ConstructorArgs {
  // data — previously saved data
  data: EmbedData;
  // api - Editor.js API
  api: API;
  // readOnly - read-only mode flag
  readOnly: boolean;
}

/**
 * @class Embed
 * @classdesc Embed Tool for Editor.js 2.0
 *
 * @property {object} api - Editor.js API
 * @property {EmbedData} _data - private property with Embed data
 * @property {HTMLElement} element - embedded content container
 *
 * @property {object} services - static property with available services
 * @property {object} patterns - static property with patterns for paste handling configuration
 */
export default class Embed {
  /** Editor.js API */
  private api: API;
  /** Private property with Embed data */
  private _data: EmbedData;
  /** Embedded content container */
  private element: HTMLElement | null;
  /** Read-only mode flag */
  private readOnly: boolean;
  /** Static property with available services */
  static services: { [key: string]: ServiceConfig };
  /** Static property with patterns for paste handling configuration */
  static patterns: { [key: string]: RegExp };
  /**
   * @param {{data: EmbedData, config: EmbedConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   *   readOnly - read-only mode flag
   */
  constructor({ data, api, readOnly }: ConstructorArgs) {
    this.api = api;
    this._data = {} as EmbedData;
    this.element = null;
    this.readOnly = readOnly;

    this.data = data;
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
  set data(data: EmbedData) {
    if (!(data instanceof Object)) {
      throw Error('Embed Tool data should be object');
    }

    const { service, source, embed, width, height, caption = '', meta } = data;

    this._data = {
      service: service || this.data.service,
      source: source || this.data.source,
      embed: embed || this.data.embed,
      width: width || this.data.width,
      height: height || this.data.height,
      caption: caption || this.data.caption || '',
      meta: meta || this.data.meta,
    };

    const oldView = this.element;

    if (oldView) {
      oldView.parentNode?.replaceChild(this.render(), oldView);
    }
  }

  /**
   * @returns {EmbedData}
   */
  get data(): EmbedData {
    if (this.element) {
      const caption = this.element.querySelector(`.${this.api.styles.input}`) as HTMLElement;

      this._data.caption = caption ? caption.innerHTML : '';
    }

    return this._data;
  }

  /**
   * Get plugin styles
   *
   * @returns {object}
   */
  get CSS(): CSS {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      container: 'embed-tool',
      containerLoading: 'embed-tool--loading',
      preloader: 'embed-tool__preloader',
      caption: 'embed-tool__caption',
      url: 'embed-tool__url',
      content: 'embed-tool__content',
    };
  }

  /**
   * Render Embed tool content
   *
   * @returns {HTMLElement}
   */
  render(): HTMLElement {
    if (!this.data.service) {
      const container = document.createElement('div');

      this.element = container;

      return container;
    }

    const service = Embed.services[this.data.service];
    const { html } = service;
    const container = document.createElement('div');
    const caption = document.createElement('div');
    const template = document.createElement('template');
    const preloader = this.createPreloader();

    container.classList.add(this.CSS.baseClass, this.CSS.container, this.CSS.containerLoading);
    caption.classList.add(this.CSS.input, this.CSS.caption);

    container.appendChild(preloader);

    caption.contentEditable = (!this.readOnly).toString();
    caption.dataset.placeholder = this.api.i18n.t('Enter a caption');
    caption.innerHTML = this.data.caption || '';

    // Build template variables for interpolation
    const remoteId = this.computeRemoteId(this.data.service, this.data.source);
    const templateVars: Record<string, unknown> = Object.assign({},
      {
        remote_id: remoteId,
        embed: this.data.embed,
        source: this.data.source,
        service: this.data.service,
        width: this.data.width,
        height: this.data.height,
        caption: this.data.caption,
      },
      this.data.meta || {},
    );

    const htmlInterpolated = this.interpolate(html, templateVars);

    try {
      // eslint-disable-next-line no-console
      console.log('[Embed] render', {
        service: this.data.service,
        templateKeys: Object.keys(templateVars),
        hasMeta: Boolean(this.data.meta),
      });
    } catch (e) { /* noop */ }

    template.innerHTML = htmlInterpolated;
    if (template.content.firstChild) {
      (template.content.firstChild as HTMLElement).classList.add(this.CSS.content);
      // Backward compatibility: if first node has no src and we have embed URL, set it
      if ((template.content.firstChild as HTMLElement).getAttribute &&
        !(template.content.firstChild as HTMLElement).getAttribute('src') && this.data.embed) {
        (template.content.firstChild as HTMLElement).setAttribute('src', this.data.embed);
      }
    }

    const embedIsReady = this.embedIsReady(container);

    if (template.content.firstChild) {
      container.appendChild(template.content.firstChild);
    }
    container.appendChild(caption);

    embedIsReady
      .then(() => {
        container.classList.remove(this.CSS.containerLoading);
      });

    this.element = container;

    return container;
  }

  /**
   * Creates preloader to append to container while data is loading
   *
   * @returns {HTMLElement}
   */
  createPreloader(): HTMLElement {
    const preloader = document.createElement('preloader');
    const url = document.createElement('div');

    url.textContent = this.data.source;

    preloader.classList.add(this.CSS.preloader);
    url.classList.add(this.CSS.url);

    preloader.appendChild(url);

    return preloader;
  }

  /**
   * Save current content and return EmbedData object
   *
   * @returns {EmbedData}
   */
  save(): EmbedData {
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
  onPaste(event: { detail: PatternPasteEventDetail }) {
    const { key: service, data: url } = event.detail;

    const cfg = Embed.services[service];
    const { regex, embedUrl, width, height, id = (ids) => ids.shift() || '' } = cfg;
    const result = regex.exec(url)?.slice(1) || [];
    const remoteId = id(result);

    try {
      // eslint-disable-next-line no-console
      console.log('[Embed] поимка URL', { service, url });
      // eslint-disable-next-line no-console
      console.log(cfg.metaEndpoint ? '[Embed] поймали новый embed (metaEndpoint)' : '[Embed] поймали старый embed (legacy)');
    } catch (e) { /* noop */ }

    // If metaEndpoint is configured, switch to metadata-driven flow
    if (cfg.metaEndpoint) {
      // Initial minimal data: no embed URL; keep width/height from config if provided
      this.data = {
        service,
        source: url,
        embed: '',
        width,
        height,
      };

      // Fetch oEmbed metadata for the full source URL (regex only "matches")
      const endpointUrl = this.buildMetaUrl(cfg.metaEndpoint, url, cfg.metaKey);

      try {
        // eslint-disable-next-line no-console
        console.log('[Embed] meta fetch', { service, endpointUrl });
      } catch (e) { /* noop */ }

      this.fetchJson(endpointUrl)
        .then((json) => {
          if (!json || typeof json !== 'object') return;

          // Determine fields to pick
          const fields = Array.isArray(cfg.metaFields) && cfg.metaFields.length
            ? cfg.metaFields
            : ['type', 'url', 'provider_name', 'title'];

          const pickedMeta = this.pickFields(json as Record<string, unknown>, fields);

          // Optionally take width/height from response if not set explicitly
          const newWidth = this.data.width ?? (json as any).width;
          const newHeight = this.data.height ?? (json as any).height;

          try {
            // eslint-disable-next-line no-console
            console.log('[Embed] meta response', {
              service,
              keys: Object.keys(json as Record<string, unknown>),
              picked: pickedMeta,
              width: newWidth,
              height: newHeight,
            });
          } catch (e) { /* noop */ }

          this.data = {
            ...this.data,
            meta: pickedMeta,
            width: newWidth,
            height: newHeight,
          };
        })
        .catch((err) => {
          try {
            // eslint-disable-next-line no-console
            console.log('[Embed] meta fetch failed', { service, endpointUrl, err });
          } catch (e) { /* noop */ }
          // Silently ignore; fallback rendering already in place
        });

      return;
    }

    // Legacy flow: build embed URL from embedUrl template
    const embed = result.length ? (embedUrl || '').replace(/<%=\s*remote_id\s*%>/g, remoteId) : '';

    try {
      // eslint-disable-next-line no-console
      console.log('[Embed] поймали старый embed (legacy)', { service, url });
      // eslint-disable-next-line no-console
      console.log('[Embed] legacy build', { service, url, remoteId, embedUrl, embed });
    } catch (e) { /* noop */ }

    this.data = {
      service,
      source: url,
      embed,
      width,
      height,
    };
  }

  /**
   * Analyze provided config and make object with services to use
   *
   * @param {EmbedConfig} config - configuration of embed block element
   */
  static prepare({ config = {} } : {config: EmbedConfig}) {
    const { services = {} } = config;

    let entries = Object.entries(SERVICES);

    const enabledServices = Object
      .entries(services)
      .filter(([key, value]) => {
        return typeof value === 'boolean' && value === true;
      })
      .map(([ key ]) => key);

    const userServices = Object
      .entries(services)
      .filter(([key, value]) => {
        return typeof value === 'object';
      })
      .filter(([key, service]) => Embed.checkServiceConfig(service as ServiceConfig))
      .map(([key, service]) => {
        const { regex, embedUrl, html, height, width, id, metaEndpoint, metaKey, metaFields } = service as ServiceConfig;

        return [key, {
          regex,
          embedUrl,
          html,
          height,
          width,
          id,
          metaEndpoint,
          metaKey,
          metaFields,
        } ] as [string, ServiceConfig];
      });

    if (enabledServices.length) {
      entries = entries.filter(([ key ]) => enabledServices.includes(key));
    }

    entries = entries.concat(userServices);

    Embed.services = entries.reduce<{ [key: string]: ServiceConfig }>((result, [key, service]) => {
      if (!(key in result)) {
        result[key] = service as ServiceConfig;

        return result;
      }

      result[key] = Object.assign({}, result[key], service);

      return result;
    }, {});

    Embed.patterns = entries
      .reduce<{ [key: string]: RegExp }>((result, [key, item]) => {
        if (item && typeof item !== 'boolean') {
          result[key] = (item as ServiceConfig).regex as RegExp;
        }

        return result;
      }, {});

    try {
      // eslint-disable-next-line no-console
      console.log('[Embed] services prepared', {
        services: Object.keys(Embed.services || {}),
        patterns: Object.keys(Embed.patterns || {}),
      });
    } catch (e) { /* noop */ }
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
  static checkServiceConfig(config: ServiceConfig): boolean {
    const { regex, embedUrl, html, height, width, id, metaEndpoint } = config;

    let isValid = Boolean(regex && regex instanceof RegExp) &&
      Boolean(html && typeof html === 'string');

    // Either embedUrl or metaEndpoint must be present
    isValid = isValid && Boolean((embedUrl && typeof embedUrl === 'string') || (metaEndpoint && typeof metaEndpoint === 'string'));

    isValid = isValid && (id !== undefined ? id instanceof Function : true);
    isValid = isValid && (height !== undefined ? Number.isFinite(height) : true);
    isValid = isValid && (width !== undefined ? Number.isFinite(width) : true);

    return isValid;
  }

  /**
   * Paste configuration to enable pasted URLs processing by Editor
   *
   * @returns {object} - object of patterns which contain regx for pasteConfig
   */
  static get pasteConfig() {
    return {
      patterns: Embed.patterns,
    };
  }

  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Checks that mutations in DOM have finished after appending iframe content
   *
   * @param {HTMLElement} targetNode - HTML-element mutations of which to listen
   * @returns {Promise<any>} - result that all mutations have finished
   */
  embedIsReady(targetNode: HTMLElement): Promise<void> {
    const PRELOADER_DELAY = 450;

    let observer: MutationObserver;

    return new Promise((resolve, reject) => {
      observer = new MutationObserver(debounce(resolve, PRELOADER_DELAY));
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      });
    }).then(() => {
      observer.disconnect();
    });
  }

  /**
   * Compute remote id using service regex and id() mapper from source URL
   */
  private computeRemoteId(serviceName: string, source: string): string {
    const service = Embed.services[serviceName];
    if (!service || !service.regex) return '';
    const ids = service.regex.exec(source)?.slice(1) || [];
    const idFn = service.id || ((arr: string[]) => arr.shift() || '');
    return idFn(ids);
  }

  /**
   * Simple template interpolation for `<%= key %>` placeholders
   */
  private interpolate(tpl: string, data: Record<string, unknown>): string {
    if (!tpl) return '';
    return tpl.replace(/<%=\s*([a-zA-Z0-9_]+)\s*%>/g, (_m, key) => {
      const v = data[key];
      if (v === undefined || v === null) return '';
      return String(v);
    });
  }

  /**
   * Build meta endpoint URL with url and optional key params
   */
  private buildMetaUrl(endpoint: string, sourceUrl: string, key?: string): string {
    const url = `${endpoint}?url=${encodeURIComponent(sourceUrl)}`;
    if (key) {
      return `${url}&key=${encodeURIComponent(key)}`;
    }
    return url;
  }

  /**
   * Fetch JSON with basic error handling
   */
  private async fetchJson(url: string): Promise<unknown> {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 10000);
    try {
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: controller.signal });
      clearTimeout(to);
      if (!resp.ok) throw new Error('Bad status');
      return await resp.json();
    } finally {
      clearTimeout(to);
    }
  }

  /**
   * Pick only allowed top-level fields from a meta object
   */
  private pickFields(obj: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const k of fields) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        out[k] = obj[k];
      }
    }
    return out;
  }
}
