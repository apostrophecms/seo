const _ = require('lodash');

module.exports = {
  improve: '@apostrophecms/doc-type',
  fields(self, options) {
    if (options.seoFields !== false) {
      const configuration = {
        add: {
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
          }
        },
        group: {
          seo: {
            label: 'aposSeo:group',
            fields: [
              'seoTitle',
              'seoDescription',
              'seoRobots'
            ],
            last: true
          }
        }
      };

      if (self.options.seoCanonicalTypes
        && Array.isArray(self.options.seoCanonicalTypes)
        && self.options.seoCanonicalTypes.length) {

        const req = options.apos.task.getReq();

        self.options.seoCanonicalTypes.forEach(canonicalType => {
          const name = canonicalType.startsWith('@apostrophecms/') ? canonicalType.split('@apostrophecms/')[1] : canonicalType;
          const fieldName = `_seoCanonical${_.capitalize(_.camelCase(name))}`;
          const moduleName = options.apos.modules[canonicalType] && options.apos.modules[canonicalType].label
            ? options.apos.modules[canonicalType].label
            : name;
          const label = req.t('aposSeo:canonicalModule', { type: _.startCase(req.t(moduleName)) });
          const help = req.t('aposSeo:canonicalModuleHelp', { type: _.lowerCase(self.__meta.name) });

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
            }
          };

          configuration.group.seo.fields.push(fieldName);
        });
      }

      return configuration;
    }
  }
};
