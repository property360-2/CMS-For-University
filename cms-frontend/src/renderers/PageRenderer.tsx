// cms-frontend/src/renderers/PageRenderer.tsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";

/* ============================
   Types
   ============================ */

/** Basic flexible map for arbitrary props/attributes coming from JSON */
type AttrMap = Record<string, unknown>;

/** Generic JSON node that renderer understands */
export type JSONNode = {
  tag?: string; // e.g. 'section', 'h1', 'a', 'img', or custom
  type?: string; // legacy discriminant (hero, features, cta, navbar, footer)
  props?: AttrMap;
  className?: string;
  style?: React.CSSProperties;
  text?: string;
  html?: string; // raw HTML, allowed only if sanitized by caller
  children?: Array<JSONNode | string>;
  // allow other arbitrary attributes like id, role, aria-*
  [key: string]: unknown;
};

/** Page shape returned by your API or passed as prop */
export interface PageAPI {
  id?: string;
  title?: string;
  content_json?: {
    blocks?: Array<JSONNode | LegacyBlock>;
  };
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  [key: string]: unknown;
}

/** Legacy block shapes (subset) used for normalizeBlockToNode */
type LegacyHero = {
  type: "hero";
  headline?: string;
  subtext?: string;
  button?: { label?: string; link?: string };
  background_image?: string;
  classes?: string;
  headline_classes?: string;
  subtext_classes?: string;
  button_classes?: string;
  container_classes?: string;
  [key: string]: unknown;
};

type LegacyFeaturesItem = {
  icon?: string;
  title?: string;
  description?: string;
  classes?: string;
  icon_classes?: string;
  title_classes?: string;
  description_classes?: string;
  [key: string]: unknown;
};

type LegacyFeatures = {
  type: "features";
  title?: string;
  items?: LegacyFeaturesItem[];
  classes?: string;
  container_classes?: string;
  title_classes?: string;
  [key: string]: unknown;
};

type LegacyCTA = {
  type: "cta";
  text?: string;
  button?: { label?: string; link?: string };
  classes?: string;
  text_classes?: string;
  button_classes?: string;
  container_classes?: string;
  [key: string]: unknown;
};

type LegacyNavbar = {
  type: "navbar";
  brand?: { text?: string; link?: string };
  links?: Array<{ label?: string; href?: string }>;
  cta?: { label?: string; href?: string };
  classes?: string;
  container_classes?: string;
  brand_classes?: string;
  links_classes?: string;
  link_classes?: string;
  cta_classes?: string;
  [key: string]: unknown;
};

type LegacyFooter = {
  type: "footer";
  columns?: Array<{
    heading?: string;
    links?: Array<{ label?: string; href?: string }>;
  }>;
  copyright?: string;
  classes?: string;
  container_classes?: string;
  heading_classes?: string;
  link_classes?: string;
  [key: string]: unknown;
};

type LegacyBlock =
  | LegacyHero
  | LegacyFeatures
  | LegacyCTA
  | LegacyNavbar
  | LegacyFooter
  | Record<string, unknown>;

/* ============================
   Component Props
   ============================ */

export default function PageRenderer({
  id,
  pageJson,
  componentMap,
  enableSEO = true,
  sanitizeHtml,
}: {
  id?: string;
  pageJson?: PageAPI;
  componentMap?: Record<string, React.ComponentType<unknown>>;
  enableSEO?: boolean;
  sanitizeHtml?: (html: string) => string;
}) {
  const [page, setPage] = useState<PageAPI | null>(pageJson ?? null);
  const [loading, setLoading] = useState<boolean>(!page && !!id);
  const [error, setError] = useState<unknown | null>(null);

  // fetch page by id if provided and no pageJson passed
  useEffect(() => {
    if (!id || pageJson) return;
    setLoading(true);
    API.get<PageAPI>(`pages/${id}/`)
      .then((res) => {
        const incoming = res.data;
        // normalize legacy blocks (if any)
        if (incoming?.content_json?.blocks) {
          incoming.content_json.blocks = incoming.content_json.blocks.map((b) =>
            normalizeBlockToNode(b)
          );
        }
        setPage(incoming);
      })
      .catch((err) => {
        console.warn("Page fetch failed:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [id, pageJson]);

  // accept pageJson prop changes; normalize if needed
  useEffect(() => {
    if (!pageJson) return;
    const copy: PageAPI = JSON.parse(JSON.stringify(pageJson));
    if (copy?.content_json?.blocks) {
      copy.content_json.blocks = copy.content_json.blocks.map((b) =>
        normalizeBlockToNode(b)
      );
    }
    setPage(copy);
  }, [pageJson]);

  // SEO (title + meta description)
  useEffect(() => {
    if (!enableSEO || !page) return;
    if (
      typeof page.seo_meta?.title === "string" &&
      page.seo_meta.title.length > 0
    ) {
      document.title = page.seo_meta.title;
    } else if (typeof page.title === "string") {
      document.title = page.title;
    }
    if (typeof page.seo_meta?.description === "string") {
      let el = document.querySelector(
        'meta[name="description"]'
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.name = "description";
        document.head.appendChild(el);
      }
      el.content = page.seo_meta.description;
    }
  }, [enableSEO, page]);

  const isExternalLink = (href?: unknown): boolean =>
    typeof href === "string" &&
    /^https?:\/\//.test(href) &&
    !href.includes(window.location.host);

  if (loading)
    return (
      <div role="status" aria-busy="true">
        Loading page…
      </div>
    );
  if (error) return <div role="alert">Failed to load page.</div>;
  if (!page) return <div>No page data.</div>;

  const blocks = page.content_json?.blocks ?? [];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white p-2 rounded shadow"
      >
        Skip to main content
      </a>

      {blocks.map((blk, i) => (
        <React.Fragment key={i}>
          {renderNode(blk as JSONNode, {
            componentMap,
            isExternalLink,
            sanitizeHtml,
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============================
   renderNode: typed recursive renderer
   ============================ */

function renderNode(
  node: JSONNode | string | LegacyBlock,
  options: {
    componentMap?: Record<string, React.ComponentType<unknown>>;
    isExternalLink?: (href?: unknown) => boolean;
    sanitizeHtml?: (html: string) => string;
  } = {}
): React.ReactNode {
  if (node == null) return null;
  if (typeof node === "string") return node;

  // If legacy block (has type and not tag), normalize
  const maybeNode =
    isJSONNode(node) && node.tag ? node : normalizeBlockToNode(node);

  const tag = (maybeNode.tag ?? "div").toLowerCase();

  // Extract known fields safely
  const propsFromNode =
    maybeNode.props && typeof maybeNode.props === "object"
      ? maybeNode.props
      : {};
  const className =
    typeof maybeNode.className === "string" ? maybeNode.className : undefined;
  const style =
    maybeNode.style && typeof maybeNode.style === "object"
      ? maybeNode.style
      : undefined;
  const text = typeof maybeNode.text === "string" ? maybeNode.text : undefined;
  const html = typeof maybeNode.html === "string" ? maybeNode.html : undefined;
  const children = Array.isArray(maybeNode.children)
    ? maybeNode.children
    : undefined;

  // build safeProps: copy propsFromNode then merge attributes (id, role, aria-*, href, src)
  const safeProps: AttrMap = { ...(propsFromNode as AttrMap) };

  if (className) safeProps.className = className;
  if (style) safeProps.style = style;

  // copy other attributes at top-level of node (id, role, aria-*)
  for (const key of Object.keys(maybeNode)) {
    if (
      ![
        "tag",
        "type",
        "props",
        "className",
        "style",
        "text",
        "html",
        "children",
      ].includes(key)
    ) {
      if ((safeProps as AttrMap)[key] === undefined) {
        (safeProps as AttrMap)[key] = (maybeNode as JSONNode)[key];
      }
    }
  }

  // Accessibility helpers
  if (tag === "img") {
    if ((safeProps as AttrMap).loading === undefined)
      (safeProps as AttrMap).loading = "lazy";
    if ((safeProps as AttrMap).alt === undefined) {
      console.warn("Image missing alt attribute:", maybeNode);
      (safeProps as AttrMap).alt = "";
    }
  }

  if (
    tag === "a" &&
    typeof (safeProps as AttrMap).href === "string" &&
    options.isExternalLink
  ) {
    if (options.isExternalLink((safeProps as AttrMap).href)) {
      if ((safeProps as AttrMap).target === undefined)
        (safeProps as AttrMap).target = "_blank";
      const existingRel =
        typeof (safeProps as AttrMap).rel === "string"
          ? (safeProps as AttrMap).rel.split(/\s+/).filter(Boolean)
          : [];
      if (!existingRel.includes("noopener")) existingRel.push("noopener");
      if (!existingRel.includes("noreferrer")) existingRel.push("noreferrer");
      (safeProps as AttrMap).rel = existingRel.join(" ");
    }
  }

  // Decide children rendering
  let renderedChildren: React.ReactNode = null;
  if (text !== undefined) {
    renderedChildren = text;
  } else if (html !== undefined) {
    if (!options.sanitizeHtml) {
      console.warn(
        "renderNode: html provided but no sanitizeHtml — skipping raw HTML for safety."
      );
      renderedChildren = null;
    } else {
      const clean = options.sanitizeHtml(html);
      renderedChildren = React.createElement("span", {
        dangerouslySetInnerHTML: { __html: clean },
      });
    }
  } else if (children) {
    renderedChildren = children.map((c, idx) =>
      renderNode(c as JSONNode | string | LegacyBlock, options)
    );
  }

  // Map to custom component if provided
  const Custom = options.componentMap?.[tag];

  // React.createElement expects any props; cast safeProps to any at callsite but keep types upstream
  const elementProps = safeProps as Record<string, unknown>;

  if (Custom) {
    return React.createElement(Custom, elementProps, renderedChildren);
  }

  try {
    return React.createElement(tag as any, elementProps, renderedChildren);
  } catch (err) {
    console.warn("Invalid tag in JSON node; falling back to div:", tag, err);
    return React.createElement("div", elementProps, renderedChildren);
  }
}

/* ============================
   Helpers: type guards & normalization
   ============================ */

function isJSONNode(x: unknown): x is JSONNode {
  return (
    !!x &&
    typeof x === "object" &&
    ("tag" in (x as Record<string, unknown>) ||
      "children" in (x as Record<string, unknown>))
  );
}

/**
 * normalizeBlockToNode
 * Converts legacy blocks (type: 'hero'|'features'|'cta'|'navbar'|'footer' or generic object)
 * into JSONNode shapes compatible with renderNode.
 */
function normalizeBlockToNode(b: unknown): JSONNode {
  if (!b || typeof b !== "object") {
    return { tag: "div", text: String(b) };
  }

  const obj = b as Record<string, unknown>;

  // if already a node with tag/children, pass through (cast)
  if (obj.tag || obj.children) {
    return obj as JSONNode;
  }

  // if no type, try to convert generic content object
  if (!obj.type) {
    const children: JSONNode[] = [];
    if (typeof obj.title === "string")
      children.push({ tag: "h2", text: obj.title });
    if (typeof obj.body === "string")
      children.push({ tag: "p", text: obj.body });
    return {
      tag: "section",
      className: typeof obj.classes === "string" ? obj.classes : undefined,
      children,
      ...obj,
    };
  }

  const t = String(obj.type).toLowerCase();

  // Hero
  if (t === "hero") {
    const hero = obj as LegacyHero;
    const children: JSONNode[] = [
      {
        tag: "div",
        className:
          typeof hero.container_classes === "string"
            ? hero.container_classes
            : "max-w-4xl mx-auto px-6",
        children: [
          {
            tag: "h1",
            className: hero.headline_classes ?? "text-4xl font-bold mb-4",
            text: hero.headline,
          },
          {
            tag: "p",
            className: hero.subtext_classes ?? "text-lg mb-6",
            text: hero.subtext,
          },
          hero.button
            ? {
                tag: "a",
                props: { href: hero.button.link },
                className:
                  hero.button_classes ??
                  "px-6 py-3 bg-blue-600 text-white rounded",
                text: hero.button.label,
              }
            : null,
        ].filter(Boolean) as JSONNode[],
      },
    ];
    return {
      tag: "header",
      className: hero.classes ?? "text-center py-16",
      style: hero.background_image
        ? {
            backgroundImage: `url(${hero.background_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : undefined,
      children,
      ...obj,
    };
  }

  // Features
  if (t === "features") {
    const feats = obj as LegacyFeatures;
    const items = Array.isArray(feats.items) ? feats.items : [];
    const itemNodes: JSONNode[] = items.map((item) => ({
      tag: "div",
      className:
        typeof item.classes === "string"
          ? item.classes
          : "p-6 rounded-lg shadow text-center",
      children: [
        item.icon
          ? {
              tag: "div",
              className: item.icon_classes ?? "text-3xl mb-2",
              text: item.icon,
            }
          : null,
        {
          tag: "h3",
          className: item.title_classes ?? "text-xl font-semibold",
          text: item.title,
        },
        {
          tag: "p",
          className: item.description_classes ?? "text-gray-600",
          text: item.description,
        },
      ].filter(Boolean) as JSONNode[],
    }));
    return {
      tag: "section",
      className: feats.classes ?? "py-12",
      children: [
        feats.title
          ? {
              tag: "h2",
              className:
                feats.title_classes ?? "text-3xl font-bold text-center mb-8",
              text: feats.title,
            }
          : null,
        {
          tag: "div",
          className:
            feats.container_classes ??
            "max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6",
          children: itemNodes,
        },
      ].filter(Boolean) as JSONNode[],
      ...obj,
    };
  }

  // CTA
  if (t === "cta") {
    const cta = obj as LegacyCTA;
    return {
      tag: "section",
      className: cta.classes ?? "text-center py-12",
      children: [
        {
          tag: "div",
          className: cta.container_classes ?? "max-w-3xl mx-auto px-6",
          children: [
            {
              tag: "p",
              className: cta.text_classes ?? "text-2xl mb-4",
              text: cta.text,
            },
            cta.button
              ? {
                  tag: "a",
                  props: { href: cta.button.link },
                  className:
                    cta.button_classes ??
                    "px-6 py-3 bg-blue-600 text-white rounded-lg",
                  text: cta.button.label,
                }
              : null,
          ].filter(Boolean) as JSONNode[],
        },
      ],
      ...obj,
    };
  }

  // Navbar
  if (t === "navbar") {
    const nav = obj as LegacyNavbar;
    return {
      tag: "nav",
      className: nav.classes ?? "w-full bg-white shadow",
      children: [
        {
          tag: "div",
          className:
            nav.container_classes ??
            "max-w-6xl mx-auto flex items-center justify-between px-6 py-4",
          children: [
            {
              tag: "a",
              props: { href: nav.brand?.link ?? "/" },
              className: nav.brand_classes ?? "text-xl font-extrabold",
              text: nav.brand?.text ?? "Brand",
            },
            {
              tag: "div",
              className:
                nav.links_classes ?? "hidden md:flex gap-6 items-center",
              children: Array.isArray(nav.links)
                ? nav.links.map((l) => ({
                    tag: "a",
                    props: { href: l.href },
                    className:
                      nav.link_classes ?? "text-gray-700 hover:text-purple-600",
                    text: l.label,
                  }))
                : [],
            },
            nav.cta
              ? {
                  tag: "a",
                  props: { href: nav.cta.href },
                  className:
                    nav.cta_classes ??
                    "ml-4 px-4 py-2 bg-purple-600 text-white rounded-md",
                  text: nav.cta.label,
                }
              : null,
          ].filter(Boolean) as JSONNode[],
        },
      ].filter(Boolean) as JSONNode[],
      ...obj,
    };
  }

  // Footer
  if (t === "footer") {
    const f = obj as LegacyFooter;
    const cols = Array.isArray(f.columns)
      ? f.columns.map((col) => ({
          tag: "div",
          children: [
            {
              tag: "h4",
              className: f.heading_classes ?? "text-lg font-bold mb-2",
              text: col.heading,
            },
            {
              tag: "ul",
              children: Array.isArray(col.links)
                ? col.links.map((lnk) => ({
                    tag: "li",
                    children: [
                      {
                        tag: "a",
                        props: { href: lnk.href },
                        className:
                          f.link_classes ?? "text-gray-300 hover:text-white",
                        text: lnk.label,
                      },
                    ],
                  }))
                : [],
            },
          ].filter(Boolean) as JSONNode[],
        }))
      : [];

    return {
      tag: "footer",
      className: f.classes ?? "bg-gray-900 text-gray-200 py-8",
      children: [
        {
          tag: "div",
          className:
            f.container_classes ??
            "max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6",
          children: cols,
        },
        f.copyright
          ? {
              tag: "div",
              className:
                "mt-8 border-t border-gray-800 pt-4 text-center text-sm text-gray-400",
              text: f.copyright,
            }
          : null,
      ].filter(Boolean) as JSONNode[],
      ...obj,
    };
  }

  // default fallback: pretty-print object inside a pre
  return {
    tag: "section",
    className: typeof obj.classes === "string" ? obj.classes : undefined,
    children: [
      {
        tag: "pre",
        className: "whitespace-pre-wrap",
        text: JSON.stringify(obj, null, 2),
      },
    ],
    ...obj,
  };
}
