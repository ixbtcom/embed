
/**
 * @description Service configuration object
 */
export interface ServiceConfig {
  /** Pattern of source URLs */
  regex: RegExp;
  /** URL scheme to embedded page. Use '<%= remote_id %>' to define a place to insert resource id */
  embedUrl?: string;
  /** Iframe which contains embedded content */
  html: string;
  /** Function to get resource id from RegExp groups */
  id?: (ids: string[]) => string;
  /** Embedded content width */
  width?: number;
  /** Embedded content height */
  height?: number;
  /** Optional oEmbed endpoint: if present, new meta-driven branch is used.
   *  Regex only validates a match; the full source URL will be sent to this endpoint
   *  as `?url=...` (plus `&key=...` if metaKey is provided). */
  metaEndpoint?: string;
  /** Optional API key for metaEndpoint; if not provided, `&key` is not added. */
  metaKey?: string;
  /** Optional whitelist of top-level fields to persist and expose in templates.
   *  If not provided, defaults to ['type','url','provider_name','title']. */
  metaFields?: string[];
}

/**
 * @description Type for services configuration
 */
export type ServicesConfigType = { [key: string]: ServiceConfig | boolean };
