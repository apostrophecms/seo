const fs = require('fs');
const path = require('path');
const {
  getMetaHead, getTagManagerHead, getTagManagerBody
} = require('./lib/nodes');

module.exports = {
  options: {
    alias: 'seo',
    i18n: {
      ns: 'aposSeo',
      browser: true
    }
  },
  bundle: {
    directory: 'modules',
    modules: getBundleModuleNames()
  },
  init(self) {
    self.prependNodes('head', 'metaHead');
    self.appendNodes('head', 'tagManagerHead');
    self.prependNodes('body', 'tagManagerBody');
  },
  methods(self, options) {
    return {
      metaHead(req) {
        const theSchema = getMetaHead(req.data, options);
        // console.log('the schema!!!!', theSchema);
        return theSchema;
      },
      tagManagerHead(req) {
        return getTagManagerHead(req.data);
      },
      tagManagerBody(req) {
        return getTagManagerBody(req.data);
      }
    };
  }
};

function getBundleModuleNames() {
  const source = path.join(__dirname, './modules/@apostrophecms');
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => `@apostrophecms/${dirent.name}`);
}
