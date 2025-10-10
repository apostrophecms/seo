module.exports = {
  improve: '@apostrophecms/global',
  options: {
    seoFields: false
  },
  fields(self, options) {
    const add = {
      robotsTxtSelection: {
        label: 'aposSeo:robotsTxtSelection',
        type: 'select',
        def: 'allow',
        help: 'aposSeo:robotsTxtSelectionHelp',
        choices: [
          {
            label: 'aposSeo:robotsTxtAllow',
            value: 'allow'
          },
          {
            label: 'aposSeo:robotsTxtDisallow',
            value: 'disallow'
          },
          {
            label: 'aposSeo:robotsTxtCustom',
            value: 'custom'
          }
        ]
      },
      robotsCustomText: {
        label: 'aposSeo:robotsCustomText',
        type: 'string',
        textarea: true,
        required: true,
        if: {
          robotsTxtSelection: 'custom'
        }
      },
      // JSON-LD Site-wide settings
      seoSiteName: {
        label: 'aposSeo:siteName',
        type: 'string',
        help: 'aposSeo:siteNameHelp'
      },
      seoSiteDescription: {
        label: 'aposSeo:siteDescription',
        type: 'string',
        textarea: true,
        help: 'aposSeo:siteDescriptionHelp'
      },
      seoSiteCanonicalUrl: {
        label: 'aposSeo:siteCanonicalUrl',
        type: 'url',
        required: true,
        help: 'aposSeo:siteCanonicalUrlHelp'
      },
      seoJsonLdOrganization: {
        label: 'aposSeo:organizationInfo',
        type: 'object',
        help: 'aposSeo:organizationInfoHelp',
        fields: {
          add: {
            name: {
              label: 'aposSeo:orgName',
              type: 'string',
              required: true
            },
            type: {
              label: 'aposSeo:orgType',
              type: 'select',
              def: 'Organization',
              choices: [
                { label: 'Organization', value: 'Organization' },
                { label: 'Corporation', value: 'Corporation' },
                { label: 'LocalBusiness', value: 'LocalBusiness' },
                { label: 'NGO', value: 'NGO' },
                { label: 'GovernmentOrganization', value: 'GovernmentOrganization' }
              ]
            },
            description: {
              label: 'aposSeo:orgDescription',
              type: 'string',
              textarea: true
            },
            _logo: {
              label: 'aposSeo:orgLogo',
              type: 'relationship',
              withType: '@apostrophecms/image',
              max: 1,
              help: 'aposSeo:orgLogoHelp'
            },
            contactPoint: {
              label: 'aposSeo:contactPoint',
              type: 'object',
              fields: {
                add: {
                  telephone: {
                    label: 'aposSeo:telephone',
                    type: 'string'
                  },
                  type: {
                    label: 'aposSeo:contactType',
                    type: 'select',
                    def: 'customer service',
                    choices: [
                      { label: 'Customer Service', value: 'customer service' },
                      { label: 'Sales', value: 'sales' },
                      { label: 'Support', value: 'technical support' },
                      { label: 'Billing', value: 'billing support' }
                    ]
                  }
                }
              }
            },
            address: {
              label: 'aposSeo:address',
              type: 'object',
              fields: {
                add: {
                  street: {
                    label: 'aposSeo:streetAddress',
                    type: 'string'
                  },
                  city: {
                    label: 'aposSeo:city',
                    type: 'string'
                  },
                  state: {
                    label: 'aposSeo:state',
                    type: 'string'
                  },
                  zip: {
                    label: 'aposSeo:postalCode',
                    type: 'string'
                  },
                  country: {
                    label: 'aposSeo:country',
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      },
      seoTwitterHandle: {
        label: 'aposSeo:twitterHandle',
        type: 'string',
        help: 'aposSeo:twitterHandleHelp'
      },
      _seoOpenGraphImage: {
        label: 'aposSeo:defaultOGImage',
        type: 'relationship',
        withType: '@apostrophecms/image',
        max: 1,
        help: 'aposSeo:defaultOGImageHelp'
      }
    }


    const group = {
      seo: {
        label: 'aposSeo:group',
        fields: [
          'robotsTxtSelection',
          'robotsCustomText',
          'seoSiteName',
          'seoSiteDescription',
          'seoSiteCanonicalUrl',
          'seoJsonLdOrganization'
        ],
        last: true
      }
    };

    if (options.seoGoogleTagManager) {
      add.seoGoogleTagManager = {
        label: 'aposSeo:gtmId',
        type: 'string',
        help: 'aposSeo:gtmIdHelp'
      };
      group.seo.fields.push('seoGoogleTagManager');
    }
    if (options.seoGoogleAnalytics) {
      add.seoGoogleTrackingId = {
        label: 'aposSeo:gaId',
        type: 'string',
        help: 'aposSeo:gaIdHelp'
      };
      group.seo.fields.push('seoGoogleTrackingId');
    }
    if (options.seoGoogleVerification) {
      add.seoGoogleVerificationId = {
        label: 'aposSeo:googleVerifyId',
        type: 'string',
        help: 'aposSeo:googleVerifyIdHelp'
      };
      group.seo.fields.push('seoGoogleVerificationId');
    }
    group.seo.fields.push('seoTwitterHandle', '_seoOpenGraphImage');

    return Object.keys(add).length
      ? {
        add,
        group
      }
      : null;
  },

  apiRoutes(self) {
    return {
      get: {
        '/robots.txt': async (req) => {
          const criteria = {
            type: '@apostrophecms/global'
          };
          try {
            const globalDoc = await self.apos.doc.find(req, criteria).toObject();
            let robotsTxtContent = '';
            switch (globalDoc.robotsTxtSelection) {
              case 'allow':
                robotsTxtContent = 'User-agent: *\nDisallow: \n';
                break;
              case 'disallow':
                robotsTxtContent = 'User-agent: *\nDisallow: /\n';
                break;
              case 'custom':
                robotsTxtContent = globalDoc.robotsCustomText || 'User-agent: *\nDisallow: /\n';
                break;
              default:
                robotsTxtContent = 'User-agent: *\nDisallow: \n';
            }

            req.res.setHeader('Content-Type', 'text/plain');
            return robotsTxtContent;
          } catch (err) {
            console.error(err);
            return 'An error occurred generating robots.txt';
          }
        },
        '/llms.txt': async (req) => {
          const global = await self.apos.doc.find(req, { type: '@apostrophecms/global' }).toObject();
          const baseUrl = global?.seoSiteCanonicalUrl || req.absoluteUrl.split('/').slice(0, 3).join('/');

          // Build the LLMS.txt content
          let content = `# ${global.seoSiteName || global.title || 'Website'}\n\n`;

          if (global.seoSiteDescription) {
            content += `${global.seoSiteDescription}\n\n`;
          }

          // Site Information
          content += `## Site Information\n\n`;
          content += `- URL: ${baseUrl}\n`;

          if (global.seoJsonLdOrganization?.name) {
            content += `- Organization: ${global.seoJsonLdOrganization.name}\n`;
            content += `- Type: ${global.seoJsonLdOrganization.type || 'Organization'}\n`;
          }

          if (global.seoJsonLdOrganization?.contactPoint?.telephone) {
            content += `- Contact: ${global.seoJsonLdOrganization.contactPoint.telephone}\n`;
          }

          content += `\n`;

          // Reference sitemap if the module exists
          const hasSitemap = self.apos.modules['@apostrophecms/sitemap'];
          if (hasSitemap) {
            content += `## Sitemap\n\n`;
            content += `- XML Sitemap: ${baseUrl}/sitemap.xml\n\n`;
          }

          // Key Pages - get top-level pages
          try {
            const pages = await self.apos.page.find(req, { level: { $lte: 1 }, archived: { $ne: true } })
              .permission('view')
              .project({ title: 1, _url: 1, seoDescription: 1 })
              .limit(10)
              .toArray();

            if (pages.length > 0) {
              content += `## Main Pages\n\n`;
              pages.forEach(page => {
                content += `### ${page.title}\n`;
                content += `- URL: ${page._url}\n`;
                if (page.seoDescription) {
                  content += `- Description: ${page.seoDescription}\n`;
                }
                content += `\n`;
              });
            }
          } catch (err) {
            console.error('Error fetching pages for llms.txt:', err);
          }

          // Content Types Available
          content += `## Content Types\n\n`;
          const pieceTypes = Object.values(self.apos.modules)
            .filter(m => m.__meta?.chain?.includes('@apostrophecms/piece-type'))
            .filter(m => m.options.seoFields !== false)
            .map(m => ({
              name: m.__meta.name,
              label: m.label || m.options.label || m.__meta.name
            }));

          if (pieceTypes.length > 0) {
            content += `This site contains the following content types:\n\n`;
            pieceTypes.forEach(type => {
              content += `- ${type.label}\n`;
            });
            content += `\n`;
          }

          // Technical Details
          content += `## Technical Details\n\n`;
          content += `- Platform: ApostropheCMS\n`;
          content += `- SEO Module: @apostrophecms/seo\n`;
          content += `- Robots: ${baseUrl}/robots.txt\n`;

          const schemaTypes = new Set();
          if (global.seoJsonLdOrganization?.name) schemaTypes.add('Organization');
          if (global.seoSiteName) schemaTypes.add('WebSite');

          if (schemaTypes.size > 0) {
            content += `- Structured Data: ${Array.from(schemaTypes).join(', ')}\n`;
          }

          content += `\n`;

          // Footer
          content += `## For AI/LLM Systems\n\n`;
          content += `This site uses structured data (JSON-LD) on pages for better context.\n`;
          content += `Check individual pages for schema.org markup including:\n`;
          content += `- WebPage/CollectionPage schemas\n`;
          content += `- Article, Product, Event, Person schemas\n`;
          content += `- BreadcrumbList navigation context\n`;
          content += `- ItemList for collection pages\n`;

          req.res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return content;
        }
      }
    };
  }
};