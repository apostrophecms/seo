<div align="center">
  <img src="https://raw.githubusercontent.com/apostrophecms/apostrophe/main/logo.svg" alt="ApostropheCMS logo" width="80" height="80">

  <h1>SEO tools for ApostropheCMS</h1>
  <p>
    <a aria-label="Apostrophe logo" href="https://docs.apostrophecms.org">
      <img src="https://img.shields.io/badge/MADE%20FOR%20ApostropheCMS-000000.svg?style=for-the-badge&logo=Apostrophe&labelColor=6516dd">
    </a>
    <a aria-label="Join the community on Discord" href="http://chat.apostrophecms.org">
      <img alt="" src="https://img.shields.io/discord/517772094482677790?color=5865f2&label=Join%20the%20Discord&logo=discord&logoColor=fff&labelColor=000&style=for-the-badge&logoWidth=20">
    </a>
    <a aria-label="License" href="https://github.com/apostrophecms/blog/blob/main/LICENSE.md">
      <img alt="" src="https://img.shields.io/static/v1?style=for-the-badge&labelColor=000000&label=License&message=MIT&color=3DA639">
    </a>
  </p>
</div>

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

It is important to set the `baseUrl` option on your ApostropheCMS application for various reasons. In the SEO module, it contributes to building the correct `canonical` link tag URL, so in production search engines and web crawlers will register the correct link. The `baseUrl` can be set multiple ways:

**With the `APOS_BASE_URL` environment variable**

How you set the variable will depend on your hosting setup.

**As part of an environment configuration in `data/local.js`**

This method is if you are using stagecoach or a similar system for deployment.
```js
  module.exports = {
    baseUrl: 'https://mysite.com',
    modules: {
      // other module env configuration
    }
  };
```

**Via the multisite module if using [Apostrophe Assembly](https://apostrophecms.com/extensions/multisite-apostrophe-assembly)**

See the multisite documentation for details.

### 2. Module configuration

#### SEO fields for pages

SEO fields are enabled automatically for any page-type module. The following modules disable SEO field enhancements by default by setting the `seoFields` option to `false`:
 - `@apostrophecms/global`
 - `@apostrophecms/user`
 - `@apostrophecms/image`
 - `@apostrophecms/image-tag`
 - `@apostrophecms/file`
 - `@apostrophecms/file-tag`

```js
module.exports = {
  extend: '@apostrophecms/page-type'
  options: {
    label: 'Personnel',
    seoFields: false
  }
};
```

The `@apostrophecms/seo` module adds a new tab labeled `SEO` to the document editor. This tab contains fields for setting the title, description, robots tag, and canonical link meta data to the head section of the page.

#### SEO fields for pieces

SEO fields for pieces are automatically enabled unless you **disable** them by setting the `seoFields: false` optino for that piece type.

Unless disabled, a new SEO tab will be added with fields for title, description, and robots tag meta fields.

```js
module.exports = {
  extend: '@apostrophecms/piece-type'
  options: {
    label: 'Article',
    // Turn SEO fields *off* (the default is to turn them on)
    seoFields: false
  }
};
```

#### Canonical links

"Canonical links" are useful when a piece or page should **not** be considered the official version of a document,
and you would prefer that search engines look elsewhere. This feature is always available for pages.

If you wish to have this feature for a piece type, you will need to specify the
`seoCanonicalTypes` option to that piece type module, as an array of types that the editor
can choose from. For example:

```js
module.exports = {
  extend: '@apostrophecms/piece-type'
  options: {
    label: 'Article',
    // allow the editor to select a published page or a `topic` piece as the
    // "canonical" version of this article
    seoCanonicalTypes: [ '@apostrophecms/page', 'topic' ]
  }
};
```

This adds additional fields in the SEO tab for choosing a canonical document for search
engines to consider instead.

> Note that you cannot link to specific page-types, only all pages through `@apostrophecms/page`, but you can link to specific piece-types.

#### Add Google Analytics (GA)

Setting `seoGoogleAnalytics: true` in `@apostrophecms/global` will add a Google Analytics tracking ID field to your Global configuration:
```js
require('apostrophe')({
  shortName: 'MYPROJECT',
  modules: {
    '@apostrophecms/seo': {},
    '@apostrophecms/global': {
      options: {
        seoGoogleAnalytics: true
      }
    }
  }
});
```
#### Add Google Tag Manager (GTM)

Setting `seoGoogleTagManager: true` in `@apostrophecms/global` will add a Google Tag Manager ID field to your Global configuration:

```js
require('apostrophe')({
  shortName: 'MYPROJECT',
  modules: {
    '@apostrophecms/seo': {},
    '@apostrophecms/global': {
      options: {
        seoGoogleTagManager: true
      }
    }
  }
});
```
#### Add Google Site Verification

Setting `seoGoogleVerification: true` in `@apostrophecms/global` will add a Google Site Verification ID field to your Global configuration:

```js
require('apostrophe')({
  shortName: 'MYPROJECT',
  modules: {
    '@apostrophecms/seo': {},
    '@apostrophecms/global': {
      options: {
        seoGoogleVerification: true
      }
    }
  }
});
```

#### Add `robots.txt` to Your Site
By default, the SEO extension will add a route to your site for `/robots.txt` that will return a string that allows for all search engines to index your site.

```
User-agent: *\nDisallow:
```
Within the global configuration you can choose to change this to disallow search engine indexing:

```
User-agent: *\nDisallow: /
```

You can also select to add a custom string for your `robots.txt`. This can allow you finer control over what sections of your site can be indexed and by which bots.

Note that if you allow search engines to index your site, you can still set `noindex` and/or `nofollow` on a per-page basis from the SEO tab of the individual page editing modals. If you disallow indexing of your site, settings for individual pages will be ignored.

A physical `robots.txt` file in `public/robots.txt`, or `sites/public/robots.txt` in an Assembly project, will override any settings made in this module. If you don't want a one-size-fits all policy for all sites, don't use a physical file.

### Notes

#### Canonical URls

**The canonical link field** on a page or piece allows an editor to select another page that search engines should understand to be the primary version of that page or piece. [As described on Moz.com](https://moz.com/learn/seo/canonicalization):

> A canonical tag (aka "rel canonical") is a way of telling search engines that a specific URL represents the primary copy of a page. Using the canonical tag prevents problems caused by identical or "duplicate" content appearing on multiple URLs. Practically speaking, the canonical tag tells search engines which version of a URL you want to appear in search results.

For pages, this link can be to any published page. For pieces, this can be either a published page or another piece-page-type show page.

#### Custom Google Analytics Event on 404
Optionally add the following include to your `notFound.html` view. If the app has a Google Tracking ID value entered, this will send an event to Google Analytics tracking the 404 response, the URL on which it happened, and, if applicable, the page on which the bad URL was triggered (helping you identify where bad links are located).

```nunjucks
{% block extraBody %}
  {{ super() }}
  {% include "@apostrophecms/seo:404.html" %}
{% endblock %}
```

If you already have an `extraBody` block in the `notFound.html` view file, you'll only need to add the `{% include "@apostrophecms/seo:404.html" %}` statement somewhere in that.
```nunjucks
{% block extraBody %}
  {# ...Other templating... #}
  {% include "@apostrophecms/seo:404.html" %}
{% endblock %}
```
#### Field Reference
The following are the fields that can be added to pieces, pages, and the global doc, as well as what module option enables them.

|Name |Description  | Module Effected | Module Option |
--- | --- | --- | ---
|`seoTitle`|Title attribute, populates `<meta name="title" />` tag|`@apostrophecms/doc-type`|_Enabled by default_|
|`seoDescription`|Description attribute, populates `<meta name="description" />` tag|`@apostrophecms/doc-type`|_Enabled by default_|
|`seoRobots`|Robots attribute, populates `<meta name="robots" />` tag|`@apostrophecms/doc-type`|_Enabled by default_|
|`_seoCanonical`|[Canonical URL](https://moz.com/learn/seo/canonicalization), populates `<link rel="canonical" />` tag|`@apostrophecms/page-type`|_Enabled by default_|
|`seoGoogleTagManager`|Google Tag Manager Container ID|`@apostrophecms/global`|`seoGoogleTagManager: true`|
|`seoGoogleTrackingId`|Google Analytics ID|`@apostrophecms/global`|`seoGoogleAnalytics: true`|
|`seoGoogleVerificationId`|Google Verification ID, populates `<meta name="google-site-verification" />`|`@apostrophecms/global`|`seoGoogleVerification: true`|
