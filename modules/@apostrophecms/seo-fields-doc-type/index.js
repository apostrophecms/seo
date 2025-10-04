// modules/@apostrophecms/doc-type/index.js
const _ = require('lodash');

module.exports = {
  improve: '@apostrophecms/doc-type',
  fields(self, options) {
    if (options.seoFields === false) {
      return;
    }

    const configuration = {
      add: {
        // ALWAYS VISIBLE - Basic SEO fields (used for meta tags regardless of schema)
        seoTitle: {
          label: 'aposSeo:title',
          type: 'string',
          htmlHelp: 'aposSeo:titleHtmlHelp'
        },
        seoDescription: {
          label: 'aposSeo:description',
          type: 'string',
          htmlHelp: 'aposSeo:descriptionHtmlHelp'
        },
        seoRobots: {
          label: 'aposSeo:robots',
          htmlHelp: 'aposSeo:robotsHtmlHelp',
          type: 'checkboxes',
          choices: [
            {
              label: 'aposSeo:robotsNoFollow',
              value: 'nofollow'
            },
            {
              label: 'aposSeo:robotsNoIndex',
              value: 'noindex'
            }
          ]
        },

        // SCHEMA TYPE SELECTOR
        seoJsonLdType: {
          label: 'aposSeo:schemaType',
          type: 'select',
          help: 'aposSeo:schemaTypeHelp',
          choices: [
            { label: 'None', value: '' },
            { label: 'Web Page', value: 'WebPage' },
            { label: 'Collection Page', value: 'CollectionPage' },
            { label: 'Article', value: 'Article' },
            { label: 'Product', value: 'Product' },
            { label: 'Event', value: 'Event' },
            { label: 'Person', value: 'Person' },
            { label: 'Local Business', value: 'LocalBusiness' },
            { label: 'FAQ Page', value: 'FAQPage' },
            { label: 'Video', value: 'VideoObject' }
          ]
        },

        // CONDITIONAL: Article-specific fields
        // Article uses seoTitle/seoDescription from above, so no extra fields needed currently
        
        // CONDITIONAL: Product Schema Fields
        seoJsonLdProduct: {
          label: 'aposSeo:productDetails',
          type: 'object',
          help: 'aposSeo:productDetailsHelp',
          if: {
            seoJsonLdType: 'Product'
          },
          fields: {
            add: {
              name: {
                label: 'aposSeo:productName',
                type: 'string',
                help: 'aposSeo:productNameHelp',
                required: true
              },
              description: {
                label: 'aposSeo:productDescription',
                type: 'string',
                textarea: true
              },
              price: {
                label: 'aposSeo:price',
                type: 'float'
              },
              currency: {
                label: 'aposSeo:currency',
                type: 'string',
                def: 'USD'
              },
              availability: {
                label: 'aposSeo:availability',
                type: 'select',
                def: 'InStock',
                choices: [
                  { label: 'In Stock', value: 'InStock' },
                  { label: 'Out of Stock', value: 'OutOfStock' },
                  { label: 'Pre-order', value: 'PreOrder' },
                  { label: 'Discontinued', value: 'Discontinued' }
                ]
              },
              brand: {
                label: 'aposSeo:brand',
                type: 'string'
              },
              sku: {
                label: 'aposSeo:sku',
                type: 'string',
                help: 'aposSeo:skuHelp'
              },
              gtin: {
                label: 'aposSeo:gtin',
                type: 'string',
                help: 'aposSeo:gtinHelp'
              },
              condition: {
                label: 'aposSeo:condition',
                type: 'select',
                def: 'NewCondition',
                choices: [
                  { label: 'New', value: 'NewCondition' },
                  { label: 'Used', value: 'UsedCondition' },
                  { label: 'Refurbished', value: 'RefurbishedCondition' },
                  { label: 'Damaged', value: 'DamagedCondition' }
                ]
              },
              rating: {
                label: 'aposSeo:rating',
                type: 'float',
                min: 0,
                max: 5,
                help: 'aposSeo:ratingHelp'
              },
              reviewCount: {
                label: 'aposSeo:reviewCount',
                type: 'integer',
                min: 0,
                help: 'aposSeo:reviewCountHelp'
              }
            }
          }
        },

        // CONDITIONAL: Event Schema Fields
        seoJsonLdEvent: {
          label: 'aposSeo:eventDetails',
          type: 'object',
          help: 'aposSeo:eventDetailsHelp',
          if: {
            seoJsonLdType: 'Event'
          },
          fields: {
            add: {
              name: {
                label: 'aposSeo:eventName',
                type: 'string',
                help: 'aposSeo:eventNameHelp',
                required: true
              },
              description: {
                label: 'aposSeo:eventDescription',
                type: 'string',
                textarea: true
              },
              startDate: {
                label: 'aposSeo:startDate',
                type: 'date'
              },
              endDate: {
                label: 'aposSeo:endDate',
                type: 'date'
              },
              location: {
                label: 'aposSeo:eventLocation',
                type: 'object',
                fields: {
                  add: {
                    name: {
                      label: 'aposSeo:locationName',
                      type: 'string'
                    },
                    address: {
                      label: 'aposSeo:locationAddress',
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        },

        // CONDITIONAL: Person Schema Fields
        seoJsonLdPerson: {
          label: 'aposSeo:personDetails',
          type: 'object',
          help: 'aposSeo:personDetailsHelp',
          if: {
            seoJsonLdType: 'Person'
          },
          fields: {
            add: {
              name: {
                label: 'aposSeo:personName',
                type: 'string',
                help: 'aposSeo:personNameHelp',
                required: true
              },
              description: {
                label: 'aposSeo:personDescription',
                type: 'string',
                textarea: true
              },
              jobTitle: {
                label: 'aposSeo:jobTitle',
                type: 'string'
              },
              organization: {
                label: 'aposSeo:organization',
                type: 'string'
              }
            }
          }
        },

        // CONDITIONAL: Local Business Schema Fields
        seoJsonLdBusiness: {
          label: 'aposSeo:businessDetails',
          type: 'object',
          help: 'aposSeo:businessDetailsHelp',
          if: {
            seoJsonLdType: 'LocalBusiness'
          },
          fields: {
            add: {
              name: {
                label: 'aposSeo:businessName',
                type: 'string',
                required: true
              },
              description: {
                label: 'aposSeo:businessDescription',
                type: 'string',
                textarea: true
              },
              telephone: {
                label: 'aposSeo:businessPhone',
                type: 'string'
              },
              address: {
                label: 'aposSeo:businessAddress',
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
              },
              openingHours: {
                label: 'aposSeo:openingHours',
                type: 'array',
                titleField: 'hours',
                fields: {
                  add: {
                    hours: {
                      label: 'aposSeo:hours',
                      type: 'string',
                      help: 'aposSeo:hoursHelp'
                    }
                  }
                }
              }
            }
          }
        },

        // CONDITIONAL: FAQ Page Fields
        seoJsonLdFAQ: {
          label: 'aposSeo:faqDetails',
          type: 'object',
          help: 'aposSeo:faqDetailsHelp',
          if: {
            seoJsonLdType: 'FAQPage'
          },
          fields: {
            add: {
              questions: {
                label: 'aposSeo:faqQuestions',
                type: 'array',
                titleField: 'question',
                fields: {
                  add: {
                    question: {
                      label: 'aposSeo:question',
                      type: 'string',
                      required: true
                    },
                    answer: {
                      label: 'aposSeo:answer',
                      type: 'string',
                      textarea: true,
                      required: true
                    }
                  }
                }
              }
            }
          }
        },

        // CONDITIONAL: Video Object Fields
        seoJsonLdVideo: {
          label: 'aposSeo:videoDetails',
          type: 'object',
          help: 'aposSeo:videoDetailsHelp',
          if: {
            seoJsonLdType: 'VideoObject'
          },
          fields: {
            add: {
              name: {
                label: 'aposSeo:videoName',
                type: 'string',
                help: 'aposSeo:videoNameHelp',
                required: true
              },
              description: {
                label: 'aposSeo:videoDescription',
                type: 'string',
                textarea: true
              },
              uploadDate: {
                label: 'aposSeo:videoUploadDate',
                type: 'date'
              },
              duration: {
                label: 'aposSeo:videoDuration',
                type: 'string',
                help: 'aposSeo:videoDurationHelp'
              },
              _thumbnail: {
                label: 'aposSeo:videoThumbnail',
                type: 'relationship',
                withType: '@apostrophecms/image',
                max: 1,
                help: 'aposSeo:videoThumbnailHelp'
              },
              contentUrl: {
                label: 'aposSeo:videoUrl',
                type: 'url',
                help: 'aposSeo:videoUrlHelp'
              },
              embedUrl: {
                label: 'aposSeo:videoEmbedUrl',
                type: 'url',
                help: 'aposSeo:videoEmbedUrlHelp'
              }
            }
          }
        },

        // CONDITIONAL: ItemList toggle (only for collection/listing pages)
        seoIncludeItemList: {
          label: 'aposSeo:includeItemList',
          help: 'aposSeo:includeItemListHelp',
          type: 'boolean',
          def: true,
          if: {
            seoJsonLdType: 'CollectionPage'
          }
        }
      },
      group: {
        seo: {
          label: 'aposSeo:group',
          fields: [
            'seoTitle',
            'seoDescription',
            'seoRobots',
            'seoJsonLdType',
            // Conditional fields automatically appear based on 'if' conditions
            'seoJsonLdProduct',
            'seoJsonLdEvent',
            'seoJsonLdPerson',
            'seoJsonLdBusiness',
            'seoJsonLdFAQ',
            'seoJsonLdVideo',
            'seoIncludeItemList'
          ],
          last: true
        }
      }
    };

    // Canonical linking for pieces (if configured)
    if (self.options.seoCanonicalTypes &&
      Array.isArray(self.options.seoCanonicalTypes) &&
      self.options.seoCanonicalTypes.length) {

      const req = options.apos.task.getReq();
      const choices = [];
      configuration.add.seoSelectType = {
        type: 'select',
        label: req.t('aposSeo:canonicalSelectType'),
        choices,
        def: null
      };
      configuration.group.seo.fields.push('seoSelectType');

      self.options.seoCanonicalTypes.forEach(canonicalType => {
        const name = canonicalType.split(/^apostrophecms\/|apostrophecms-pro\//)[1] || canonicalType;
        const fieldName = `_${_.camelCase(`seoCanonical ${name}`)}`;
        const { label: moduleName = name } = options.apos.modules[canonicalType] || {};
        const label = req.t('aposSeo:canonicalModule', { type: _.startCase(req.t(moduleName)) });
        const help = req.t('aposSeo:canonicalModuleHelp', { type: _.lowerCase(self.__meta.name) });

        choices.push({
          label: _.startCase(req.t(moduleName)),
          value: fieldName
        });
        configuration.add[fieldName] = {
          help,
          label,
          max: 1,
          type: 'relationship',
          withType: canonicalType,
          builders: {
            project: {
              title: 1,
              slug: 1,
              _url: 1
            }
          },
          if: {
            seoSelectType: fieldName
          }
        };

        configuration.group.seo.fields.push(fieldName);
      });
    }

    return configuration;
  }
};