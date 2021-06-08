[![CircleCI](https://circleci.com/gh/apostrophecms/seo/tree/main.svg?style=svg)](https://circleci.com/gh/apostrophecms/seo/tree/main)
[![Chat on Discord](https://img.shields.io/discord/517772094482677790.svg)](https://chat.apostrophecms.org)

# SEO

SEO tools for [ApostropheCMS](https://apostrophecms.com/).

Add useful meta fields to all pages and pieces.

## Roadmap
|Feature |Status  |
--- | ---
|SEO Meta fields for pages and pieces| ✅ Implemented 
|SEO Page Scanner| 🚧 Under development

## Installation

```bash
npm install @apostrophecms/seo
```

## Use

### 1. Initialization
Configure `@apostrophecms/seo` in `app.js`.

```js
require('apostrophe')({
  shortName: 'MYPROJECT',
  modules: {
    '@apostrophecms/seo': {}
  }
});
```

#### Setting the `baseUrl`

It is important to set the `baseUrl` option on your ApostropheCMS application for various reasons. In the SEO module it contributes to building the correct `canonical` link tag URL. The `baseUrl` can be set two ways:

##### In `app.js` as part of your main Apostrophe app
```js
require('apostrophe')({
  shortName: 'mysite',
  baseUrl: 'http://mysite.com',
  modules: {
    // ...
  }
});
```
##### As part of an environment configuration in `data/local.js`
```js
  module.exports = {
    baseUrl: 'http://mysite.com',
    modules: {
      // other module env configuration
    }
  };
```
### 2. Module configuration
If you choose to disable fields for a piece type or page type you can do so by setting `seoFields: false` on the appropriate module. The following modules disable SEO field enhancements by default:
 - `@apostrophecms/global`
 - `@apostrophecms/user`
 - `@apostrophecms/group`
 - `@apostrophecms/image`
 - `@apostrophecms/image-tag`
 - `@apostrophecms/file`
 - `@apostrophecms/file-tag`

```js
module.exports = {
  options: {
    label: 'Person',
    pluralLabel: 'People',
    seoFields: false
  }
};
```

#### Add Google Analytics, Google Tag Manager, and/or Google Site Verification

If you would like to configure additional fields to allow an editor to add a Google Analytics tracking ID and a Google Site Verification ID you can do so by setting `seoGoogleFields: true` in `@apostrophecms/global` in your project.
```js
require('apostrophe')({
  shortName: 'MYPROJECT',
  modules: {
    '@apostrophecms/seo': {},
    '@apostrophecms/global': {
      options: {
        seoGoogleFields: true
      }
    }
  }
});
```

Add `seoGoogleTagManager: true` to also add a field for the Google Tag Manager ID (`seoGoogleFields` must also be `true` in this case).

```js
require('apostrophe')({
  shortName: 'MYPROJECT',
  modules: {
    '@apostrophecms/seo': {},
    '@apostrophecms/global': {
      options: {
        seoGoogleFields: true,
        seoGoogleTagManager: true,
      }
    }
  }
});
```

Finally, you may only want to use Google Tag Manager for all analytics and site verification needs. Set `seoTagManagerOnly: true` in `@apostrophecms/global` to do this. Doing so will override the other options, making their presence irrelevant if also set.
```js
require('apostrophe')({
  shortName: 'MYPROJECT',
  modules: {
    '@apostrophecms/seo': {},
    '@apostrophecms/global': {
      options: {
        seoTagManagerOnly: true
      }
    }
  }
});
```

**The canonical link field** on a page or piece allows an editor to select another page that search engines should understand to be the primary version of that page or piece. [As described on Moz.com](https://moz.com/learn/seo/canonicalization):

> A canonical tag (aka "rel canonical") is a way of telling search engines that a specific URL represents the primary copy of a page. Using the canonical tag prevents problems caused by identical or "duplicate" content appearing on multiple URLs. Practically speaking, the canonical tag tells search engines which version of a URL you want to appear in search results.

**Optionally add the following include to your `notFound.html` view.** If the app has a Google Tracking ID value entered, this will send an event to Google Analytics tracking the 404 response, the URL on which it happened, and, if applicable, the page on which the bad URL was triggered (helping you identify where bad links are located).

```nunjucks
{% block extraBody %}
  {{ super() }}
  {% include "@apostrophecms/seo:404.html" %}
{% endblock %}
```

If you already have an `extraBody` block in the `notFound.html` view file, you'll only need to add the `{% include "apostrophe-seo:notFound.html" %}` statement somewhere in that.
```nunjucks
{% block extraBody %}
  {# ...Other templating... #}
  {% include "@apostrophecms/seo:404.html" %}
{% endblock %}
```
