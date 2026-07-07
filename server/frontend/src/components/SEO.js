import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, type, url, image, schema }) => {
  const defaultTitle = "Autosphere OS - Elite Retailers";
  const defaultDesc = "Connecting you with the world's most prestigious automotive dealerships and exclusive inventory.";
  const defaultUrl = window.location.href;
  
  return (
    <Helmet>
      {/* Standard Meta */}
      <title>{title ? `${title} | Autosphere` : defaultTitle}</title>
      <meta name="description" content={description || defaultDesc} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:url" content={url || defaultUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
