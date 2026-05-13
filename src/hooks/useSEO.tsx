import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_META_TAGS,
  getOpenGraphTags,
  getTwitterCardTags,
  PAGE_METAS,
  getCanonicalUrl,
  MetaTag,
  PageMeta,
  StructuredDataNode,
} from '@/config/seo';

/**
 * Custom hook to manage SEO meta tags
 * Usage: useSEO({ title: "Page Title", description: "..." })
 */
export const useSEO = (meta?: PageMeta) => {
  const location = useLocation();
  const routeKey = location.pathname.split('/')[1] || 'home';
  const pageMetaStr = JSON.stringify(meta || PAGE_METAS[routeKey] || PAGE_METAS.home);

  useEffect(() => {
    const pageMeta: PageMeta = JSON.parse(pageMetaStr);
    document.title = pageMeta.title;

    const setMetaTag = (tag: MetaTag) => {
      let element = document.querySelector(
        tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`
      );

      if (!element) {
        element = document.createElement('meta');
        if (tag.name) element.setAttribute('name', tag.name);
        if (tag.property) element.setAttribute('property', tag.property);
        element.setAttribute('data-managed', 'true');
        document.head.appendChild(element);
      } else {
        element.setAttribute('data-managed', 'true');
      }

      element.setAttribute('content', tag.content);
    };

    DEFAULT_META_TAGS.forEach(setMetaTag);

    setMetaTag({
      name: 'description',
      content: pageMeta.description,
    });

    if (pageMeta.keywords.length > 0) {
      setMetaTag({
        name: 'keywords',
        content: pageMeta.keywords.join(', '),
      });
    }

    setMetaTag({
      name: 'robots',
      content:
        pageMeta.robots ||
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    });

    setMetaTag({
      name: 'googlebot',
      content: pageMeta.robots?.includes('noindex')
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large',
    });

    getOpenGraphTags({
      ...pageMeta,
      url: pageMeta.url || getCanonicalUrl(location.pathname),
    }).forEach(setMetaTag);

    getTwitterCardTags(pageMeta).forEach(setMetaTag);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageMeta.url || getCanonicalUrl(location.pathname));
  }, [pageMetaStr, location.pathname]);
};

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

/**
 * Hook to add one or more JSON-LD structured data blocks
 */
export const useStructuredData = (schema: StructuredDataNode | StructuredDataNode[]) => {
  const schemas = Array.isArray(schema) ? schema : [schema];
  const schemaSignature = JSON.stringify(schemas);

  useEffect(() => {
    const existingScripts = Array.from(
      document.querySelectorAll('script[data-managed-structured-data="true"]')
    );
    existingScripts.forEach((script) => script.remove());

    schemas.forEach((entry, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(entry);
      script.setAttribute('data-managed-structured-data', 'true');
      script.setAttribute('data-schema-index', String(index));
      document.head.appendChild(script);
    });

    return () => {
      const managedScripts = Array.from(
        document.querySelectorAll('script[data-managed-structured-data="true"]')
      );
      managedScripts.forEach((script) => script.remove());
    };
  }, [schemaSignature]);
};
