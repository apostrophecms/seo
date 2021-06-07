module.exports = {
  improve: '@apostrophecms/global',
  options: {
    seoFields: false
  },
  fields(self, options) {
    const add = {};
    const group = {
      seo: {
        label: 'SEO',
        fields: [
          'seoGoogleTagManager',
          'seoGoogleTrackingId',
          'seoGoogleVerificationId'
        ],
        last: true
      }
    };
    if (options.seoTagMangerOnly || options.seoGoogleTagManager) {
      add.seoGoogleTagManager = {
        label: 'Google Tag Manager ID',
        type: 'string',
        help: 'Container ID provided in Google Tag Manager (e.g., GTM-RPCVDTN).'
      };
    }
    if (options.seoGoogleFields) {
      add.seoGoogleTrackingId = {
        label: 'Google Tracking ID',
        type: 'string',
        help: 'Tracking ID provided by Google for Google Analytics.'
      };
      add.seoGoogleVerificationId = {
        label: 'Google Verification ID',
        type: 'string',
        help: 'Verification ID provided by Google for the HTML meta tag verification option.'
      };
    }
    return {
      add,
      group: Object.keys(add).length ? group : null
    };
  }
};
