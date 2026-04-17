import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_META_TAGS,
  getOpenGraphTags,
  getTwitterCardTags,
  PAGE_METAS,
  SEO_CONFIG,
  getCanonicalUrl,
  MetaTag,
  PageMeta,
} from '@/config/seo';

/**
 * Custom hook to manage SEO meta tags
 * Usage: useSEO({ title: "Page Title", description: "..." })
 */
export const useSEO = (meta?: PageMeta) => {
  const location = useLocation();
  const pageMeta = meta || PAGE_METAS[location.pathname.split('/')[1]] || PAGE_METAS.home;

  useEffect(() => {
    // Update page title
    document.title = pageMeta.title;

    // Remove existing meta tags (except those we want to keep)
    const existingMetas = document.querySelectorAll('meta[data-managed="true"]');
    existingMetas.forEach(tag => tag.remove());

    // Helper function to set meta tag
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
      }
      
      element.setAttribute('content', tag.content);
    };

    // Set description
    setMetaTag({
      name: 'description',
      content: pageMeta.description
    });

    // Set keywords
    if (pageMeta.keywords && pageMeta.keywords.length > 0) {
      setMetaTag({
        name: 'keywords',
        content: pageMeta.keywords.join(', ')
      });
    }

    // Set Open Graph tags
    getOpenGraphTags(pageMeta).forEach(setMetaTag);

    // Set Twitter Card tags
    getTwitterCardTags(pageMeta).forEach(setMetaTag);

    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', getCanonicalUrl(location.pathname));

    // Update JSON-LD script for structured data
    updateStructuredData(pageMeta);

  }, [pageMeta, location.pathname]);
};

/**
 * Update JSON-LD structured data
 */
function updateStructuredData(meta: PageMeta) {
  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-managed="true"]');
  existingScripts.forEach(script => script.remove());

  // Note: Structured data is typically added per-page as needed
  // This is a placeholder for more complex implementations
}

/**
 * Hook to manage page title only
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

/**
 * Hook to add JSON-LD structured data
 */
export const useStructuredData = (schema: object) => {
  useEffect(() => {
    // Remove existing structured data for this component
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-managed="true"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    script.setAttribute('data-managed', 'true');
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [schema]);
};
