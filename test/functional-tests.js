/* eslint-disable no-console */
const assert = require('assert').strict;
const t = require('apostrophe/test-lib/util.js');

describe('@apostrophecms/seo', function () {
  let apos;

  this.timeout(t.timeout);

  after(async function () {
    await t.destroy(apos);
  });

  before(async function () {
    apos = await t.create({
      root: module,
      testModule: true,
      modules: getAppConfig()
    });

    // const seoModule = apos.modules['@apostrophecms/seo'];
    await insertTestContent(apos);
  });

  afterEach(async function () {
    // Clean up test articles between tests if needed
    await apos.doc.db.deleteMany({
      type: 'article',
      title: /^Test/
    });
  });

  const baseArticle = {
    title: 'Test SEO Article',
    seoTitle: 'SEO Optimized Article Title',
    seoDescription: 'This is a test article for SEO schema validation',
    seoJsonLdType: 'Article',
    author: 'Jane Doe',
    publishedAt: new Date('2024-01-15'),
    slug: 'test-seo-article',
    visibility: 'public'
  };

  it('should initialize ApostropheCMS with SEO module', async function () {
    // Verify module loaded
    assert(apos.modules['@apostrophecms/seo']);
    assert(apos.modules['@apostrophecms/seo'].metaHead);
  });

  it('should insert article and generate Article schema', async function () {
    const req = apos.task.getReq();

    // Insert test article
    const article = await apos.article.insert(req, {
      ...baseArticle
    });

    const found = await apos.article.find(req, { _id: article._id }).toObject();
    assert(found);
    assert.strictEqual(found.seoTitle, 'SEO Optimized Article Title');
    assert.strictEqual(article.seoJsonLdType, 'Article');
  });

  it('should render article page with JSON-LD script in head', async function () {
    const req = apos.task.getReq();

    // Ensure global settings are configured
    const global = await apos.global.findGlobal(req);
    await apos.doc.db.updateOne(
      { _id: global._id },
      {
        $set: {
          seoSiteCanonicalUrl: 'https://example.com',
          seoSiteName: 'Test Site',
          seoJsonLdOrganization: {
            name: 'Test Organization',
            type: 'Organization'
          }
        }
      }
    );

    await apos.article.insert(req, {
      ...baseArticle
    });

    // Render the page
    const result = (await apos.modules['article-page'].renderPage(req, 'index', { outerLayout: '@apostrophecms/template:outerLayer.html' }))
      .split('<body')[0];
    console.log('result!!!!!!!!!!', result);
    // const result = '<h1>title</h1>';

    // const body = await apos.http.get('/articles');
    // console.log('the body!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', body);

    // Verify the rendered output contains expected elements
    assert(result.indexOf('<script type="application/ld+json">') !== -1,
      'Should contain JSON-LD script tag');

    // Check for specific schema types in the JSON-LD
    assert(result.indexOf('"@type":"Article"') !== -1 ||
      result.indexOf('"@type": "Article"') !== -1,
    'JSON-LD should contain Article schema');

    assert(result.indexOf('"@type":"WebSite"') !== -1 ||
      result.indexOf('"@type": "WebSite"') !== -1,
    'JSON-LD should contain WebSite schema');

    assert(result.indexOf('"@type":"Organization"') !== -1 ||
      result.indexOf('"@type": "Organization"') !== -1,
    'JSON-LD should contain Organization schema');

    // Verify the article title appears in the JSON-LD
    assert(result.indexOf('SEO Optimized Article Title') !== -1,
      'Article title should appear in output');

    // Verify the organization name appears
    assert(result.indexOf('Test Organization') !== -1,
      'Organization name should appear in JSON-LD');

    // Verify meta description tag
    assert(result.indexOf('<meta name="description"') !== -1,
      'Should contain meta description tag');

    assert(result.indexOf('This is a test article for SEO schema validation') !== -1,
      'Meta description content should be present');

    // Check that JSON-LD appears before closing head tag
    const headCloseIndex = result.indexOf('</head>');
    const jsonLdIndex = result.indexOf('<script type="application/ld+json">');
    assert(jsonLdIndex < headCloseIndex,
      'JSON-LD script should appear before closing head tag');

    // Optionally: Parse and validate the JSON-LD structure
    const jsonLdMatch = result.match(
      /<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/
    );

    if (jsonLdMatch && jsonLdMatch[1]) {
      const jsonLd = JSON.parse(jsonLdMatch[1]);

      assert.strictEqual(jsonLd['@context'], 'https://schema.org',
        'JSON-LD should have correct @context');

      assert(Array.isArray(jsonLd['@graph']),
        'JSON-LD should have @graph array');

      const articleSchema = jsonLd['@graph'].find(s => s['@type'] === 'Article');
      assert(articleSchema, 'Should find Article schema in @graph');
      assert.strictEqual(articleSchema.headline, 'SEO Optimized Article Title');
      assert.strictEqual(articleSchema.description,
        'This is a test article for SEO schema validation');
    }
  });

  it('should generate meta tags via nodes.js', async function () {
    const req = apos.task.getReq();

    // Get global settings
    const global = await apos.global.findGlobal(req);

    // Get home page
    const home = await apos.page.find(req, { slug: '/' }).toObject();

    // Update home page with SEO data
    await apos.doc.db.updateOne(
      { _id: home._id },
      {
        $set: {
          seoTitle: 'Test Home Page SEO Title',
          seoDescription: 'Test home page description for SEO testing',
          seoRobots: [ 'noindex' ]
        }
      }
    );

    const updatedHome = await apos.page.find(req, { _id: home._id }).toObject();

    // Import nodes module
    const { getMetaHead } = await import('../lib/nodes.js');

    // Build data object as it would be in template
    const data = {
      page: updatedHome,
      global
    };

    // Generate meta nodes
    const nodes = getMetaHead(data, { apos });

    // Find specific meta tags
    const titleNode = nodes.find(n =>
      n.attrs && n.attrs.name === 'title'
    );
    const descNode = nodes.find(n =>
      n.attrs && n.attrs.name === 'description'
    );
    const robotsNode = nodes.find(n =>
      n.attrs && n.attrs.name === 'robots'
    );

    assert(titleNode, 'Should generate title meta tag');
    assert.strictEqual(titleNode.attrs.content, 'Test Home Page SEO Title');

    assert(descNode, 'Should generate description meta tag');
    assert.strictEqual(descNode.attrs.content, 'Test home page description for SEO testing');

    assert(robotsNode, 'Should generate robots meta tag');
    assert(robotsNode.attrs.content.includes('noindex'));
  });

  it('should generate Product schema with pricing', async function () {
    const req = apos.task.getReq();
    const global = await apos.global.findGlobal(req);

    // Simulate product data
    const testData = {
      piece: {
        title: 'Test Product',
        seoJsonLdType: 'Product',
        seoJsonLdProduct: {
          name: 'Amazing Widget',
          price: 29.99,
          currency: 'USD',
          availability: 'InStock',
          brand: 'TestBrand',
          sku: 'WIDGET-001'
        },
        _url: 'https://example.com/products/widget',
        seoDescription: 'The best widget you can buy'
      },
      global,
      req
    };

    const JsonLdSchemaHandler = (await import('../lib/jsonld-schemas.js')).default;
    const handler = new JsonLdSchemaHandler();
    const schemas = handler.generateSchemas(testData);

    const productSchema = schemas.find(s => s['@type'] === 'Product');

    assert(productSchema, 'Product schema should be generated');
    assert.strictEqual(productSchema.name, 'Amazing Widget');
    assert(productSchema.offers, 'Product should have offers');
    assert.strictEqual(productSchema.offers.price, '29.99');
    assert.strictEqual(productSchema.offers.priceCurrency, 'USD');
    assert(productSchema.brand, 'Product should have brand');
    assert.strictEqual(productSchema.brand.name, 'TestBrand');
  });

  it('should generate CollectionPage, ItemList, and BreadcrumbList schemas for listing pages', async function () {
    const req = apos.task.getReq();
    const global = await apos.global.findGlobal(req);

    // Ensure base URL + site name for getBaseUrl / WebSite schema
    await apos.doc.db.updateOne(
      { _id: global._id },
      {
        $set: {
          seoSiteCanonicalUrl: 'https://example.com',
          seoSiteName: 'Test Site'
        }
      }
    );

    const updatedGlobal = await apos.global.findGlobal(req);

    // Simulate a listing page with ancestors
    const listingPage = {
      title: 'Article Listing',
      slug: 'articles',
      seoJsonLdType: 'CollectionPage',
      _url: 'https://example.com/articles',
      _ancestors: [
        {
          title: 'Home',
          _url: 'https://example.com/'
        }
      ]
    };

    // Simulate listing items (pieces)
    const pieces = [
      {
        type: 'Article',
        title: 'First Article',
        _url: 'https://example.com/articles/first-article',
        seoDescription: 'First article description'
      },
      {
        type: 'Article',
        seoTitle: 'Second SEO Article',
        _url: 'https://example.com/articles/second-article',
        excerpt: 'Second article summary'
      }
    ];

    const data = {
      page: listingPage,
      pieces,
      global: updatedGlobal,
      req
    };

    const JsonLdSchemaHandler = (await import('../lib/jsonld-schemas.js')).default;
    const handler = new JsonLdSchemaHandler();
    const schemas = handler.generateSchemas(data);

    // CollectionPage schema
    const collectionPageSchema = schemas.find(s => s['@type'] === 'CollectionPage');
    assert(collectionPageSchema, 'CollectionPage schema should be generated');
    assert.strictEqual(collectionPageSchema.name, 'Article Listing');

    // ItemList schema
    const itemListSchema = schemas.find(s => s['@type'] === 'ItemList');
    assert(itemListSchema, 'ItemList schema should be generated for listing pages');
    assert.strictEqual(itemListSchema.numberOfItems, 2);
    assert(Array.isArray(itemListSchema.itemListElement));
    assert.strictEqual(itemListSchema.itemListElement[0].item.name, 'First Article');
    assert.strictEqual(itemListSchema.itemListElement[1].item.name, 'Second SEO Article');

    // BreadcrumbList schema
    const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList');
    assert(breadcrumbSchema, 'BreadcrumbList schema should be generated');
    assert(Array.isArray(breadcrumbSchema.itemListElement));
    assert(breadcrumbSchema.itemListElement.length >= 2);

    const firstCrumb = breadcrumbSchema.itemListElement[0];
    const lastCrumb = breadcrumbSchema
      .itemListElement[breadcrumbSchema.itemListElement.length - 1];

    assert.strictEqual(firstCrumb.name, 'Home');
    assert.strictEqual(lastCrumb.name, 'Article Listing');
  });

  it('should generate Event schema with dates and location', async function () {
    const req = apos.task.getReq();
    const global = await apos.global.findGlobal(req);

    // Ensure base URL + site name for getBaseUrl
    await apos.doc.db.updateOne(
      { _id: global._id },
      {
        $set: {
          seoSiteCanonicalUrl: 'https://example.com',
          seoSiteName: 'Test Site'
        }
      }
    );

    const updatedGlobal = await apos.global.findGlobal(req);

    const data = {
      piece: {
        title: 'Summer Festival',
        slug: 'summer-festival',
        _url: 'https://example.com/events/summer-festival',
        seoJsonLdType: 'Event',
        seoJsonLdEvent: {
          name: 'Summer Festival',
          description: 'Outdoor music and food by the river.',
          startDate: '2025-06-21T18:00:00Z',
          endDate: '2025-06-21T23:00:00Z',
          location: {
            name: 'Riverfront Park',
            address: '123 River St, Example City'
          }
        },
        // Fallback description if needed
        seoDescription: 'A fun summer festival event.'
      },
      global: updatedGlobal,
      req
    };

    const JsonLdSchemaHandler = (await import('../lib/jsonld-schemas.js')).default;
    const handler = new JsonLdSchemaHandler();
    const schemas = handler.generateSchemas(data);

    const eventSchema = schemas.find(s => s['@type'] === 'Event');
    assert(eventSchema, 'Event schema should be generated');
    assert.strictEqual(eventSchema.name, 'Summer Festival');
    assert.strictEqual(eventSchema.description, 'Outdoor music and food by the river.');
    assert.strictEqual(eventSchema.startDate, '2025-06-21T18:00:00Z');
    assert.strictEqual(eventSchema.endDate, '2025-06-21T23:00:00Z');
    assert(eventSchema.location, 'Event should have a location');
    assert.strictEqual(eventSchema.location['@type'], 'Place');
    assert.strictEqual(eventSchema.location.name, 'Riverfront Park');
    assert.strictEqual(eventSchema.location.address, '123 River St, Example City');
  });

  it('should generate FAQPage schema with mainEntity questions', async function () {
    const req = apos.task.getReq();
    const global = await apos.global.findGlobal(req);

    // Ensure base URL + site name for getBaseUrl
    await apos.doc.db.updateOne(
      { _id: global._id },
      {
        $set: {
          seoSiteCanonicalUrl: 'https://example.com',
          seoSiteName: 'Test Site'
        }
      }
    );

    const updatedGlobal = await apos.global.findGlobal(req);

    const data = {
      page: {
        title: 'SEO FAQ',
        slug: 'seo-faq',
        _url: 'https://example.com/seo-faq',
        seoJsonLdType: 'FAQPage',
        seoJsonLdFAQ: {
          questions: [
            {
              question: 'What is ApostropheCMS?',
              answer: 'ApostropheCMS is an open-source Node.js CMS.'
            },
            {
              question: 'Does the SEO module support JSON-LD?',
              answer: 'Yes, it generates JSON-LD schemas for multiple content types.'
            },
            {
              // Invalid (should be filtered out)
              question: '   ',
              answer: 'This should not appear in the schema.'
            }
          ]
        }
      },
      global: updatedGlobal,
      req
    };

    const JsonLdSchemaHandler = (await import('../lib/jsonld-schemas.js')).default;
    const handler = new JsonLdSchemaHandler();
    const schemas = handler.generateSchemas(data);

    const faqSchema = schemas.find(s => s['@type'] === 'FAQPage');
    assert(faqSchema, 'FAQPage schema should be generated');
    assert(Array.isArray(faqSchema.mainEntity), 'FAQPage mainEntity should be an array');

    // Only the two valid questions should be present
    assert.strictEqual(faqSchema.mainEntity.length, 2);

    const q1 = faqSchema.mainEntity[0];
    const q2 = faqSchema.mainEntity[1];

    assert.strictEqual(q1['@type'], 'Question');
    assert.strictEqual(q1.name, 'What is ApostropheCMS?');
    assert(q1.acceptedAnswer);
    assert.strictEqual(q1.acceptedAnswer['@type'], 'Answer');
    assert.strictEqual(q1.acceptedAnswer.text, 'ApostropheCMS is an open-source Node.js CMS.');

    assert.strictEqual(q2['@type'], 'Question');
    assert.strictEqual(q2.name, 'Does the SEO module support JSON-LD?');
    assert(q2.acceptedAnswer);
    assert.strictEqual(
      q2.acceptedAnswer.text,
      'Yes, it generates JSON-LD schemas for multiple content types.'
    );
  });

  it('should test robots.txt route', async function () {
    const req = apos.task.getReq();

    // Update global settings for robots.txt
    const global = await apos.global.findGlobal(req);
    await apos.doc.db.updateOne(
      { _id: global._id },
      {
        $set: {
          robotsTxtSelection: 'allowSearchBlockAI'
        }
      }
    );

    // Test the route via HTTP
    const robotsTxt = await apos.http.get('http://localhost:3000/robots.txt');

    // Verify content
    assert(robotsTxt.length > 0, 'robots.txt should have content');
    assert(robotsTxt.includes('User-agent'), 'Should have User-agent directive');
    assert(robotsTxt.includes('Disallow') || robotsTxt.includes('Allow'), 'Should have Allow or Disallow directive');
  });

  it('should test llms.txt route', async function () {
    // Test the route via HTTP
    const llmsTxt = await apos.http.get('http://localhost:3000/llms.txt');

    // Verify content structure
    assert(llmsTxt.length > 0, 'llms.txt should have content');
    assert(llmsTxt.includes('#'), 'Should have markdown headers');
  });

  describe('doc-type improve config', function () {
    it('skips SEO fields when seoFields option is false', async function () {

      // Get a module that has seoFields enabled (article)
      const moduleWithSeo = apos.modules.article;
      assert(moduleWithSeo, 'article module should exist');

      // Get a module that has seoFields: false (review-without-seo)
      const moduleWithoutSeo = apos.modules['review-without-seo'];
      assert(moduleWithoutSeo, 'review-without-seo module should exist');

      // Create instances to check schema
      const reviewInstance = moduleWithoutSeo.newInstance();
      const articleInstance = moduleWithSeo.newInstance();

      // Test that review-without-seo does NOT have SEO fields
      const expected = {
        hasSeoTitle: false,
        hasSeoDescription: false,
        hasSeoJsonLdType: false,
        hasSeoRobots: false
      };

      const actual = {
        hasSeoTitle: 'seoTitle' in reviewInstance,
        hasSeoDescription: 'seoDescription' in reviewInstance,
        hasSeoJsonLdType: 'seoJsonLdType' in reviewInstance,
        hasSeoRobots: 'seoRobots' in reviewInstance
      };

      assert.deepStrictEqual(actual, expected, 'Module with seoFields: false should not have SEO fields');

      // Test that article DOES have SEO fields
      const expectedWithSeo = {
        hasSeoTitle: true,
        hasSeoDescription: true,
        hasSeoJsonLdType: true,
        hasSeoRobots: true
      };

      const actualWithSeo = {
        hasSeoTitle: 'seoTitle' in articleInstance,
        hasSeoDescription: 'seoDescription' in articleInstance,
        hasSeoJsonLdType: 'seoJsonLdType' in articleInstance,
        hasSeoRobots: 'seoRobots' in articleInstance
      };

      assert.deepStrictEqual(actualWithSeo, expectedWithSeo, 'Module with seoFields enabled should have SEO fields');
    });

    it('sets a default schema type for known modules (blog)', function () {
      const blogArticle = apos.modules['@apostrophecms/blog'].newInstance();
      assert(blogArticle);
      assert(blogArticle.type = '@apostrophecms/blog');
      assert(blogArticle.seoJsonLdType === 'Article');
    });

    it('adds canonical relationship fields when seoCanonicalTypes is configured', function () {
      const docTypeImprove = require('../modules/@apostrophecms/doc-type/index.js');

      const self = {
        __meta: {
          name: 'article'
        },
        options: {
          seoCanonicalTypes: ['blog']
        }
      };

      const options = {
        apos: {
          instanceOf() {
            return false;
          },
          task: {
            getReq() {
              return {
                t(key, params) {
                  // Minimal i18n stub
                  if (key === 'apostrophe:moduleTypeLabel') {
                    return params.moduleName;
                  }
                  return key;
                }
              };
            }
          },
          modules: {
            blog: {
              label: 'Blog'
            }
          }
        }
      };

      const configuration = docTypeImprove.fields(self, options);

      const canonicalKey = Object.keys(configuration.add).find(name => name.startsWith('_seoCanonical'));

      const expected = {
        hasConfiguration: true,
        hasAdd: true,
        hasGroup: true,
        hasSeoGroup: true,
        hasJsonLdType: true,
        hasCanonicalField: true,
        hasSelectType: true,
        selectTypeInGroup: true,
        canonicalInGroup: true
      };

      const actual = {
        hasConfiguration: !!configuration,
        hasAdd: !!configuration?.add,
        hasGroup: !!configuration?.group,
        hasSeoGroup: !!configuration?.group?.seo,
        hasJsonLdType: !!configuration?.add?.seoJsonLdType,
        hasCanonicalField: !!canonicalKey,
        hasSelectType: !!configuration?.add?.seoSelectType,
        selectTypeInGroup: configuration?.group?.seo?.fields?.includes('seoSelectType'),
        canonicalInGroup: configuration?.group?.seo?.fields?.includes(canonicalKey)
      };

      assert.deepStrictEqual(actual, expected, 'Canonical types configuration should add proper fields');
    });
  });

  describe('global improve config', function () {
    it('exposes robots/llms controls by default', function () {
      const globalImprove = require('../modules/@apostrophecms/global/index.js');

      const self = {};
      const options = {};

      const configuration = globalImprove.fields(self, options);

      assert(configuration);
      assert(configuration.add);
      assert(configuration.group);
      assert(configuration.group.seo);

      // robots/llms choices exist
      assert(configuration.add.robotsTxtSelection);
      assert(configuration.add.llmsTxtSelection);
      assert(configuration.add.robotsAISelective);
      assert(configuration.add.robotsCustomText);
      assert(configuration.group.seo.fields.includes('robotsTxtSelection'));
      assert(configuration.group.seo.fields.includes('llmsTxtSelection'));
    });

    it('adds Google verification, analytics, and GTM fields when enabled', function () {
      const globalImprove = require('../modules/@apostrophecms/global/index.js');

      const self = {};
      const options = {
        seoGoogleVerification: true,
        seoGoogleAnalytics: true,
        seoGoogleTagManager: true
      };

      const configuration = globalImprove.fields(self, options);

      assert(configuration.add.seoGoogleVerificationId);
      assert(configuration.add.seoGoogleTrackingId);
      assert(configuration.add.seoGoogleTagManager);

      const seoGroupFields = configuration.group.seo.fields;
      assert(seoGroupFields.includes('seoGoogleVerificationId'));
      assert(seoGroupFields.includes('seoGoogleTrackingId'));
      assert(seoGroupFields.includes('seoGoogleTagManager'));
    });
  });

  describe('utils.getImageData', function () {
    it('returns null when relationship is empty or lacks attachment URLs', function () {
      const { getImageData } = require('../lib/utils.js');

      assert.strictEqual(getImageData(null), null);
      assert.strictEqual(getImageData([]), null);
      assert.strictEqual(getImageData([{}]), null);

      const noUrls = [{
        attachment: {
          width: 100,
          height: 200
        }
      }];
      assert.strictEqual(getImageData(noUrls), null);
    });

    it('returns normalized image data when relationship has attachment URLs', function () {
      const { getImageData } = require('../lib/utils.js');

      const rel = [{
        alt: 'Alt text',
        attachment: {
          title: 'Attachment title',
          width: 800,
          height: 600,
          _urls: {
            original: 'https://example.com/original.jpg',
            full: 'https://example.com/full.jpg'
          }
        }
      }];

      const result = getImageData(rel);
      assert.deepEqual(result, {
        url: 'https://example.com/original.jpg',
        alt: 'Alt text',
        width: 800,
        height: 600,
        _urls: {
          original: 'https://example.com/original.jpg',
          full: 'https://example.com/full.jpg'
        }
      });
    });
  });

  describe('nodes helpers and additional branches', function () {
    it('adds theme-color (light/dark), canonical, pagination, fonts and Google meta', async function () {
      const { getMetaHead } = await import('../lib/nodes.js');

      const req = apos.task.getReq();
      const global = await apos.global.findGlobal(req);
      const home = await apos.page.find(req, { slug: '/' }).toObject();

      // configure global SEO settings
      await apos.doc.db.updateOne(
        { _id: global._id },
        {
          $set: {
            seoThemeColor: {
              type: 'lightDark',
              light: '#ffffff',
              dark: '#000000'
            },
            seoSiteCanonicalUrl: 'https://example.com',
            criticalFonts: [
              { url: 'https://cdn.example.com/fonts/inter.woff2' },
              { url: '/fonts/local.woff2' }
            ],
            seoGoogleVerificationId: 'verify-123',
            seoGoogleTrackingId: 'G-XYZ123'
          }
        }
      );

      const updatedGlobal = await apos.global.findGlobal(req);

      const data = {
        page: {
          ...home,
          _url: 'https://example.com/',
          currentPage: 2,
          totalPages: 3
        },
        global: updatedGlobal,
        home,
        req
      };

      const nodes = getMetaHead(data, { apos });

      // theme-color meta (light/dark)
      const themeNodes = nodes.filter(n => n.name === 'meta' && n.attrs && n.attrs.name === 'theme-color');
      assert(themeNodes.find(n => n.attrs.media && n.attrs.media.includes('prefers-color-scheme: light')));
      assert(themeNodes.find(n => n.attrs.media && n.attrs.media.includes('prefers-color-scheme: dark')));

      // canonical + prev/next pagination links
      const canonical = nodes.find(n => n.name === 'link' && n.attrs && n.attrs.rel === 'canonical');
      assert(canonical);
      assert.strictEqual(canonical.attrs.href, 'https://example.com/');

      const prev = nodes.find(n => n.name === 'link' && n.attrs && n.attrs.rel === 'prev');
      const next = nodes.find(n => n.name === 'link' && n.attrs && n.attrs.rel === 'next');
      assert(prev);
      assert(next);

      // critical font preloads
      const preloadFonts = nodes.filter(n =>
        n.name === 'link' &&
        n.attrs &&
        n.attrs.rel === 'preload' &&
        n.attrs.as === 'font'
      );
      assert(preloadFonts.length >= 2);

      // Google verification
      const verifyMeta = nodes.find(n =>
        n.name === 'meta' &&
        n.attrs &&
        n.attrs.name === 'google-site-verification'
      );
      assert(verifyMeta);
      assert.strictEqual(verifyMeta.attrs.content, 'verify-123');

      // Google Analytics (gtag.js) script
      const analyticsScript = nodes.find(n =>
        n.name === 'script' &&
        ((n.attrs && n.attrs.src && n.attrs.src.includes('googletagmanager.com/gtag/js')) ||
          (n.body && Array.isArray(n.body) && n.body.some(b => b.raw && b.raw.includes('gtag('))))
      );
      assert(analyticsScript);
    });

    it('adds hreflang and x-default tags when alternateLocales are present', async function () {
      const { getMetaHead } = await import('../lib/nodes.js');

      const req = apos.task.getReq();
      const global = await apos.global.findGlobal(req);
      const home = await apos.page.find(req, { slug: '/' }).toObject();

      const data = {
        page: {
          ...home,
          _url: 'https://example.com/en/'
        },
        global,
        home,
        req,
        alternateLocales: [
          {
            locale: 'en',
            url: 'https://example.com/en/',
            isDefault: true
          },
          {
            locale: 'de',
            url: 'https://example.com/de/'
          }
        ]
      };

      const nodes = getMetaHead(data, { apos });

      const hreflangLinks = nodes.filter(n =>
        n.name === 'link' &&
        n.attrs &&
        n.attrs.rel === 'alternate' &&
        n.attrs.hreflang
      );

      const enLink = hreflangLinks.find(n => n.attrs.hreflang === 'en');
      const deLink = hreflangLinks.find(n => n.attrs.hreflang === 'de');
      const xDefault = hreflangLinks.find(n => n.attrs.hreflang === 'x-default');

      assert(enLink);
      assert(deLink);
      assert(xDefault);
      assert.strictEqual(xDefault.attrs.href, 'https://example.com/en/');
    });

    it('adds Google Tag Manager head and body nodes when configured', function () {
      const { getTagManagerHead, getTagManagerBody } = require('../lib/nodes.js');

      const data = {
        global: {
          seoGoogleTagManager: 'GTM-TEST123'
        }
      };

      const headNodes = getTagManagerHead(data);
      const bodyNodes = getTagManagerBody(data);

      assert(headNodes.length > 0, 'GTM head nodes should be generated');
      assert(bodyNodes.length > 0, 'GTM body nodes should be generated');

      const headScript = headNodes.find(n => n.name === 'script');
      assert(headScript);
      assert(headScript.body[0].raw.includes('GTM-TEST123'));

      const iframe = bodyNodes
        .filter(n => n.name === 'noscript')
        .flatMap(n => n.body || [])
        .find(b => b.name === 'iframe');

      assert(iframe);
      assert.strictEqual(
        iframe.attrs.src,
        'https://www.googletagmanager.com/ns.html?id=GTM-TEST123'
      );
    });

    it('renders JSON-LD when organization/site data is available', async function () {
      const { getMetaHead } = await import('../lib/nodes.js');

      const req = apos.task.getReq();
      const global = await apos.global.findGlobal(req);
      const home = await apos.page.find(req, { slug: '/' }).toObject();

      await apos.doc.db.updateOne(
        { _id: global._id },
        {
          $set: {
            seoJsonLdOrganization: {
              name: 'Test Org'
            },
            seoSiteName: 'Test Site'
          }
        }
      );

      const updatedGlobal = await apos.global.findGlobal(req);

      const data = {
        page: home,
        global: updatedGlobal,
        home,
        req
      };

      const nodes = getMetaHead(data, { apos });

      const jsonLdNode = nodes.find(n =>
        n.name === 'script' &&
        n.attrs &&
        n.attrs.type === 'application/ld+json'
      );

      assert(jsonLdNode, 'JSON-LD script tag should be present when org/site data exists');
      assert(jsonLdNode.body || jsonLdNode.content, 'JSON-LD script should have content');
    });
  });

  // describe('custom field mappings', function () {
  //   it('should handle custom field mappings', async function () {
  //     // Re-initialize with custom field mappings
  //     await t.destroy(apos);

  //     apos = await t.create({
  //       root: module,
  //       testModule: true,
  //       modules: getAppConfigWithMappings()
  //     });

  //     const req = apos.task.getReq();
  //     const global = await apos.global.findGlobal(req);

  //     // Create article with custom fields
  //     const article = await apos.article.insert(req, {
  //       title: 'Mapped Article',
  //       seoJsonLdType: 'Article',
  //       writerName: 'Custom Author',
  //       summary: 'Custom summary field',
  //       slug: 'mapped-article',
  //       visibility: 'public'
  //     });

  //     // Test with custom fields
  //     const testData = {
  //       piece: article,
  //       global,
  //       req
  //     };

  //     const JsonLdSchemaHandler = (await import('../lib/jsonld-schemas.js')).default;
  //     const seoModuleInstance = apos.modules['@apostrophecms/seo'];
  //     const handler = new JsonLdSchemaHandler(
  //       {},
  //       seoModuleInstance.options.fieldMappings
  //     );

  //     const schemas = handler.generateSchemas(testData);
  //     const articleSchema = schemas.find(s => s['@type'] === 'Article');

  //     assert(articleSchema, 'Article schema should be generated');
  //     assert(articleSchema.author, 'Should have author from custom field');
  //     assert.strictEqual(articleSchema.author.name, 'Custom Author');
  //     assert(articleSchema.description, 'Should have description from custom field');
  //     assert.strictEqual(articleSchema.description, 'Custom summary field');
  //   });
  // });
});

async function insertTestContent(apos) {
  const req = apos.task.getReq();

  // Insert a test article
  const articleModule = apos.modules.article;
  const articleInstance = articleModule.newInstance();

  await apos.article.insert(req, {
    ...articleInstance,
    title: 'Sample Article',
    slug: 'sample-article',
    author: 'Test Author',
    publishedAt: new Date('2024-01-01'),
    visibility: 'public'
  });
}

function getAppConfig() {
  return {
    '@apostrophecms/express': {
      options: {
        session: { secret: 'supersecret' },
        port: 3000
      }
    },
    '@apostrophecms/seo': {
      options: {
        alias: 'seo'
      }
    },
    article: {},
    'article-page': {},
    'default-page': {},
    // Module WITHOUT SEO fields to test seoFields: false
    'review-without-seo': {
      extend: '@apostrophecms/piece-type',
      options: {
        label: 'Review (No SEO)',
        pluralLabel: 'Reviews (No SEO)',
        alias: 'reviewWithoutSeo',
        seoFields: false
      },
      fields: {
        add: {
          rating: {
            label: 'Rating',
            type: 'integer',
            min: 1,
            max: 5
          },
          content: {
            label: 'Content',
            type: 'string',
            textarea: true
          }
        }
      }
    },
    '@apostrophecms/page': {
      options: {
        types: [
          {
            name: '@apostrophecms/home-page',
            label: 'Home'
          },
          {
            name: 'default-page',
            label: 'Default'
          }
        ],
        park: [
          {
            type: 'article-page',
            title: 'Articles',
            slug: 'articles/',
            parkedId: 'article'
          }
        ]
      }
    },
    '@apostrophecms/blog': {}
  };
}

// function getAppConfigWithMappings() {
//   return {
//     '@apostrophecms/express': {
//       options: {
//         session: { secret: 'supersecret' },
//         port: 3000
//       }
//     },
//     '@apostrophecms/seo': {
//       options: {
//         alias: 'seo',
//         fieldMappings: {
//           author: 'writerName',
//           image: '_heroImage',
//           description: 'summary'
//         }
//       }
//     },
//     article: {
//       extend: '@apostrophecms/piece-type',
//       options: {
//         label: 'Article',
//         pluralLabel: 'Articles',
//         alias: 'article'
//       },
//       fields: {
//         add: {
//           writerName: {
//             type: 'string',
//             label: 'Writer'
//           },
//           summary: {
//             type: 'string',
//             label: 'Summary'
//           }
//         }
//       }
//     },
//     'article-page': {}
//   };
//  };
