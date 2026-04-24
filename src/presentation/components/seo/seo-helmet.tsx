import React from 'react';
import { Helmet } from 'react-helmet-async';

type OgType = 'website' | 'article' | 'event';

type Props = {
  title: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: OgType;
  /** Raw JSON-LD object(s). Stringified and inserted as <script type="application/ld+json">. */
  jsonLd?: object | object[];
};

/**
 * Thin wrapper on <Helmet> that writes the common head tags for a page:
 * <title>, meta description, OpenGraph, Twitter Cards, canonical URL, and
 * optional schema.org JSON-LD. Use once per page.
 */
const SeoHelmet: React.FC<Props> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
}) => {
  const canonical =
    url ?? (typeof window !== 'undefined' ? window.location.href : undefined);

  const jsonArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* OpenGraph */}
      <meta property="og:site_name" content="HypePass" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {jsonArray.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoHelmet;
