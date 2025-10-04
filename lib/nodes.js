const JsonLdSchemaHandler = require('./jsonld-schemas');

function getMetaHead(data) {
  const nodes = [];
  const home = data.home;
  const piece = data.piece;
  const page = data.page;
  const global = data.global;
  const document = piece || page;

  // title
  const seoTitle = piece?.seoTitle ||
    page?.seoTitle ||
    home?.seoTitle;
  if (seoTitle) {
    nodes.push({
      name: 'title',
      body: [{
        raw: seoTitle
      }]
    });
  }

  // description
  const seoDescription = piece?.seoDescription ||
    page?.seoDescription ||
    home?.seoDescription;
  if (seoDescription) {
    nodes.push({
      name: 'meta',
      attrs: {
        name: 'description',
        content: seoDescription
      }
    });
  }

  // robots
  const seoRobots = document?.seoRobots;
  if (seoRobots?.length) {
    nodes.push({
      name: 'meta',
      attrs: {
        name: 'robots',
        content: seoRobots.join(',')
      }
    });
  }

  // Google Verification ID
  if (global?.seoGoogleVerificationId) {
    nodes.push({
      name: 'meta',
      attrs: {
        name: 'google-site-verification',
        content: global.seoGoogleVerificationId
      }
    });
  }

  // canonical URL logic
  if (document?._seoCanonical?.length) {
    // canonical page URL
    nodes.push({
      name: 'link',
      attrs: {
        rel: 'canonical',
        href: document._seoCanonical[0]._url
      }
    });
  } else if (document?.seoSelectType &&
    document[document.seoSelectType]?.length) {
    // canonical piece-page URL
    nodes.push({
      name: 'link',
      attrs: {
        rel: 'canonical',
        href: document[document.seoSelectType][0]._url
      }
    });
  }

  // Google Tracking ID
  if (global?.seoGoogleTrackingId) {
    nodes.push({
      comment: 'Global site tag (gtag.js) - Google Analytics'
    });
    nodes.push({
      name: 'script',
      attrs: {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${global.seoGoogleTrackingId}`
      }
    });
    nodes.push({
      name: 'script',
      body: [ {
        raw: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${global.seoGoogleTrackingId}');
`
      } ]
    });
  }

  // JSON-LD Structured Data
  if (shouldGenerateJsonLd(data)) {
    const jsonLdHandler = new JsonLdSchemaHandler();
    const schemas = jsonLdHandler.generateSchemas(data);

    if (schemas.length > 0) {
      nodes.push({
        comment: ' JSON-LD Structured Data '
      });

      // Create ONE script tag with ALL schemas in the @graph array
      nodes.push({
        name: 'script',
        attrs: { type: 'application/ld+json' },
        body: [{
          raw: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": schemas  // This should be the array of schemas, not individual schemas
          }, null, 2)
        }]
      });
    }
  }

    // Add social meta tags
  const socialTags = getSocialMetaTags(data);
  nodes.push(...socialTags);

  // Add hreflang tags
  const hreflangTags = getHreflangTags(data);
  nodes.push(...hreflangTags);

  return nodes;
}

function getSocialMetaTags(data) {
  const nodes = [];
  const { piece, page, home, global } = data;
  const document = piece || page;
  
  const title = document?.seoTitle || document?.title || home?.seoTitle;
  const description = document?.seoDescription || home?.seoDescription;
  const url = document?._url;
  
  // Get image - document featured image, or global default
  let ogImage = null;
  if (document?._featuredImage?.[0]?._urls) {
    ogImage = document._featuredImage[0];
  } else if (global?.seoOpenGraphImage?.[0]?._urls) {
    ogImage = global.seoOpenGraphImage[0];
  }

  // Open Graph tags
  if (title) {
    nodes.push({
      name: 'meta',
      attrs: { property: 'og:title', content: title }
    });
  }

  if (description) {
    nodes.push({
      name: 'meta',
      attrs: { property: 'og:description', content: description }
    });
  }

  if (url) {
    nodes.push({
      name: 'meta',
      attrs: { property: 'og:url', content: url }
    });
  }

  nodes.push({
    name: 'meta',
    attrs: { 
      property: 'og:type', 
      content: piece ? 'article' : 'website' 
    }
  });

  if (global?.seoSiteName) {
    nodes.push({
      name: 'meta',
      attrs: { property: 'og:site_name', content: global.seoSiteName }
    });
  }

  if (ogImage) {
    const imageUrl = ogImage._urls.original || ogImage._urls.full;
    nodes.push({
      name: 'meta',
      attrs: { property: 'og:image', content: imageUrl }
    });

    if (ogImage.width) {
      nodes.push({
        name: 'meta',
        attrs: { property: 'og:image:width', content: ogImage.width.toString() }
      });
    }

    if (ogImage.height) {
      nodes.push({
        name: 'meta',
        attrs: { property: 'og:image:height', content: ogImage.height.toString() }
      });
    }

    if (ogImage.alt) {
      nodes.push({
        name: 'meta',
        attrs: { property: 'og:image:alt', content: ogImage.alt }
      });
    }
  }

  // Twitter Card tags
  nodes.push({
    name: 'meta',
    attrs: { 
      name: 'twitter:card', 
      content: ogImage ? 'summary_large_image' : 'summary' 
    }
  });

  if (global?.seoTwitterHandle) {
    nodes.push({
      name: 'meta',
      attrs: { name: 'twitter:site', content: global.seoTwitterHandle }
    });
  }

  if (title) {
    nodes.push({
      name: 'meta',
      attrs: { name: 'twitter:title', content: title }
    });
  }

  if (description) {
    nodes.push({
      name: 'meta',
      attrs: { name: 'twitter:description', content: description }
    });
  }

  if (ogImage) {
    nodes.push({
      name: 'meta',
      attrs: { 
        name: 'twitter:image', 
        content: ogImage._urls.original || ogImage._urls.full 
      }
    });
  }

  return nodes;
};

function getHreflangTags(data) {
  const nodes = [];
  const { piece, page, req } = data;
  const document = piece || page;

  // Only add hreflang if the site has i18n enabled
  if (!req?.locale || !document?._url) {
    return nodes;
  }

  // Get all locale versions of this document if they exist
  // This assumes ApostropheCMS i18n structure
  if (document.aposLocale && data.alternateLocales) {
    // Add current page
    nodes.push({
      name: 'link',
      attrs: {
        rel: 'alternate',
        hreflang: req.locale,
        href: document._url
      }
    });

    // Add alternate locales
    data.alternateLocales.forEach(alt => {
      if (alt.locale && alt.url) {
        nodes.push({
          name: 'link',
          attrs: {
            rel: 'alternate',
            hreflang: alt.locale,
            href: alt.url
          }
        });
      }
    });

    // Add x-default for the primary locale
    const defaultLocale = data.alternateLocales.find(alt => alt.isDefault);
    if (defaultLocale) {
      nodes.push({
        name: 'link',
        attrs: {
          rel: 'alternate',
          hreflang: 'x-default',
          href: defaultLocale.url
        }
      });
    }
  }

  return nodes;
}

// Helper function to determine if we should generate JSON-LD
function shouldGenerateJsonLd(data) {
  const { global, piece, page, home } = data;

  const hasOrgData = global?.seoJsonLdOrganization?.name;

  const hasSiteData = global?.seoSiteName || global?.title;

  const document = piece || page;
  const hasDocumentSchema = document?.seoJsonLdType;

  const isHomepage = home || (!piece && page?.slug === '/');

  return hasOrgData || hasSiteData || hasDocumentSchema || isHomepage;
}

function getTagManagerHead(data) {
  const nodes = [];
  const global = data.global;

  if (global?.seoGoogleTagManager) {
    nodes.push({
      comment: ' Google Tag Manager '
    });

    nodes.push({
      name: 'script',
      body: [ {
        raw: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${global.seoGoogleTagManager}');`
      } ]
    });

    nodes.push({
      comment: ' End Google Tag Manager '
    });
  }

  return nodes;
}

function getTagManagerBody(data) {
  const nodes = [];
  const global = data.global;

  if (global && global.seoGoogleTagManager) {
    // Comment node for Google Tag Manager (noscript) start
    nodes.push({
      comment: ' Google Tag Manager (noscript) '
    });

    // Noscript tag with iframe
    nodes.push({
      name: 'noscript',
      body: [ {
        name: 'iframe',
        attrs: {
          src: `https://www.googletagmanager.com/ns.html?id=${global.seoGoogleTagManager}`,
          height: '0',
          width: '0',
          style: 'display:none;visibility:hidden'
        }
      } ]
    });

    // Comment node for Google Tag Manager (noscript) end
    nodes.push({
      comment: ' End Google Tag Manager (noscript) '
    });
  }

  return nodes;
}

module.exports = {
  getMetaHead,
  getTagManagerHead,
  getTagManagerBody,
  getSocialMetaTags,
  getHreflangTags
};
