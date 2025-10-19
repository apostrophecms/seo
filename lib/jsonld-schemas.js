const _ = require('lodash');
const { getImageData } = require('./utils');
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
      'JobPosting': this.getJobPostingSchema,
      'FAQPage': this.getFAQPageSchema,
      'QAPage': this.getQAPageSchema,
      'VideoObject': this.getVideoSchema,
      'HowTo': this.getHowToSchema,
      'Review': this.getReviewSchema,
      'Recipe': this.getRecipeSchema,
      'Course': this.getCourseSchema,
      'Offer': this.getOfferSchema,
      'AggregateOffer': this.getAggregateOfferSchema,
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
    const isDetailDoc = !!piece; // heuristic: piece detail pages shouldn't emit ItemList
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
      const searchParam = global.seoSearchQueryParam || 'q';
      schema.potentialAction = {
        '@type': 'SearchAction',
        'target': `${baseUrl}/search?${searchParam}={search_term_string}`,
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
    // Add sameAs for social profiles (NEW)
    if (org.sameAs?.length) {
      const validUrls = org.sameAs
        .filter(item => item.url?.trim())
        .map(item => item.url);

      if (validUrls.length > 0) {
        schema.sameAs = validUrls;
      }
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
      '@type': 'Article',
      'headline': document.seoTitle || document.title
    };

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = `${document._url}#article`;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
    }

    if (data.req?.locale) schema.inLanguage = data.req.locale;

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
    if (global?.seoJsonLdOrganization?.name?.trim()) {
      schema.publisher = {
        '@type': 'Organization',
        'name': global.seoJsonLdOrganization.name
      };

      // Add @id reference if we have baseUrl (links to main Organization in graph)
      if (baseUrl) {
        schema.publisher['@id'] = `${baseUrl}/#org`;
      }

      // Add logo if available
      const publisherLogo = getImageData(global.seoJsonLdOrganization._logo);
      if (publisherLogo) {
        schema.publisher.logo = {
          '@type': 'ImageObject',
          'url': publisherLogo.url
        };
      }
    }

    if (document.seoIsPaywalled) {
      schema.isAccessibleForFree = false;
      schema.hasPart = {
        '@type': 'WebPageElement',
        'isAccessibleForFree': false,
        'cssSelector': document.seoPaywallSelector || '.paywall'
      };
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
      'headline': document.seoTitle || document.title
    };

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = `${document._url}#webpage`;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
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

    if (document.seoIsPaywalled) {
      schema.isAccessibleForFree = false;
      schema.hasPart = {
        '@type': 'WebPageElement',
        'isAccessibleForFree': false,
        'cssSelector': document.seoPaywallSelector || '.paywall'
      };
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

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = `${document._url}#collection`;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
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
    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
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

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
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
    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
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

    return null;
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
      'itemListElement': items.map((d, i) => {
        const listItem = {
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': d.type || 'Thing', // Use actual doc type if available
            'name': d.seoTitle || d.title,
            'url': d._url || d.url
          }
        };

        // Add image if available (richer snippet potential)
        const itemImage = getImageData(d._featuredImage);
        if (itemImage) {
          listItem.item.image = itemImage.url;
        }

        // Add description if available
        if (d.seoDescription || d.excerpt) {
          listItem.item.description = d.seoDescription || d.excerpt;
        }

        return listItem;
      })
    };
  }

  getQAPageSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const qa = document?.seoJsonLdQAPage;

    if (!document || !qa || !qa.question?.trim()) {
      return null;
    }

    const questionSchema = {
      '@type': 'Question',
      'name': qa.question
    };

    // Question text/body
    if (qa.questionText?.trim()) {
      questionSchema.text = qa.questionText;
    }

    // Question author
    if (qa.questionAuthor?.trim()) {
      questionSchema.author = {
        '@type': 'Person',
        'name': qa.questionAuthor
      };
    }

    // Question date
    if (qa.questionDate) {
      questionSchema.dateCreated = qa.questionDate;
    }

    // Question upvotes
    if (qa.questionUpvotes !== undefined && qa.questionUpvotes !== null) {
      questionSchema.upvoteCount = qa.questionUpvotes;
    }

    // Accepted answer
    if (qa.acceptedAnswer?.text?.trim()) {
      questionSchema.acceptedAnswer = {
        '@type': 'Answer',
        'text': qa.acceptedAnswer.text
      };

      if (qa.acceptedAnswer.author?.trim()) {
        questionSchema.acceptedAnswer.author = {
          '@type': 'Person',
          'name': qa.acceptedAnswer.author
        };
      }

      if (qa.acceptedAnswer.dateCreated) {
        questionSchema.acceptedAnswer.dateCreated = qa.acceptedAnswer.dateCreated;
      }

      if (qa.acceptedAnswer.upvotes !== undefined && qa.acceptedAnswer.upvotes !== null) {
        questionSchema.acceptedAnswer.upvoteCount = qa.acceptedAnswer.upvotes;
      }
    }

    // Suggested answers
    if (qa.suggestedAnswers?.length) {
      const validAnswers = qa.suggestedAnswers
        .filter(a => a.text?.trim())
        .map(answer => {
          const answerSchema = {
            '@type': 'Answer',
            'text': answer.text
          };

          if (answer.author?.trim()) {
            answerSchema.author = {
              '@type': 'Person',
              'name': answer.author
            };
          }

          if (answer.dateCreated) {
            answerSchema.dateCreated = answer.dateCreated;
          }

          if (answer.upvotes !== undefined && answer.upvotes !== null) {
            answerSchema.upvoteCount = answer.upvotes;
          }

          return answerSchema;
        });

      if (validAnswers.length > 0) {
        questionSchema.suggestedAnswer = validAnswers;
      }
    }

    // Return QAPage schema
    return {
      '@type': 'QAPage',
      'mainEntity': questionSchema
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

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
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

    // Thumbnail - REQUIRED by Google
    const thumbnail = getImageData(video._thumbnail) || getImageData(document._featuredImage);
    if (thumbnail) {
      schema.thumbnailUrl = thumbnail.url;
    } else {
      // Log warning in debug mode
      if (process.env.APOS_SEO_DEBUG) {
        console.warn('[SEO] Video schema missing required thumbnailUrl:', document._url || document.slug);
      }
    }

    // Upload date - REQUIRED by Google
    if (video.uploadDate) {
      schema.uploadDate = video.uploadDate;
    } else if (document.publishedAt || document.createdAt) {
      // Fallback to document dates
      schema.uploadDate = document.publishedAt || document.createdAt;
    } else {
      if (process.env.APOS_SEO_DEBUG) {
        console.warn('[SEO] Video schema missing required uploadDate:', document._url || document.slug);
      }
    }

    // At least one URL required
    if (!video.contentUrl?.trim() && !video.embedUrl?.trim()) {
      if (process.env.APOS_SEO_DEBUG) {
        console.warn('[SEO] Video schema missing contentUrl or embedUrl:', document._url || document.slug);
      }
    }

    // Video URL or embed URL
    if (video.contentUrl?.trim()) {
      schema.contentUrl = video.contentUrl;
    }

    if (video.embedUrl?.trim()) {
      schema.embedUrl = video.embedUrl;
    }

    // NEW: Learning video properties
    if (video.isEducational) {
      if (video.educationalUse?.trim()) {
        schema.educationalUse = video.educationalUse;
      }
      if (video.learningResourceType?.trim()) {
        schema.learningResourceType = video.learningResourceType;
      }
    }

    return schema;
  }

  getHowToSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const howTo = document?.seoJsonLdHowTo;

    if (!document || !howTo || !howTo.name?.trim() || !howTo.steps?.length) {
      return null;
    }

    const schema = {
      '@type': 'HowTo',
      'name': howTo.name
    };

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
    }

    if (howTo.description?.trim() || document.seoDescription?.trim()) {
      schema.description = howTo.description || document.seoDescription;
    }

    // Add image if available
    const howToImage = getImageData(document._featuredImage);
    if (howToImage) {
      schema.image = howToImage.url;
    }

    // Total time
    if (howTo.totalTime?.trim()) {
      schema.totalTime = howTo.totalTime;
    }

    // Supply list
    if (howTo.supply?.length) {
      const validSupplies = howTo.supply
        .filter(s => s.name?.trim())
        .map(s => ({
          '@type': 'HowToSupply',
          'name': s.name
        }));

      if (validSupplies.length > 0) {
        schema.supply = validSupplies;
      }
    }

    // Tool list
    if (howTo.tool?.length) {
      const validTools = howTo.tool
        .filter(t => t.name?.trim())
        .map(t => ({
          '@type': 'HowToTool',
          'name': t.name
        }));

      if (validTools.length > 0) {
        schema.tool = validTools;
      }
    }

    // Steps
    const validSteps = howTo.steps
      .filter(s => s.name?.trim() && s.text?.trim())
      .map((step, i) => {
        const stepSchema = {
          '@type': 'HowToStep',
          'position': i + 1,
          'name': step.name,
          'text': step.text
        };

        if (step.url?.trim()) {
          stepSchema.url = step.url;
        }

        const stepImage = getImageData(step._image);
        if (stepImage) {
          stepSchema.image = stepImage.url;
        }

        return stepSchema;
      });

    if (validSteps.length > 0) {
      schema.step = validSteps;
    }

    return schema;
  }

  getReviewSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const review = document?.seoJsonLdReview;

    if (!document || !review || !review.itemReviewed?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'Review',
      'itemReviewed': {
        '@type': review.itemType || 'Thing',
        'name': review.itemReviewed
      }
    };

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
    }

    if (review.reviewBody?.trim() || document.seoDescription?.trim()) {
      schema.reviewBody = review.reviewBody || document.seoDescription;
    }

    // Rating
    if (review.reviewRating) {
      schema.reviewRating = {
        '@type': 'Rating',
        'ratingValue': review.reviewRating.toString(),
        'bestRating': '5',
        'worstRating': '1'
      };
    }

    // Author
    if (review.author?.trim()) {
      schema.author = {
        '@type': 'Person',
        'name': review.author
      };
    } else if (document._author?.length) {
      schema.author = {
        '@type': 'Person',
        'name': document._author[0].title || document._author[0].username
      };
    }

    // Date published
    if (review.datePublished || document.publishedAt || document.createdAt) {
      schema.datePublished = review.datePublished || document.publishedAt || document.createdAt;
    }

    return schema;
  }

  getRecipeSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const recipe = document?.seoJsonLdRecipe;

    if (!document || !recipe || !recipe.name?.trim()) {
      return null;
    }

    // Image is REQUIRED by Google - check before proceeding
    const recipeImage = getImageData(document._featuredImage);
    if (!recipeImage) {
      if (process.env.APOS_SEO_DEBUG) {
        console.warn('[SEO] Recipe schema requires an image. Skipping schema generation.');
      }
      return null;
    }

    const schema = {
      '@type': 'Recipe',
      'name': recipe.name,
      'image': recipeImage.url  // Required field
    };

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
    }

    if (recipe.description?.trim() || document.seoDescription?.trim()) {
      schema.description = recipe.description || document.seoDescription;
    }

    // Author
    if (recipe.author?.trim()) {
      schema.author = {
        '@type': 'Person',
        'name': recipe.author
      };
    } else if (document._author?.length) {
      schema.author = {
        '@type': 'Person',
        'name': document._author[0].title || document._author[0].username
      };
    }

    // Dates
    if (recipe.datePublished || document.publishedAt || document.createdAt) {
      schema.datePublished = recipe.datePublished || document.publishedAt || document.createdAt;
    }

    // Times
    if (recipe.prepTime?.trim()) {
      schema.prepTime = recipe.prepTime;
    }

    if (recipe.cookTime?.trim()) {
      schema.cookTime = recipe.cookTime;
    }

    if (recipe.totalTime?.trim()) {
      schema.totalTime = recipe.totalTime;
    }

    // Yield
    if (recipe.recipeYield?.trim()) {
      schema.recipeYield = recipe.recipeYield;
    }

    // Category and cuisine
    if (recipe.recipeCategory?.trim()) {
      schema.recipeCategory = recipe.recipeCategory;
    }

    if (recipe.recipeCuisine?.trim()) {
      schema.recipeCuisine = recipe.recipeCuisine;
    }

    // Ingredients
    if (recipe.recipeIngredient?.length) {
      const validIngredients = recipe.recipeIngredient
        .filter(i => i.ingredient?.trim())
        .map(i => i.ingredient);

      if (validIngredients.length > 0) {
        schema.recipeIngredient = validIngredients;
      }
    }

    // Instructions - Google prefers HowToStep array format
    if (recipe.recipeInstructions?.length) {
      const validInstructions = recipe.recipeInstructions
        .filter(i => i.instruction?.trim())
        .map((instr, idx) => ({
          '@type': 'HowToStep',
          'position': idx + 1,
          'text': instr.instruction,
          'name': `Step ${idx + 1}`  // Add step name for better structure
        }));

      if (validInstructions.length > 0) {
        schema.recipeInstructions = validInstructions;
      }
    }

    // Video (optional but recommended by Google)
    if (recipe.video?.trim()) {
      schema.video = {
        '@type': 'VideoObject',
        'name': recipe.name,
        'description': recipe.description || document.seoDescription || recipe.name,
        'contentUrl': recipe.video,
        'thumbnailUrl': recipeImage.url
      };
    }

    // Keywords (optional but helps with categorization)
    if (recipe.keywords?.trim()) {
      schema.keywords = recipe.keywords;
    }

    // Nutrition (if provided)
    if (recipe.nutrition) {
      const nutrition = {};
      let hasNutritionData = false;

      if (recipe.nutrition.calories?.trim()) {
        nutrition.calories = recipe.nutrition.calories;
        hasNutritionData = true;
      }
      if (recipe.nutrition.carbohydrateContent?.trim()) {
        nutrition.carbohydrateContent = recipe.nutrition.carbohydrateContent;
        hasNutritionData = true;
      }
      if (recipe.nutrition.proteinContent?.trim()) {
        nutrition.proteinContent = recipe.nutrition.proteinContent;
        hasNutritionData = true;
      }
      if (recipe.nutrition.fatContent?.trim()) {
        nutrition.fatContent = recipe.nutrition.fatContent;
        hasNutritionData = true;
      }

      if (hasNutritionData) {
        schema.nutrition = {
          '@type': 'NutritionInformation',
          ...nutrition
        };
      }
    }

    // Aggregate rating
    if (recipe.rating && recipe.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': recipe.rating.toString(),
        'reviewCount': recipe.reviewCount.toString(),
        'bestRating': '5',
        'worstRating': '1'
      };
    }

    return schema;
  }

  getCourseSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const course = document?.seoJsonLdCourse;

    if (!document || !course || !course.name?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'Course',
      'name': course.name
    };

    // Only add @id if we have a complete URL
    if (document._url) {
      sschema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
    }

    if (course.description?.trim() || document.seoDescription?.trim()) {
      schema.description = course.description || document.seoDescription;
    }

    // Provider
    const global = data.global;
    if (course.provider?.trim() || global?.seoJsonLdOrganization?.name) {
      schema.provider = {
        '@type': 'Organization',
        'name': course.provider || global.seoJsonLdOrganization.name
      };

      const baseUrl = this.getBaseUrl(data);
      if (baseUrl) {
        schema.provider['@id'] = `${baseUrl}/#org`;
      }
    }

    // Course code
    if (course.courseCode?.trim()) {
      schema.courseCode = course.courseCode;
    }

    // Educational level
    if (course.educationalLevel?.trim()) {
      schema.educationalLevel = course.educationalLevel;
    }

    // Offers (pricing)
    if (course.price !== undefined && course.price !== null) {
      schema.offers = {
        '@type': 'Offer',
        'price': course.price.toString(),
        'priceCurrency': course.currency || 'USD'
      };

      if (course.availability) {
        schema.offers.availability = `https://schema.org/${course.availability}`;
      }
    }

    // Aggregate rating
    if (course.rating && course.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': course.rating.toString(),
        'reviewCount': course.reviewCount.toString(),
        'bestRating': '5',
        'worstRating': '1'
      };
    }

    return schema;
  }

  getJobPostingSchema(data) {
    const { piece, page } = data;
    const document = piece || page;
    const job = document?.seoJsonLdJobPosting;

    if (!document || !job || !job.title?.trim()) {
      return null;
    }

    const schema = {
      '@type': 'JobPosting',
      'title': job.title
    };

    // Only add @id if we have a complete URL
    if (document._url) {
      schema['@id'] = document._url;
      schema.url = document._url;
    } else if (baseUrl && document.slug) {
      // Fallback: construct URL from baseUrl + slug
      schema['@id'] = `${baseUrl}${document.slug}#article`;
    }

    // Description - required by Google
    if (job.description?.trim() || document.seoDescription?.trim()) {
      schema.description = job.description || document.seoDescription;
    }

    // Date posted - required by Google
    if (job.datePosted || document.publishedAt || document.createdAt) {
      schema.datePosted = job.datePosted || document.publishedAt || document.createdAt;
    }

    // Valid through (expiration date) - required by Google
    if (job.validThrough) {
      schema.validThrough = job.validThrough;
    }

    // Employment type
    if (job.employmentType?.length) {
      schema.employmentType = job.employmentType;
    }

    // Hiring Organization - required by Google
    const global = data.global;
    if (job.hiringOrganization?.name?.trim()) {
      schema.hiringOrganization = {
        '@type': 'Organization',
        'name': job.hiringOrganization.name
      };

      if (job.hiringOrganization.sameAs?.trim()) {
        schema.hiringOrganization.sameAs = job.hiringOrganization.sameAs;
      }

      // Logo
      const orgLogo = getImageData(job.hiringOrganization._logo) ||
        getImageData(global?.seoJsonLdOrganization?._logo);
      if (orgLogo) {
        schema.hiringOrganization.logo = orgLogo.url;
      }
    } else if (global?.seoJsonLdOrganization?.name) {
      // Fall back to global org
      schema.hiringOrganization = {
        '@type': 'Organization',
        'name': global.seoJsonLdOrganization.name
      };

      const baseUrl = this.getBaseUrl(data);
      if (baseUrl) {
        schema.hiringOrganization['@id'] = `${baseUrl}/#org`;
      }
    }

    // Job Location - required by Google
    if (job.jobLocation) {
      const loc = job.jobLocation;

      if (loc.remote === true) {
        // Remote job
        schema.jobLocationType = 'TELECOMMUTE';

        // If applicant location requirements are specified
        if (loc.applicantLocationRequirements?.length) {
          schema.applicantLocationRequirements = loc.applicantLocationRequirements.map(req => ({
            '@type': 'Country',
            'name': req.country
          }));
        }
      }

      if (loc.address?.city?.trim() || loc.address?.street?.trim()) {
        // Physical location
        schema.jobLocation = {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress'
          }
        };

        if (loc.address.street?.trim()) {
          schema.jobLocation.address.streetAddress = loc.address.street;
        }
        if (loc.address.city?.trim()) {
          schema.jobLocation.address.addressLocality = loc.address.city;
        }
        if (loc.address.state?.trim()) {
          schema.jobLocation.address.addressRegion = loc.address.state;
        }
        if (loc.address.zip?.trim()) {
          schema.jobLocation.address.postalCode = loc.address.zip;
        }
        if (loc.address.country?.trim()) {
          schema.jobLocation.address.addressCountry = loc.address.country;
        }
      }
    }

    // Base Salary
    if (job.baseSalary) {
      const salary = job.baseSalary;

      if (salary.minValue || salary.maxValue || salary.value) {
        schema.baseSalary = {
          '@type': 'MonetaryAmount',
          'currency': salary.currency || 'USD'
        };

        // Handle salary range vs. fixed salary
        if (salary.minValue && salary.maxValue) {
          schema.baseSalary.value = {
            '@type': 'QuantitativeValue',
            'minValue': salary.minValue,
            'maxValue': salary.maxValue,
            'unitText': salary.unitText || 'YEAR'
          };
        } else if (salary.value) {
          schema.baseSalary.value = {
            '@type': 'QuantitativeValue',
            'value': salary.value,
            'unitText': salary.unitText || 'YEAR'
          };
        }
      }
    }

    // Experience Requirements
    if (job.experienceRequirements?.trim()) {
      schema.experienceRequirements = {
        '@type': 'OccupationalExperienceRequirements',
        'monthsOfExperience': parseInt(job.experienceRequirements, 10)
      };
    }

    // Education Requirements
    if (job.educationRequirements?.trim()) {
      schema.educationRequirements = {
        '@type': 'EducationalOccupationalCredential',
        'credentialCategory': job.educationRequirements
      };
    }

    // Qualifications
    if (job.qualifications?.trim()) {
      schema.qualifications = job.qualifications;
    }

    // Responsibilities
    if (job.responsibilities?.trim()) {
      schema.responsibilities = job.responsibilities;
    }

    // Skills
    if (job.skills?.length) {
      const validSkills = job.skills
        .filter(s => s.skill?.trim())
        .map(s => s.skill);

      if (validSkills.length > 0) {
        schema.skills = validSkills.join(', ');
      }
    }

    // Benefits
    if (job.jobBenefits?.trim()) {
      schema.jobBenefits = job.jobBenefits;
    }

    // Industry
    if (job.industry?.trim()) {
      schema.industry = job.industry;
    }

    // Occupational Category (ONET code or job category)
    if (job.occupationalCategory?.trim()) {
      schema.occupationalCategory = job.occupationalCategory;
    }

    // Work Hours
    if (job.workHours?.trim()) {
      schema.workHours = job.workHours;
    }

    // Direct Apply
    if (job.directApply === true && document._url) {
      schema.directApply = true;
    }

    return schema;
  }

  getOfferSchema(data) {
    const { piece, page, global } = data;
    const document = piece || page;
    const offer = document?.seoJsonLdOffer;

    if (!document || !offer || !offer.name?.trim() || !offer.price) {
      return null;
    }

    const schema = {
      '@type': 'Offer',
      'name': offer.name,
      'price': offer.price.toString(),
      'priceCurrency': offer.priceCurrency || 'USD'
    };

    if (document._url || offer.url?.trim()) {
      schema.url = offer.url?.trim() || document._url;
    }

    if (offer.description?.trim() || document.seoDescription?.trim()) {
      schema.description = offer.description || document.seoDescription;
    }

    // Availability
    if (offer.availability) {
      schema.availability = `https://schema.org/${offer.availability}`;
    }

    // Valid dates
    if (offer.validFrom) {
      schema.validFrom = offer.validFrom;
    }

    if (offer.priceValidUntil) {
      schema.priceValidUntil = offer.priceValidUntil;
    }

    // Item condition
    if (offer.itemCondition) {
      schema.itemCondition = `https://schema.org/${offer.itemCondition}`;
    }

    // Seller - use offer seller, fallback to organization
    if (offer.seller?.trim()) {
      schema.seller = {
        '@type': 'Organization',
        'name': offer.seller
      };
    } else if (global?.seoJsonLdOrganization?.name) {
      const baseUrl = this.getBaseUrl(data);
      schema.seller = {
        '@type': 'Organization',
        'name': global.seoJsonLdOrganization.name
      };
      if (baseUrl) {
        schema.seller['@id'] = `${baseUrl}/#org`;
      }
    }

    // Shipping details
    if (offer.shippingDetails?.shippingRate !== undefined) {
      schema.shippingDetails = {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': offer.shippingDetails.shippingRate.toString(),
          'currency': offer.priceCurrency || 'USD'
        }
      };

      if (offer.shippingDetails.shippingDestination?.trim()) {
        schema.shippingDetails.shippingDestination = {
          '@type': 'DefinedRegion',
          'addressCountry': offer.shippingDetails.shippingDestination
        };
      }

      if (offer.shippingDetails.deliveryTime?.trim()) {
        schema.shippingDetails.deliveryTime = {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'value': offer.shippingDetails.deliveryTime
          }
        };
      }
    }

    return schema;
  }

  getAggregateOfferSchema(data) {
    const { piece, page, global } = data;
    const document = piece || page;
    const aggregateOffer = document?.seoJsonLdAggregateOffer;

    if (!document || !aggregateOffer || !aggregateOffer.name?.trim() ||
      !aggregateOffer.lowPrice || !aggregateOffer.highPrice) {
      return null;
    }

    const schema = {
      '@type': 'AggregateOffer',
      'name': aggregateOffer.name,
      'lowPrice': aggregateOffer.lowPrice.toString(),
      'highPrice': aggregateOffer.highPrice.toString(),
      'priceCurrency': aggregateOffer.priceCurrency || 'USD'
    };

    if (document._url || aggregateOffer.url?.trim()) {
      schema.url = aggregateOffer.url?.trim() || document._url;
    }

    if (aggregateOffer.description?.trim() || document.seoDescription?.trim()) {
      schema.description = aggregateOffer.description || document.seoDescription;
    }

    // Offer count
    if (aggregateOffer.offerCount) {
      schema.offerCount = aggregateOffer.offerCount;
    }

    // Availability
    if (aggregateOffer.availability) {
      schema.availability = `https://schema.org/${aggregateOffer.availability}`;
    }

    // Seller
    if (aggregateOffer.seller?.trim()) {
      schema.seller = {
        '@type': 'Organization',
        'name': aggregateOffer.seller
      };
    } else if (global?.seoJsonLdOrganization?.name) {
      const baseUrl = this.getBaseUrl(data);
      schema.seller = {
        '@type': 'Organization',
        'name': global.seoJsonLdOrganization.name
      };
      if (baseUrl) {
        schema.seller['@id'] = `${baseUrl}/#org`;
      }
    }

    // Individual offers array
    if (aggregateOffer.offers?.length) {
      const validOffers = aggregateOffer.offers
        .filter(o => o.name?.trim() && o.price)
        .map(o => {
          const offerSchema = {
            '@type': 'Offer',
            'name': o.name,
            'price': o.price.toString(),
            'priceCurrency': o.priceCurrency || aggregateOffer.priceCurrency || 'USD'
          };

          if (o.availability) {
            offerSchema.availability = `https://schema.org/${o.availability}`;
          }

          if (o.url?.trim()) {
            offerSchema.url = o.url;
          }

          return offerSchema;
        });

      if (validOffers.length > 0) {
        schema.offers = validOffers;
      }
    }

    return schema;
  }

  // Schema validation method
  validateSchema(schema) {
    const warnings = [];
    const type = schema['@type'];

    // Article validation
    if (type === 'Article') {
      if (!schema.headline) warnings.push('Article missing headline');
      if (!schema.datePublished) warnings.push('Article missing datePublished');
      if (!schema.author) warnings.push('Article missing author');
      if (!schema.publisher) warnings.push('Article missing publisher');
    }

    // Product validation
    if (type === 'Product') {
      if (!schema.name) warnings.push('Product missing name');
      if (!schema.offers) warnings.push('Product missing offers/price');
      if (schema.offers && !schema.offers.price) warnings.push('Product offer missing price');
    }

    // Event validation
    if (type === 'Event') {
      if (!schema.name) warnings.push('Event missing name');
      if (!schema.startDate) warnings.push('Event missing startDate');
      if (!schema.location) warnings.push('Event missing location');
    }

    // Recipe validation
    if (type === 'Recipe') {
      if (!schema.name) warnings.push('Recipe missing name');
      if (!schema.image) warnings.push('Recipe missing image (required by Google)');
      if (!schema.recipeIngredient || schema.recipeIngredient.length === 0) {
        warnings.push('Recipe missing ingredients');
      }
      if (!schema.recipeInstructions || schema.recipeInstructions.length === 0) {
        warnings.push('Recipe missing instructions');
      }
    }

    // HowTo validation
    if (type === 'HowTo') {
      if (!schema.name) warnings.push('HowTo missing name');
      if (!schema.step || schema.step.length === 0) warnings.push('HowTo missing steps');
    }

    // Course validation
    if (type === 'Course') {
      if (!schema.name) warnings.push('Course missing name');
      if (!schema.description) warnings.push('Course missing description');
      if (!schema.provider) warnings.push('Course missing provider');
    }

    // JobPosting validation
    if (type === 'JobPosting') {
      if (!schema.title) warnings.push('JobPosting missing title');
      if (!schema.description) warnings.push('JobPosting missing description');
      if (!schema.datePosted) warnings.push('JobPosting missing datePosted');
      if (!schema.hiringOrganization) warnings.push('JobPosting missing hiringOrganization');
      if (!schema.jobLocation && !schema.jobLocationType) {
        warnings.push('JobPosting missing jobLocation (use physical location or set as remote)');
      }
    }

    if (type === 'QAPage') {
      if (!schema.mainEntity) warnings.push('QAPage missing mainEntity (Question)');
      if (schema.mainEntity && !schema.mainEntity.name) warnings.push('Question missing name');
      if (schema.mainEntity && !schema.mainEntity.acceptedAnswer &&
        (!schema.mainEntity.suggestedAnswer || schema.mainEntity.suggestedAnswer.length === 0)) {
        warnings.push('QAPage should have at least one answer (accepted or suggested)');
      }
    }

    // Offer validation
    if (type === 'Offer') {
      if (!schema.name) warnings.push('Offer missing name');
      if (!schema.price) warnings.push('Offer missing price');
      if (!schema.priceCurrency) warnings.push('Offer missing priceCurrency');
      if (!schema.availability) warnings.push('Offer should specify availability');
    }

    // AggregateOffer validation
    if (type === 'AggregateOffer') {
      if (!schema.name) warnings.push('AggregateOffer missing name');
      if (!schema.lowPrice) warnings.push('AggregateOffer missing lowPrice');
      if (!schema.highPrice) warnings.push('AggregateOffer missing highPrice');
      if (!schema.priceCurrency) warnings.push('AggregateOffer missing priceCurrency');
      if (parseFloat(schema.lowPrice) > parseFloat(schema.highPrice)) {
        warnings.push('AggregateOffer lowPrice should be less than or equal to highPrice');
      }
    }

    // Video validation
    if (type === 'VideoObject') {
      if (!schema.name) warnings.push('Video missing name');
      if (!schema.thumbnailUrl) warnings.push('Video missing required thumbnailUrl');
      if (!schema.uploadDate) warnings.push('Video missing required uploadDate');
      if (!schema.contentUrl && !schema.embedUrl) {
        warnings.push('Video missing contentUrl or embedUrl (at least one required)');
      }
    }

    // Log warnings if debug mode is enabled
    if (warnings.length && process.env.APOS_SEO_DEBUG) {
      console.warn(`[SEO] Schema validation warnings for ${type}:`, warnings);
    }

    return warnings.length === 0;
  }
}

module.exports = JsonLdSchemaHandler;