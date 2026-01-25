/**
 * PageMeta: SEO component for per-route title, description, and canonical URL.
 * Uses react-helmet-async for server-side rendering compatibility.
 */

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface PageMetaProps {
    title: string;
    description?: string;
    /** Override canonical URL (defaults to current pathname) */
    canonical?: string;
    /** Open Graph title (defaults to title) */
    ogTitle?: string;
    /** Open Graph description (defaults to description) */
    ogDescription?: string;
}

export function PageMeta({
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
}: PageMetaProps) {
    const location = useLocation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const canonicalUrl = canonical || `${origin}${location.pathname}`;
    const ogTitleValue = ogTitle || title;
    const ogDescriptionValue = ogDescription || description;

    // Update document title and meta tags directly as fallback
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        // Update title
        document.title = title;
        
        // Update or create meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (description) {
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);
        }
        
        // Update or create canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', canonicalUrl);
    }, [title, description, canonicalUrl]);

    return (
        <Helmet>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            <link rel="canonical" href={canonicalUrl} />
            {ogTitleValue && <meta property="og:title" content={ogTitleValue} />}
            {ogDescriptionValue && <meta property="og:description" content={ogDescriptionValue} />}
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        </Helmet>
    );
}
