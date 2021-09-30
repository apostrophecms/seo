module.exports = {
  improve: '@apostrophecms/global',
  options: {
    seoFields: false
  },
  fields(self, options) {
    const add = {};
    const group = {
      seo: {
        label: 'aposSeo:group',
        fields: [],
        last: true
      }
    };
    if (options.seoGoogleTagManager) {
      add.seoGoogleTagManager = {
        label: 'aposSeo:gtmIdHelp',
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
    return Object.keys(add).length
      ? {
        add,
        group
      }
      : null;
  }
};
