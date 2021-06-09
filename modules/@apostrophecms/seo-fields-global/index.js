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
        fields: [],
        last: true
      }
    };
    if (options.seoGoogleTagManager) {
      add.seoGoogleTagManager = {
        label: 'Google Tag Manager ID',
        type: 'string',
        help: 'Container ID provided in Google Tag Manager (e.g., GTM-RPCVDTN).'
      };
      group.seo.fields.push('seoGoogleTagManager');
    }
    if (options.seoGooglAnalytics) {
      add.seoGoogleTrackingId = {
        label: 'Google Tracking ID',
        type: 'string',
        help: 'Tracking ID provided by Google for Google Analytics.'
      };
      group.seo.fields.push('seoGoogleTrackingId');
    }
    if (options.seoGoogleVerification) {
      add.seoGoogleVerificationId = {
        label: 'Google Verification ID',
        type: 'string',
        help: 'Verification ID provided by Google for the HTML meta tag verification option.'
      };
      group.seo.fields.push('seoGoogleVerificationId');
    }
    return Object.keys(add).length 
      ? {
        add,
        group
      }
      : null
  }
};
