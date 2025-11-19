const assert = require('assert');

describe('@apostrophecms/seo', function () {

  describe('JSON-LD Schema Generation', function () {

    it('should generate WebSite schema with site name', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        global: {
          seoSiteName: 'Test Site',
          seoSiteCanonicalUrl: 'https://example.com'
        },
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const websiteSchema = schemas.find(s => s['@type'] === 'WebSite');

      assert(websiteSchema, 'WebSite schema should exist');
      assert.strictEqual(websiteSchema.name, 'Test Site');
      assert.strictEqual(websiteSchema.url, 'https://example.com');
    });

    it('should generate Article schema with required fields', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        page: {
          title: 'Test Article',
          seoTitle: 'SEO Test Article',
          seoJsonLdType: 'Article',
          _url: 'https://example.com/test-article',
          createdAt: new Date('2024-01-01')
        },
        global: {
          seoJsonLdOrganization: {
            name: 'Test Organization'
          }
        },
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const articleSchema = schemas.find(s => s['@type'] === 'Article');

      assert(articleSchema, 'Article schema should exist');
      assert.strictEqual(articleSchema.headline, 'SEO Test Article');
      assert.strictEqual(articleSchema.url, 'https://example.com/test-article');
      assert(articleSchema.datePublished, 'datePublished should exist');
      assert(articleSchema.publisher, 'publisher should exist');
      assert.strictEqual(articleSchema.publisher.name, 'Test Organization');
    });

    it('should use fallback for author from req.user', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        page: {
          title: 'Test Article',
          seoJsonLdType: 'Article',
          _url: 'https://example.com/test',
          createdAt: new Date()
        },
        global: {
          seoJsonLdOrganization: { name: 'Test Org' }
        },
        req: {
          user: {
            title: 'John Doe'
          }
        }
      };

      const schemas = handler.generateSchemas(data);
      const articleSchema = schemas.find(s => s['@type'] === 'Article');

      assert(articleSchema.author, 'author should exist');
      assert.strictEqual(articleSchema.author.name, 'John Doe');
    });

    it('should generate Product schema with pricing', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        piece: {
          title: 'Test Product',
          seoJsonLdType: 'Product',
          seoJsonLdProduct: {
            name: 'Amazing Widget',
            price: 29.99,
            currency: 'USD',
            availability: 'InStock',
            brand: 'TestBrand'
          },
          _url: 'https://example.com/products/widget'
        },
        global: {},
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const productSchema = schemas.find(s => s['@type'] === 'Product');

      assert(productSchema, 'Product schema should exist');
      assert.strictEqual(productSchema.name, 'Amazing Widget');
      assert(productSchema.offers, 'offers should exist');
      assert.strictEqual(productSchema.offers.price, '29.99');
      assert.strictEqual(productSchema.offers.priceCurrency, 'USD');
      assert(productSchema.brand, 'brand should exist');
      assert.strictEqual(productSchema.brand.name, 'TestBrand');
    });

    it('should not generate Recipe schema without required image', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        piece: {
          title: 'Test Recipe',
          seoJsonLdType: 'Recipe',
          seoJsonLdRecipe: {
            name: 'Chocolate Cake'
            // Missing required image
          },
          _url: 'https://example.com/recipes/cake'
        },
        global: {},
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const recipeSchema = schemas.find(s => s['@type'] === 'Recipe');

      assert.strictEqual(recipeSchema, undefined, 'Recipe schema should not exist without image');
    });

    it('should generate FAQPage schema with questions', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        page: {
          title: 'FAQ Page',
          seoJsonLdType: 'FAQPage',
          seoJsonLdFAQ: {
            questions: [
              {
                question: 'What is SEO?',
                answer: 'Search Engine Optimization'
              },
              {
                question: 'Why is SEO important?',
                answer: 'It helps people find your website'
              }
            ]
          },
          _url: 'https://example.com/faq'
        },
        global: {
          seoSiteCanonicalUrl: 'https://example.com'
        },
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const faqSchema = schemas.find(s => s['@type'] === 'FAQPage');

      assert(faqSchema, 'FAQPage schema should exist');
      assert(Array.isArray(faqSchema.mainEntity), 'mainEntity should be an array');
      assert.strictEqual(faqSchema.mainEntity.length, 2);
      assert.strictEqual(faqSchema.mainEntity[0]['@type'], 'Question');
      assert.strictEqual(faqSchema.mainEntity[0].name, 'What is SEO?');
    });

    it('should generate ItemList for CollectionPage', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        page: {
          title: 'Blog Index',
          seoJsonLdType: 'CollectionPage',
          seoIncludeItemList: true,
          _url: 'https://example.com/blog'
        },
        pieces: [
          {
            title: 'First Post',
            _url: 'https://example.com/blog/first',
            seoDescription: 'First post description'
          },
          {
            title: 'Second Post',
            _url: 'https://example.com/blog/second',
            seoDescription: 'Second post description'
          }
        ],
        global: {},
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const itemListSchema = schemas.find(s => s['@type'] === 'ItemList');

      assert(itemListSchema, 'ItemList schema should exist');
      assert.strictEqual(itemListSchema.numberOfItems, 2);
      assert(Array.isArray(itemListSchema.itemListElement), 'itemListElement should be an array');
      assert.strictEqual(itemListSchema.itemListElement[0].item.name, 'First Post');
    });

    it('should generate Offer schema with seller fallback', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        piece: {
          title: 'Special Offer',
          seoJsonLdType: 'Offer',
          seoJsonLdOffer: {
            name: 'Limited Time Deal',
            price: 99.99,
            priceCurrency: 'USD',
            availability: 'InStock'
          },
          _url: 'https://example.com/offers/deal'
        },
        global: {
          seoSiteCanonicalUrl: 'https://example.com',
          seoJsonLdOrganization: {
            name: 'ACME Corporation'
          }
        },
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const offerSchema = schemas.find(s => s['@type'] === 'Offer');

      assert(offerSchema, 'Offer schema should exist');
      assert.strictEqual(offerSchema.name, 'Limited Time Deal');
      assert.strictEqual(offerSchema.price, '99.99');
      assert(offerSchema.seller, 'seller should exist');
      assert.strictEqual(offerSchema.seller.name, 'ACME Corporation');
    });

    it('should generate AggregateOffer schema with price range', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const data = {
        piece: {
          title: 'Product Variants',
          seoJsonLdType: 'AggregateOffer',
          seoJsonLdAggregateOffer: {
            name: 'Widget Collection',
            lowPrice: 19.99,
            highPrice: 99.99,
            priceCurrency: 'USD',
            offerCount: 5
          },
          _url: 'https://example.com/products/widgets'
        },
        global: {},
        req: {}
      };

      const schemas = handler.generateSchemas(data);
      const aggOfferSchema = schemas.find(s => s['@type'] === 'AggregateOffer');

      assert(aggOfferSchema, 'AggregateOffer schema should exist');
      assert.strictEqual(aggOfferSchema.name, 'Widget Collection');
      assert.strictEqual(aggOfferSchema.lowPrice, '19.99');
      assert.strictEqual(aggOfferSchema.highPrice, '99.99');
      assert.strictEqual(aggOfferSchema.offerCount, 5);
    });
  });

  describe('Custom Schema Registration', function () {

    it('should register and retrieve custom schemas', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');

      const customBookSchema = (data) => ({
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: data.piece?.title || 'Untitled Book'
      });

      const handler = new JsonLdSchemaHandler({
        Book: customBookSchema
      });

      // Assert it’s wired in
      assert(handler.schemas.Book, 'Custom Book schema should be registered');
      assert.strictEqual(typeof handler.schemas.Book, 'function');

      // Assert output looks right
      const data = {
        piece: {
          title: 'The Great Gatsby',
          seoJsonLdType: 'Book'
        },
        global: {},
        req: {}
      };

      const bookSchema = handler.schemas.Book(data);
      assert.strictEqual(bookSchema['@type'], 'Book');
      assert.strictEqual(bookSchema.name, 'The Great Gatsby');
    });
  });

  describe('Fallback System', function () {

    it('should use description fallbacks in correct order', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      // Test priority: schema.description → seoDescription → excerpt → description
      const document = {
        seoDescription: 'SEO description',
        excerpt: 'Excerpt text',
        description: 'General description'
      };

      const schemaData = {}; // No schema description
      const result = handler.getDescriptionWithFallbacks(schemaData, document);
      assert.strictEqual(result, 'SEO description');

      // Test next fallback
      delete document.seoDescription;
      const result2 = handler.getDescriptionWithFallbacks(schemaData, document);
      assert.strictEqual(result2, 'Excerpt text');

      // Test final fallback
      delete document.excerpt;
      const result3 = handler.getDescriptionWithFallbacks(schemaData, document);
      assert.strictEqual(result3, 'General description');
    });

    it('should use image fallbacks from multiple sources', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const document = {
        featuredImage: {
          url: 'https://example.com/image.jpg',
          alt: 'Featured image',
          width: 1200,
          height: 630
        }
      };

      const result = handler.getImageDataWithFallbacks({}, document);

      assert(result, 'result should exist');
      assert.strictEqual(result.url, 'https://example.com/image.jpg');
      assert.strictEqual(result.alt, 'Featured image');
    });

    it('should use author fallbacks in correct order', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      // Test with document-level author string
      const document = {
        author: 'Jane Smith'
      };
      const req = {};

      const result = handler.getAuthorName({}, document, req);
      assert.strictEqual(result, 'Jane Smith');

      // Test fallback to req.user
      const document2 = {};
      const req2 = {
        user: { title: 'Admin User' }
      };

      const result2 = handler.getAuthorName({}, document2, req2);
      assert.strictEqual(result2, 'Admin User');
    });

    it('should use date fallbacks for published dates', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const testDate = new Date('2024-01-15');
      const document = {
        publishedAt: testDate,
        createdAt: new Date('2024-01-01')
      };

      const result = handler.getDateWithFallbacks({}, document, 'published');
      assert.strictEqual(result, testDate);

      // Test fallback to createdAt
      delete document.publishedAt;
      const result2 = handler.getDateWithFallbacks({}, document, 'published');
      assert(result2 instanceof Date);
    });
  });

  describe('Meta Tag Generation', function () {

    it('should generate meta tags from nodes.js', function () {
      const { getMetaHead } = require('../lib/nodes');

      const data = {
        page: {
          seoTitle: 'Test Page Title',
          seoDescription: 'Test page description',
          seoRobots: [ 'noindex', 'nofollow' ]
        },
        global: {
          seoGoogleVerificationId: 'test-verification-id'
        }
      };

      const nodes = getMetaHead(data, { apos: {} });

      // Find title meta tag
      const titleNode = nodes.find(n =>
        n.attrs && n.attrs.name === 'title'
      );
      assert(titleNode, 'title meta tag should exist');
      assert.strictEqual(titleNode.attrs.content, 'Test Page Title');

      // Find description meta tag
      const descNode = nodes.find(n =>
        n.attrs && n.attrs.name === 'description'
      );
      assert(descNode, 'description meta tag should exist');
      assert.strictEqual(descNode.attrs.content, 'Test page description');

      // Find robots meta tag
      const robotsNode = nodes.find(n =>
        n.attrs && n.attrs.name === 'robots'
      );
      assert(robotsNode, 'robots meta tag should exist');
      assert.strictEqual(robotsNode.attrs.content, 'noindex,nofollow');

      // Find Google verification
      const verifyNode = nodes.find(n =>
        n.attrs && n.attrs.name === 'google-site-verification'
      );
      assert(verifyNode, 'verification meta tag should exist');
      assert.strictEqual(verifyNode.attrs.content, 'test-verification-id');
    });

    it('should generate canonical link when provided', function () {
      const { getMetaHead } = require('../lib/nodes');

      const data = {
        page: {
          _seoCanonical: [ {
            _url: 'https://example.com/canonical-page'
          } ]
        },
        global: {}
      };

      const nodes = getMetaHead(data, { apos: {} });
      const canonicalNode = nodes.find(n =>
        n.attrs && n.attrs.rel === 'canonical'
      );

      assert(canonicalNode, 'canonical link should exist');
      assert.strictEqual(canonicalNode.attrs.href, 'https://example.com/canonical-page');
    });

    it('should generate pagination links', function () {
      const { getMetaHead } = require('../lib/nodes');

      const data = {
        page: {
          _url: 'https://example.com/blog'
        },
        currentPage: 2,
        totalPages: 5,
        global: {}
      };

      const nodes = getMetaHead(data, { apos: {} });

      const prevNode = nodes.find(n =>
        n.attrs && n.attrs.rel === 'prev'
      );
      const nextNode = nodes.find(n =>
        n.attrs && n.attrs.rel === 'next'
      );

      assert(prevNode, 'prev link should exist');
      assert.strictEqual(prevNode.attrs.href, 'https://example.com/blog'); // Page 1 = clean URL

      assert(nextNode, 'next link should exist');
      assert.strictEqual(nextNode.attrs.href, 'https://example.com/blog?page=3');
    });

    it('should generate theme-color meta tags', function () {
      const { getMetaHead } = require('../lib/nodes');

      const data = {
        page: {},
        global: {
          seoThemeColor: {
            mode: 'lightDark',
            light: '#ffffff',
            dark: '#121212'
          }
        }
      };

      const nodes = getMetaHead(data, { apos: {} });

      const lightThemeNode = nodes.find(n =>
        n.attrs &&
        n.attrs.name === 'theme-color' &&
        n.attrs.media === '(prefers-color-scheme: light)'
      );

      const darkThemeNode = nodes.find(n =>
        n.attrs &&
        n.attrs.name === 'theme-color' &&
        n.attrs.media === '(prefers-color-scheme: dark)'
      );

      assert(lightThemeNode, 'light theme-color should exist');
      assert.strictEqual(lightThemeNode.attrs.content, '#ffffff');

      assert(darkThemeNode, 'dark theme-color should exist');
      assert.strictEqual(darkThemeNode.attrs.content, '#121212');
    });
  });

  describe('Utils', function () {

    it('should extract image data from relationship', function () {
      const { getImageData } = require('../lib/utils');

      const imageRelationship = [ {
        attachment: {
          _urls: {
            original: 'https://example.com/uploads/image.jpg',
            full: 'https://example.com/uploads/image-full.jpg'
          },
          width: 1920,
          height: 1080,
          title: 'Test Image'
        },
        alt: 'Alt text override'
      } ];

      const result = getImageData(imageRelationship);

      assert(result, 'result should exist');
      assert.strictEqual(result.url, 'https://example.com/uploads/image.jpg');
      assert.strictEqual(result.alt, 'Alt text override');
      assert.strictEqual(result.width, 1920);
      assert.strictEqual(result.height, 1080);
    });

    it('should return null for empty image relationship', function () {
      const { getImageData } = require('../lib/utils');

      assert.strictEqual(getImageData(null), null);
      assert.strictEqual(getImageData([]), null);
      assert.strictEqual(getImageData([ {} ]), null);
    });
  });

  describe('Schema Validation', function () {

    it('should validate Article schema requirements', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const validSchema = {
        '@type': 'Article',
        headline: 'Test Article',
        datePublished: new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: 'John Doe'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Test Org'
        }
      };

      const isValid = handler.validateSchema(validSchema);
      assert.strictEqual(isValid, true);
    });

    it('should fail validation for incomplete Product schema', function () {
      const JsonLdSchemaHandler = require('../lib/jsonld-schemas');
      const handler = new JsonLdSchemaHandler();

      const invalidSchema = {
        '@type': 'Product',
        name: 'Test Product'
        // Missing offers
      };

      const isValid = handler.validateSchema(invalidSchema);
      assert.strictEqual(isValid, false);
    });
  });
});
