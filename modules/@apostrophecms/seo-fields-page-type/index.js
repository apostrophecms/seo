module.exports = {
  improve: '@apostrophecms/page-type',
  fields(self, options) {
    if (options.seoFields !== false) {
      return {
        add: {
          _seoCanonical: {
            label: 'Canonical Link',
            type: 'relationship',
            max: 1,
            withType: '@apostrophecms/page',
            help: 'Is there a main version of this page that search engines should direct to?',
            filters: {
              projection: {
                title: 1,
                slug: 1,
                _url: 1
              }
            }
          }
        },
        group: {
          seo: {
            label: 'SEO',
            fields: [ '_seoCanonical' ],
            last: true
          }
        }
      };
    }
  }
};
