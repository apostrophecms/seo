module.exports = {
  improve: '@apostrophecms/doc-type',
  fields(self, options) {
    if (options.seoFields !== false) {
      return {
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
    }
  }
};
