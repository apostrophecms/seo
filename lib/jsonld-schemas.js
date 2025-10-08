const _ = require('lodash');

function getImageData(imageRelationship) {
  if (!imageRelationship?.[0]) {
    return null;
  }

  const img = imageRelationship[0];
  const attachment = img.attachment;

  if (!attachment?._urls) {
    return null;
  }

  return {
    url: attachment._urls.original || attachment._urls.full,
    alt: img.alt || attachment.title || '',
    width: attachment.width,
    height: attachment.height
  };
}
class JsonLdSchemaHandler {
  constructor() {
    this.schemas = {
      'WebSite': this.getWebsiteSchema,
      'Organization': this.getOrganizationSchema,
      'Article': this.getArticleSchema,
      'WebPage': this.getWebPageSchema,
      'CollectionPage': this.getCollectionPageSchema,
      'Product': this.getProductSchema,
      'Event': this.getEventSchema,
      'Person': this.getPersonSchema,
      'LocalBusiness': this.getLocalBusinessSchema,
      'FAQPage': this.getFAQPageSchema,
      'VideoObject': this.getVideoSchema
    };
  }

  generateSchemas(data) {
    const { page, piece, global, home } = data;

    // building the graph for this request
    const document = piece || page;

    const schemas = [];

    // Always include WebSite schema if we have site data
    if ((global?.seoSiteName || global?.title)) {
      const websiteSchema = this.getWebsiteSchema(data);
      if (websiteSchema) {
        schemas.push(websiteSchema);
      }
    }

    // Add Organization schema if configured with actual data
    if (global?.seoJsonLdOrganization?.name) {
      const orgSchema = this.getOrganizationSchema(data);
      if (orgSchema) {
        schemas.push(orgSchema);
      }
    }

    // Add document-specific schema based on type
    if (document?.seoJsonLdType) {
      const schemaGenerator = this.schemas[document.seoJsonLdType];
      if (schemaGenerator) {
        const documentSchema = schemaGenerator.call(this, data);
        if (documentSchema) {
          schemas.push(documentSchema);
        }
      }
    }

    // Add ItemList for listing pages if items are present and toggle allows
    const items = this.getListingItems(data);
    const isDetailDoc = !!piece; // heuristic: piece detail pages shouldn’t emit ItemList
    const includeItemList = !isDetailDoc && items.length > 0 && (
      document?.seoIncludeItemList === true ||
      (document?.seoIncludeItemList === undefined && document?.seoJsonLdType === 'CollectionPage')
    );
    if (includeItemList) {
      const itemList = this.getItemListSchema(data, items);
      if (itemList) schemas.push(itemList);
    }

    // Add BreadcrumbList for pages (skip on piece detail)
    if (!isDetailDoc && page) {
      const breadcrumbs = this.getBreadcrumbListSchema(data);
      if (breadcrumbs) {
        schemas.push(breadcrumbs);
      }
    }

    return schemas.filter(schema => schema !== null);
  }

  getWebsiteSchema(data) {
    const { global } = data;
    const baseUrl = this.getBaseUrl(data);

    if (!global.seoSiteName) {
      return null;
    }

    const websiteId = baseUrl ? `${baseUrl}/#website` : undefined;
    const schema = {
      '@type': 'WebSite',
      '@id': websiteId,
      'name': global.seoSiteName
    };

    if (baseUrl) schema.url = baseUrl;

    if (global?.seoSiteDescription?.trim()) {
      schema.description = global.seoSiteDescription;
    }

    // Add search action if we have a base URL
    if (baseUrl) {
      schema.potentialAction = {
        '@type': 'SearchAction',
        'target': `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      };
    }

    return schema;
  }

  getOrganizationSchema(data) {
    const { global } = data;
    const org = global?.seoJsonLdOrganization;

    if (!org?.name?.trim()) {
      return null;
    }

    const baseUrl = this.getBaseUrl(data);
    const orgId = baseUrl ? `${baseUrl}/#org` : undefined;
    const schema = {
      '@type': org.type || 'Organization',
      '@id': orgId,
      'name': org.name
    };

    if (baseUrl) schema.url = baseUrl;

    // Only add description if it exists and has content
    if (org.description?.trim()) {
      schema.description = org.description;
    }

    // Only add logo if it exists with URLs
    if (org._logo) {
      const logoImage = getImageData(org._logo);
      if (logoImage) {
        schema.logo = {
          '@type': 'ImageObject',
          'url': logoImage.url
        };
      }
    }

    // Only add contact point if telephone exists
    if (org.contactPoint?.telephone?.trim()) {
      schema.contactPoint = {
        '@type': 'ContactPoint',
        'telephone': org.contactPoint.telephone,
        'contactType': org.contactPoint.type || 'customer service'
      };
    }

    // Only add address if we have meaningful address data
    const addr = org.address;
    if (addr && (addr.street?.trim() || addr.city?.trim())) {
      schema.address = {
        '@type': 'PostalAddress'
      };

      if (addr.street?.trim()) schema.address.streetAddress = addr.street;
      if (addr.city?.trim()) schema.address.addressLocality = addr.city;
      if (addr.state?.trim()) schema.address.addressRegion = addr.state;
      if (addr.zip?.trim()) schema.address.postalCode = addr.zip;
      if (addr.country?.trim()) schema.address.addressCountry = addr.country;
    }

    return schema;
  }

  getArticleSchema(data) {
    const { piece, page } = data;
    const baseUrl = this.getBaseUrl(data);
    const document = piece || page;

    if (!document) {
      return null;
    }

    const schema = {
      '@id': `${document._url || ''}#article`,
      '@type': 'Article',
      'headline': document.seoTitle || document.title
    };

    // Only add URL if available
    if (document._url) {
      schema.url = document._url;
    }

    if (data.req?.locale) schema.inLanguage = data.req.locale;
    if (baseUrl) schema.publisher = { '@id': `${baseUrl}/#org` };


    // Only add description if it exists
    if (document.seoDescription?.trim() || document.excerpt?.trim()) {
      schema.description = document.seoDescription || document.excerpt;
    }

    // Add dates if available
    if (document.publishedAt || document.createdAt) {
      schema.datePublished = document.publishedAt || document.createdAt;
    }
    if (document.updatedAt || document.createdAt) {
      schema.dateModified = document.updatedAt || document.createdAt;
    }

    // Add author if available
    if (document._author?.length) {
      schema.author = {
        '@type': 'Person',
        'name': document._author[0].title || document._author[0].username
      };
    }

    // Add publisher from global org data
    const global = data.global;
    // Add featured/publisher logo if available (guard for not-joined relations)
    const publisherLogo = global?.seoJsonLdOrganization?._logo
      ? getImageData(global.seoJsonLdOrganization._logo)
      : null;
    if (publisherLogo) {
      // ensure publisher exists before assigning logo
      if (!schema.publisher) {
        schema.publisher = { '@type': 'Organization' };
      }
      schema.publisher.logo = {
        '@type': 'ImageObject',
        url: publisherLogo.url
      };
    }

    if (global?.seoJsonLdOrganization?.name?.trim()) {
      schema.publisher = {
        '@type': 'Organization',
        'name': global.seoJsonLdOrganization.name
      };

      if (global.seoJsonLdOrganization._logo?.length && global.seoJsonLdOrganization._logo[0]._urls) {
        schema.publisher.logo = {
          '@type': 'ImageObject',
          'url': global.seoJsonLdOrganization._logo[0]._urls.original
        };
      }
    }

    return schema;
  }

  getWebPageSchema(data) {
    const { piece, page } = data;
    const baseUrl = this.getBaseUrl(data);
    const document = piece || page;

    if (!document) {
      return null;
    }

    const schema = {
      '@type': 'WebPage',
      'name': document.seoTitle || document.title
    };

    if (document._url) {
      schema.url = document._url;
    }

    if (data.req?.locale) schema.inLanguage = data.req.locale;
    if (baseUrl) schema.isPartOf = { '@id': `${baseUrl}/#website` };

    if (document.seoDescription?.trim()) {
      schema.description = document.seoDescription;
    }

    if (document.publishedAt || document.createdAt) {
      schema.datePublished = document.publishedAt || document.createdAt;
    }

    if (document.updatedAt || document.createdAt) {
      schema.dateModified = document.updatedAt || document.createdAt;
    }

    return schema;
  }

  getCollectionPageSchema(data) {
    const { piece, page } = data;
    const baseUrl = this.getBaseUrl(data);
    const document = piece || page;

    if (!document) {
      return null;
    }

    const schema = {
      '@type': 'CollectionPage',
      'name': document.seoTitle || document.title
    };

    if (document._url) {
      schema.url = document._url;
    }

    if (data.req?.locale) schema.inLanguage = data.req.locale;
    if (baseUrl) schema.isPartOf = { '@id': `${baseUrl}/#website` };

    if (document.seoDescription?.trim()) {
      schema.description = document.seoDescription;
    }

    if (document.publishedAt || document.createdAt) {
      schema.datePublished = document.publishedAt || document.createdAt;
    }

    if (document.updatedAt || document.createdAt) {
      schema.dateModified = document.updatedAt || document.createdAt;
    }

    return schema;
  }

  getProductSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const product = document?.seoJsonLdProduct;

    if (!document || !product || !product.name?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'Product',
      'name': product.name
    };

    if (document._url) {
      schema.url = document._url;
    }

    if (product.description?.trim() || document.seoDescription?.trim()) {
      schema.description = product.description || document.seoDescription;
    }

    // Add offers if price is provided
    if (product.price && product.price > 0) {
      schema.offers = {
        '@type': 'Offer',
        'price': product.price.toString(),
        'priceCurrency': product.currency || 'USD'
      };

      if (product.availability) {
        schema.offers.availability = `https://schema.org/${product.availability}`;
      }
    }

    // Add brand if provided
    if (product.brand?.trim()) {
      schema.brand = {
        '@type': 'Brand',
        'name': product.brand
      };
    }

    // Add aggregate rating
    if (product.rating && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': product.rating.toString(),
        'reviewCount': product.reviewCount.toString(),
        'bestRating': '5',
        'worstRating': '1'
      };
    }

    // Add SKU
    if (product.sku?.trim()) {
      schema.sku = product.sku;
    }

    // Add GTIN (barcode)
    if (product.gtin?.trim()) {
      schema.gtin = product.gtin;
    }

    // Add condition
    if (product.condition) {
      schema.itemCondition = `https://schema.org/${product.condition}`;
    }

    // Add image if available
    const productImage = getImageData(document._featuredImage);
    if (productImage) {
      schema.image = productImage.url;
    }

    return schema;
  }

  getEventSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const event = document?.seoJsonLdEvent;

    if (!document || !event || !event.name?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'Event',
      'name': event.name
    };

    if (document._url) {
      schema.url = document._url;
    }

    if (event.description?.trim() || document.seoDescription?.trim()) {
      schema.description = event.description || document.seoDescription;
    }

    if (event.startDate) {
      schema.startDate = event.startDate;
    }

    if (event.endDate) {
      schema.endDate = event.endDate;
    }

    // Add location if provided
    if (event.location?.name?.trim()) {
      schema.location = {
        '@type': 'Place',
        'name': event.location.name
      };

      if (event.location.address?.trim()) {
        schema.location.address = event.location.address;
      }
    }

    return schema;
  }

  getPersonSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const person = document?.seoJsonLdPerson;

    if (!document || !person || !person.name?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'Person',
      'name': person.name
    };

    if (document._url) {
      schema.url = document._url;
    }

    if (person.description?.trim() || document.seoDescription?.trim()) {
      schema.description = person.description || document.seoDescription;
    }

    if (person.jobTitle?.trim()) {
      schema.jobTitle = person.jobTitle;
    }

    if (person.organization?.trim()) {
      schema.worksFor = {
        '@type': 'Organization',
        'name': person.organization
      };
    }

    return schema;
  }

  getLocalBusinessSchema(data) {
    const { piece, page, global } = data;
    const document = piece || page;
    const business = document?.seoJsonLdBusiness || global?.seoJsonLdBusiness;

    if (!business || !business.name?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'LocalBusiness',
      'name': business.name
    };

    // Get URL - prefer piece URL, fallback to base URL
    const baseUrl = this.getBaseUrl(data);

    if (document?._url) {
      schema.url = document._url;
    } else if (baseUrl) {
      schema.url = baseUrl;
    }

    if (business.description?.trim() || document?.seoDescription?.trim()) {
      schema.description = business.description || document?.seoDescription;
    }

    // Add address if we have meaningful data
    const addr = business.address;
    if (addr && (addr.street?.trim() || addr.city?.trim())) {
      schema.address = {
        '@type': 'PostalAddress'
      };

      if (addr.street?.trim()) schema.address.streetAddress = addr.street;
      if (addr.city?.trim()) schema.address.addressLocality = addr.city;
      if (addr.state?.trim()) schema.address.addressRegion = addr.state;
      if (addr.zip?.trim()) schema.address.postalCode = addr.zip;
      if (addr.country?.trim()) schema.address.addressCountry = addr.country;
    }

    if (business.telephone?.trim()) {
      schema.telephone = business.telephone;
    }

    if (business.openingHours?.length) {
      const validHours = business.openingHours
        .filter(item => item.hours?.trim())
        .map(item => item.hours);

      if (validHours.length > 0) {
        schema.openingHours = validHours;
      }
    }

    return schema;
  }

  // helper: get the site base URL consistently
  getBaseUrl(data) {
    const fromGlobal = data.global?.seoSiteCanonicalUrl;
    if (fromGlobal) {
      return fromGlobal.replace(/\/$/, '');
    }
    const abs = data.req?.absoluteUrl;

    if (abs) {
      try {
        return new URL(abs).origin;
      } catch (e) { }
    }
    // TODO REMOVE
    return 'http://localhost:3000';
  }

  // helper: find listing items on an index page
  getListingItems(data) {
    // Try common keys used by Apostrophe listing pages
    const candidates = [
      data.pieces,
      data.items,
      data._pieces,
      data.docs
    ].filter(Boolean);

    const list = (Array.isArray(candidates[0]) ? candidates[0] : [])
      .filter(d => d && (d._url || d.url) && (d.title || d.seoTitle));

    return list;
  }

  // Build an ItemList from listing items
  getItemListSchema(data, itemsArg) {
    const items = itemsArg || this.getListingItems(data);
    if (!items || items.length === 0) {
      return null;
    }
    return {
      '@type': 'ItemList',
      'itemListOrder': 'http://schema.org/ItemListOrderAscending',
      'numberOfItems': items.length,
      'itemListElement': items.map((d, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'url': d._url || d.url,
        'name': d.seoTitle || d.title
      }))
    };
  }

  // Build the page breadcrumbs
  getBreadcrumbListSchema(data) {
    const { page, piece } = data;
    const doc = piece || page;
    const chain = (page?._ancestors || []).concat(doc ? [doc] : []);
    const items = chain
      .filter(d => d && (d._url || d.url))
      .map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@id': d._url || d.url,
          name: d.seoTitle || d.title
        }
      }));

    return items.length ? { '@type': 'BreadcrumbList', itemListElement: items } : null;
  }

  getFAQPageSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const faq = document?.seoJsonLdFAQ;

    if (!document || !faq?.questions?.length) {
      return null;
    }

    const mainEntity = faq.questions
      .filter(q => q.question?.trim() && q.answer?.trim())
      .map(q => ({
        '@type': 'Question',
        'name': q.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': q.answer
        }
      }));

    if (mainEntity.length === 0) {
      return null;
    }

    return {
      '@type': 'FAQPage',
      'mainEntity': mainEntity
    };
  }

  getVideoSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const video = document?.seoJsonLdVideo;

    if (!document || !video || !video.name?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'VideoObject',
      'name': video.name
    };

    if (document._url) {
      schema.url = document._url;
    }

    if (video.description?.trim() || document.seoDescription?.trim()) {
      schema.description = video.description || document.seoDescription;
    }

    if (video.uploadDate) {
      schema.uploadDate = video.uploadDate;
    }

    if (video.duration?.trim()) {
      schema.duration = video.duration;
    }

    // Thumbnail
    const thumbnail = getImageData(video._thumbnail) || getImageData(document._featuredImage);
    if (thumbnail) {
      schema.thumbnailUrl = thumbnail.url;

      // Video URL or embed URL
      if (video.contentUrl?.trim()) {
        schema.contentUrl = video.contentUrl;
      }

      if (video.embedUrl?.trim()) {
        schema.embedUrl = video.embedUrl;
      }

      return schema;
    }
  }
}

module.exports = JsonLdSchemaHandler;
