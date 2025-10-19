<div align="center">
  <img src="https://raw.githubusercontent.com/apostrophecms/apostrophe/main/logo.svg" alt="ApostropheCMS logo" width="80" height="80">

  <h1>SEO Tools for ApostropheCMS</h1>
  <p>
    <a aria-label="Apostrophe logo" href="https://docs.apostrophecms.org">
      <img src="https://img.shields.io/badge/MADE%20FOR%20ApostropheCMS-000000.svg?style=for-the-badge&logo=Apostrophe&labelColor=6516dd">
    </a>
    <a aria-label="Join the community on Discord" href="http://chat.apostrophecms.org">
      <img alt="" src="https://img.shields.io/discord/517772094482677790?color=5865f2&label=Join%20the%20Discord&logo=discord&logoColor=fff&labelColor=000&style=for-the-badge&logoWidth=20">
    </a>
    <a aria-label="License" href="https://github.com/apostrophecms/seo/blob/main/LICENSE.md">
      <img alt="" src="https://img.shields.io/static/v1?style=for-the-badge&labelColor=000000&label=License&message=MIT&color=3DA639">
    </a>
  </p>
</div>

**Ensure your content gets found by search engines and AI systems** with comprehensive SEO management for ApostropheCMS. Essential meta fields, Google Analytics integration, automated `robots.txt` and `llms.txt` generation—everything you need to boost your search rankings, control AI training usage, and drive organic traffic.
<!-- omit in toc-->
## Why ApostropheCMS SEO Tools?

- **🎯 Complete SEO Control**: Essential meta fields for titles, descriptions, and canonical URLs
- **📊 Analytics Ready**: Built-in Google Analytics, Tag Manager, and Site Verification integration
- **🤖 Smart Automation**: Automatic robots.txt generation with granular control
- **🤖 AI-Ready**: Automatic llms.txt generation for AI crawler control and training transparency
- **📱 Social Media Ready**: Open Graph and Twitter Card meta tags for rich social sharing
- **⚡ Zero Configuration**: Works out of the box with all page and piece types
- **🔍 Search Engine Friendly**: Proper canonical linking prevents duplicate content issues
- **📈 Marketing Team Ready**: Easy-to-use interface for non-technical content creators
- **💰 E-commerce Ready**: Rich structured data for products, offers, and pricing

<!-- omit in toc -->
## Compatibility

This version requires the latest ApostropheCMS. When adding this module to an existing project, run `npm update` to ensure all ApostropheCMS modules are up-to-date.

## Table of Contents

- [Why ApostropheCMS SEO Tools?](#why-apostrophecms-seo-tools)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Features](#core-features)
  - [Automatic SEO Fields](#automatic-seo-fields)
  - [Google Analytics \& Tag Manager](#google-analytics--tag-manager)
  - [Social Media Meta Tags](#social-media-meta-tags)
  - [Automated Robots.txt](#automated-robotstxt)
  - [AI Crawler Control (llms.txt)](#ai-crawler-control-llmstxt)
  - [Sitemap Integration](#sitemap-integration)
- [Structured Data \& Schema Types](#structured-data--schema-types)
  - [How It Works](#how-it-works)
  - [Choosing the Right Schema](#choosing-the-right-schema)
    - [**Web Page**](#web-page)
    - [**Collection Page**](#collection-page)
    - [**Article**](#article)
    - [**Product**](#product)
    - [**Offer**](#offer)
    - [**Aggregate Offer**](#aggregate-offer)
    - [**Event**](#event)
    - [**Person**](#person)
    - [**Local Business**](#local-business)
    - [**Job Posting**](#job-posting)
    - [**FAQ Page**](#faq-page)
    - [**QA Page**](#qa-page)
    - [**Video Object**](#video-object)
    - [**How To**](#how-to)
    - [**Review**](#review)
    - [**Recipe**](#recipe)
    - [**Course**](#course)
  - [E-commerce Best Practices](#e-commerce-best-practices)
  - [Quick Schema Selection Guide](#quick-schema-selection-guide)
- [Implementation Guidelines for Developers](#implementation-guidelines-for-developers)
  - [Featured Images](#featured-images)
  - [Paywalled Content](#paywalled-content)
  - [Author Information](#author-information)
  - [URL Requirements](#url-requirements)
  - [Date Fields](#date-fields)
  - [Listing Pages (Item List)](#listing-pages-item-list)
  - [Summary: Required Fields by Schema Type](#summary-required-fields-by-schema-type)
  - [Best Practices](#best-practices)
  - [ItemList Generation](#itemlist-generation)
  - [Debugging Structured Data](#debugging-structured-data)
- [Essential Configuration](#essential-configuration)
  - [Setting the Base URL](#setting-the-base-url)
- [AI \& Search Strategy](#ai--search-strategy)
  - [Recommended Configuration for Most Sites](#recommended-configuration-for-most-sites)
  - [For Maximum AI Visibility](#for-maximum-ai-visibility)
  - [For Maximum Privacy/Protection](#for-maximum-privacyprotection)
  - [Understanding the Difference](#understanding-the-difference)
  - [Google Analytics Integration](#google-analytics-integration)
  - [Google Tag Manager Integration](#google-tag-manager-integration)
  - [Google Site Verification](#google-site-verification)
  - [Sitemap Installation](#sitemap-installation)
- [Advanced Configuration](#advanced-configuration)
  - [Disabling SEO Fields](#disabling-seo-fields)
  - [Canonical Link Configuration](#canonical-link-configuration)
  - [Pagination Support](#pagination-support)
  - [Custom 404 Tracking](#custom-404-tracking)
- [Performance Optimization](#performance-optimization)
  - [Critical Font Preloading](#critical-font-preloading)
  - [Mobile Optimization](#mobile-optimization)
- [Field Reference](#field-reference)
- [🚀 Ready for AI-Powered SEO?](#-ready-for-ai-powered-seo)
  - [✨ SEO Assistant Pro Features](#-seo-assistant-pro-features)
- [🏢 Managing Multiple Sites?](#-managing-multiple-sites)
  - [✨ Assembly Multisite Features](#-assembly-multisite-features)
- [Roadmap](#roadmap)

## Installation

```bash
npm install @apostrophecms/seo
```

## Quick Start

Configure the module in your `app.js` file:

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'my-project',
  modules: {
    '@apostrophecms/seo': {}
  }
});
```

**Important:** For proper SEO functionality, you must also configure your site's base URL. See the [Essential Configuration](#essential-configuration) section below.

## Core Features

### Automatic SEO Fields

![The module adds an SEO tab to your editing modals](https://static.apostrophecms.com/apostrophecms/seo/images/seo-modal.png)

The module automatically adds an "SEO" tab to all page and piece editors containing:

- **Title Tag**: Custom titles for search results (falls back to page title)
- **Meta Description**: Compelling descriptions that appear in search results
- **Robots Meta Tag**: Control search engine indexing and following behavior
- **Canonical URLs**: Prevent duplicate content penalties
- **Schema Type Selection**: Choose the appropriate structured data type for your content

### Google Analytics & Tag Manager

Built-in integration with Google Analytics, Google Tag Manager, and Google Site Verification. Simply enable the options you need and add your tracking IDs through the global configuration interface.

**Supported integrations:**
- Google Analytics (GA4) tracking
- Google Tag Manager for advanced marketing campaigns
- Google Site Verification for Search Console

See [Essential Configuration](#essential-configuration) below for setup instructions.

### Social Media Meta Tags

Automatic generation of Open Graph and Twitter Card meta tags for rich social media sharing:

- **Open Graph**: Title, description, image, and URL for Facebook, LinkedIn, and other platforms
- **Twitter Cards**: Optimized meta tags for Twitter sharing with card previews
- **Automatic fallbacks**: Uses your SEO title, description, and featured images when specific social fields aren't provided

### Automated Robots.txt

The module automatically provides a `/robots.txt` route with strategic control over both traditional search engines and AI crawlers. Configure this through the global settings with five options:

**Control Modes:**

1. **Allow All (Search + AI)** - Default open access for all crawlers
2. **Allow Search, Block AI Training** ⭐ **Recommended** - Maintains search rankings while protecting intellectual property
3. **Selective AI Crawlers** - Granular control over individual AI crawlers
4. **Block All** - Prevents all indexing
5. **Custom** - Write your own robots.txt content

**Understanding AI Crawler Control:**

Modern AI systems use different crawlers for different purposes:

- **Training Crawlers** (GPTBot, ClaudeBot, Google-Extended, CCBot): Build AI training datasets
- **Browsing Crawlers** (ChatGPT-User, Claude-User): Serve real-time user queries with attribution
- **Traditional Search** (Googlebot, Bingbot): Power search engines

**Strategic Recommendation:** Use "Allow Search, Block AI Training" mode. This approach:
- ✅ Maintains traditional search rankings (confirmed by Google)
- ✅ Allows AI Overview and AI-powered search features
- ✅ Permits real-time AI browsing for user queries
- ❌ Blocks contribution to AI training datasets
- ❌ Protects proprietary content and intellectual property

**Important:** Blocking Google-Extended does NOT affect traditional Google Search rankings. Google has confirmed that AI training crawler access is separate from search indexing.

**Selective Mode:** For fine-grained control, use Selective mode to choose specific AI crawlers:
- GPTBot (OpenAI ChatGPT training)
- ChatGPT-User (OpenAI real-time browsing)
- Google-Extended (Google AI training)
- ClaudeBot (Anthropic AI training)
- Claude-User (Anthropic real-time browsing)
- PerplexityBot (Perplexity AI)
- CCBot (Common Crawl datasets)
- Applebot-Extended (Apple Intelligence)
- FacebookBot (Meta AI)
- anthropic-ai (Anthropic general)

**Note:** A physical `robots.txt` file in your `public/` directory will override these settings.

### AI Crawler Control (llms.txt)

The module automatically provides an `/llms.txt` route to communicate your AI usage policies. This is **complementary** to `robots.txt`:

- **robots.txt**: Enforceable crawler access control (blocks/allows bots)
- **llms.txt**: Informational policy declaration (informs AI systems about usage terms)

**Configuration options:**

1. **Allow AI Crawling (Default)**: Generates a comprehensive `llms.txt` file that permits responsible AI crawling with site structure information

2. **Disallow AI Training**: States content should NOT be used for AI training datasets but permits real-time search and retrieval with attribution

3. **Custom Content**: Write your own `llms.txt` policies from scratch

4. **Disabled**: Returns 404 for `/llms.txt` requests

**Best Practice:** Combine both tools strategically:
- Use **robots.txt** (Allow Search, Block AI Training mode) to technically enforce access
- Use **llms.txt** (Disallow AI Training mode) to clearly communicate your policies
- This dual approach provides both technical enforcement and clear policy communication

**What's included in the generated file:**
- Site name and description
- AI training policy (based on your selection)
- Organization information
- Links to main pages with descriptions
- Available content types
- Technical details about structured data
- Sitemap reference (if @apostrophecms/sitemap is installed)

### Sitemap Integration

Works seamlessly with `@apostrophecms/sitemap` to generate XML sitemaps that help search engines discover and index your content. The sitemap is automatically referenced in the `/llms.txt` file for AI crawlers.

## Structured Data & Schema Types

This module generates rich structured data (JSON-LD) that helps search engines understand your content. All structured data is output in a single `<script type="application/ld+json">` tag with an `@graph` array for optimal performance.

### How It Works

The module automatically generates appropriate Schema.org markup based on the schema type you select in the SEO tab of your editor:

- **Sitewide schemas**: WebSite and Organization data from your Global settings appear on every page
- **Page-level schemas**: WebPage, CollectionPage, or your chosen primary entity type
- **Primary entities**: Article, Product, Event, Person, LocalBusiness, and more for detail pages
- **Item listings**: Automatic ItemList generation for index/listing pages

### Choosing the Right Schema

Select the schema type in the SEO tab of any page or piece editor. Only use one primary schema per page for best results.

#### **Web Page**
Use for standard pages like About, Contact, or general information pages.

**Best for:** About pages, contact pages, general information pages, landing pages

---

#### **Collection Page**
Use for index and listing pages that display multiple items.

**Required fields:**
- Page title and description

**Features:**
- Automatically generates ItemList of visible items
- Toggle "Include ItemList in JSON-LD" to control ItemList output

**Best for:** Blog indexes, product catalogs, category pages, archives, search results

---

#### **Article**
For blog posts, news articles, and editorial content.

**Required fields:**
- Title (from `seoTitle` or document title)
- Publication date

**Recommended fields:**
- Author
- Featured image
- Meta description

**Best for:** Blog posts, news articles, editorial content, press releases

---

#### **Product**
For e-commerce product pages with pricing and availability.

**Required fields:**
- Product name
- Price and currency

**Optional fields:**
- Brand, SKU, GTIN (barcode)
- Product condition (new, used, refurbished)
- Availability status
- Aggregate rating and review count
- Product description

**Best for:** E-commerce product pages, marketplace listings, service offerings with pricing

---

#### **Offer**
For single-price items, services, or standalone offers.

**Required fields:**
- Offer name
- Price and currency

**Optional fields:**
- Availability status (In Stock, Out of Stock, Pre-order, Discontinued, etc.)
- Valid date ranges (validFrom, priceValidUntil)
- Item condition (New, Used, Refurbished, Damaged)
- Seller information (defaults to your Organization)
- Offer URL
- Shipping details (rate, destination, delivery time)

**Best for:** 
- Individual service packages with fixed pricing
- Event tickets
- Subscription plans
- One-time purchase offers
- Limited-time deals

**SEO Impact:** Enables rich snippets showing pricing, availability, and seller info directly in search results. Improves visibility for Google Merchant Center and Shopping listings.

**Example use case:** A web design agency offering a "Starter Website Package" for $2,999 with a 30-day delivery time.

---

#### **Aggregate Offer**
For items with multiple price points, variants, or marketplace scenarios.

**Required fields:**
- Offer name
- Low price and high price
- Currency

**Optional fields:**
- Offer count (number of variants)
- Individual offers array (each with name, price, availability, URL)
- Common availability status
- Seller information

**Best for:**
- Products with size/color/material variants
- Marketplace listings from multiple sellers
- Tiered service packages (Basic, Pro, Enterprise)
- Hotel rooms with different rates
- Course offerings at different price levels
- Bulk pricing structures

**SEO Impact:** Shows price ranges in search results, helping users understand pricing options before clicking. Essential for marketplaces and products with variants.

**Example use case:** A SaaS product with Basic ($29/mo), Professional ($99/mo), and Enterprise ($299/mo) tiers.

---

#### **Event**
For concerts, webinars, conferences, and any scheduled events.

**Required fields:**
- Event name
- Start date

**Optional fields:**
- End date
- Location (name and address)
- Event description

**Best for:** Conferences, webinars, concerts, workshops, meetups, online events

---

#### **Person**
For author profiles, team member bios, and individual profiles.

**Required fields:**
- Person name

**Optional fields:**
- Job title
- Organization/employer
- Bio/description

**Best for:** Author pages, team member profiles, speaker bios, personal websites

---

#### **Local Business**
For brick-and-mortar businesses with physical locations.

**Required fields:**
- Business name

**Optional fields:**
- Address (street, city, state, zip, country)
- Phone number
- Opening hours
- Business description

**Best for:** Restaurants, retail stores, service providers, medical offices, salons

---

#### **Job Posting**
For job listings and career pages. Essential for appearing in Google for Jobs.

**Required fields:**
- Job title
- Expiration date
- Hiring organization name (falls back to global organization)
- Location (physical address or remote designation)

**Optional fields:**
- Employment type (full-time, part-time, contract, etc.)
- Salary information (range or fixed amount)
- Experience requirements (months of experience)
- Education requirements
- Skills, qualifications, responsibilities
- Benefits
- Industry and occupational category
- Work hours
- Direct apply toggle

**Best for:** Job boards, careers pages, recruitment sites, staffing agencies

**SEO impact:** Jobs appear in Google for Jobs search results with rich snippets showing salary, location, and employment type.

---

#### **FAQ Page**
For frequently asked questions pages.

**Required fields:**
- At least one question-answer pair

**How to use:**
1. Select "FAQ Page" as schema type
2. Add questions and answers in the FAQ Details section
3. Each question-answer pair becomes a structured data entry

**Best for:** Help centers, support pages, product FAQs, general Q&A pages

#### **QA Page**
For question and answer pages where a single question has one or more answers (like Stack Overflow, forums, or community Q&A).

**Required fields:**
- Question title

**Optional fields:**
- Question details/body text
- Question author name
- Question date posted
- Question upvote count
- **Accepted Answer**: The answer marked as correct/most helpful
  - Answer text (required if providing accepted answer)
  - Answer author
  - Answer date
  - Answer upvote count
- **Other Answers**: Additional suggested answers
  - Each with text, author, date, and upvote count

**Best for:** Community forums, support forums, Q&A platforms, discussion boards, knowledge bases with user-contributed answers

**Difference from FAQ:** 
- **FAQPage** is for curated, official FAQs written by your organization
- **QAPage** is for community-driven Q&A with voting, multiple answers, and user attribution

**SEO Impact:** Can appear in Google's Q&A rich results with voting counts, accepted answers highlighted, and author information. Helps establish expertise and community engagement.

**Example use cases:**
- Technical support forum: "How do I reset my password?" with 5 community answers
- Programming Q&A: "What's the difference between var and let in JavaScript?" with accepted answer
- Product support: Customer questions with manufacturer responses

**Best practices:**
- Always provide the accepted answer when one exists
- Include upvote counts to signal answer quality
- Add author names for credibility
- Use for pages with single questions only (not question listings)

**Note:** For question listing/index pages, use CollectionPage schema instead.

#### **Video Object**
For video content pages, including educational videos and tutorials.

**Required fields:**
- Video name

**Optional fields:**
- Video description
- Upload date
- Duration (ISO 8601 format: "PT1M30S" for 1 minute 30 seconds)
- Thumbnail image (uses `_featuredImage` relationship if not specified)
- Content URL (direct video file)
- Embed URL (YouTube/Vimeo embed)

**Educational video fields:**
When "Is Educational Video" is checked, additional fields become available:
- **Educational Use**: How the video is used (assignment, professional development, continuing education, vocational training)
- **Learning Resource Type**: Type of educational content (lecture, tutorial, demonstration, presentation, exercise)

**Best for:** Video landing pages, video galleries, tutorial videos, webinar recordings, online courses, training materials

**SEO Impact:** Educational videos can appear in Google's learning-specific search features and video carousels with enhanced metadata.

**Example use cases:**
- Software tutorial: "How to Use Photoshop Layers" (learningResourceType: tutorial)
- University lecture: "Introduction to Calculus" (educationalUse: assignment)
- Professional training: "Project Management Fundamentals" (educationalUse: professional development)

#### **How To**
For step-by-step guides and tutorials.

**Required fields:**
- Guide name
- At least one step with name and instructions

**Optional fields:**
- Total time (ISO 8601 format: "PT30M" for 30 minutes)
- Supply list (materials needed)
- Tool list (tools required)
- Step images
- Guide description

**Best for:** DIY tutorials, cooking instructions, repair guides, software walkthroughs

**Example:** "How to Change a Tire," "How to Bake Sourdough Bread," "How to Install WordPress"

---

#### **Review**
For product reviews, service reviews, and editorial reviews.

**Required fields:**
- Item being reviewed (name)

**Optional fields:**
- Item type (Product, Book, Movie, Restaurant, Service)
- Rating (1-5 scale)
- Review body/text
- Author name
- Review date

**Best for:** Product review pages, service reviews, book reviews, restaurant reviews

---

#### **Recipe**
For cooking recipes and food content.

**Required fields:**
- Recipe name
- Ingredients list
- Cooking instructions

**Optional fields:**
- Author
- Prep time, cook time, total time (ISO 8601 format)
- Yield (servings)
- Recipe category (e.g., "Dessert," "Main Course")
- Cuisine type (e.g., "Italian," "Mexican")
- Nutrition information (calories, carbs, protein, fat)
- Aggregate rating and review count
- Recipe image

**Best for:** Food blogs, cooking websites, restaurant recipe pages

**Time format examples:**
- "PT30M" = 30 minutes
- "PT1H" = 1 hour
- "PT1H30M" = 1 hour 30 minutes

---

#### **Course**
For online courses and training programs.

**Required fields:**
- Course name
- Course description

**Optional fields:**
- Course provider (defaults to site organization)
- Course code (e.g., "CS101")
- Educational level (Beginner, Intermediate, Advanced)
- Price and currency
- Availability
- Aggregate rating and review count

**Best for:** Online learning platforms, training programs, educational institutions, certification courses

---

### E-commerce Best Practices

**For product catalogs:**
- Use **Product** schema on individual product detail pages
- Use **Offer** or **AggregateOffer** as the offer type within Product schema when appropriate
- Use **CollectionPage** with ItemList on category/listing pages

**For service businesses:**
- Use **Offer** schema for individual service packages
- Use **AggregateOffer** for tiered service offerings
- Combine with **LocalBusiness** for location-based services

**For marketplaces:**
- Use **AggregateOffer** to show price ranges across sellers
- Include individual offers array for each seller/variant
- Ensure seller information is populated for trust signals

**Pricing and Offers Tips:**
- Always include availability status for accurate search results
- Use priceValidUntil for time-limited offers
- Include shipping information for physical products
- Seller information automatically falls back to your global Organization settings

---

### Quick Schema Selection Guide

| Content Type | Recommended Schema |
|--------------|-------------------|
| Standard pages | WebPage |
| Blog index, Category pages | CollectionPage |
| Blog posts, Articles | Article |
| Product pages | Product |
| Single offers, service packages | Offer |
| Products with variants, tiered pricing | AggregateOffer |
| Event listings | Event |
| Author bios, Team pages | Person |
| Business locations | LocalBusiness |
| Job postings | JobPosting |
| Help/Support pages | FAQPage |
| Video pages | VideoObject |
| Tutorials, Guides | HowTo |
| Review articles | Review |
| Recipes | Recipe |
| Online courses | Course |

## Implementation Guidelines for Developers

When using this SEO module, there are specific guidelines your content types and templates must follow for certain schema types to work correctly.

### Featured Images

Several schema types rely on a `_featuredImage` relationship field being present on your document. If you want rich results for these schema types, **your page or piece type must include this field**:

**Schema types that use featured images:**
- **Product** - Product image
- **Recipe** - Recipe photo
- **How To** - Guide illustration
- **Video Object** - Video thumbnail (falls back to featured image)

**Example implementation:**

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article'
  },
  fields: {
    add: {
      _featuredImage: {
        label: 'Featured Image',
        type: 'relationship',
        withType: '@apostrophecms/image',
        max: 1,
        required: true  // Make required if using Product or Recipe schemas
      }
    },
    group: {
      basics: {
        fields: ['title', '_featuredImage', 'excerpt']
      }
    }
  }
};
```

**Note:** The field name **must be** `_featuredImage` (with the leading underscore) for the SEO module to find it automatically.

### Paywalled Content

If you mark content as paywalled, your templates must use consistent CSS classes or IDs to wrap premium content. The module needs to know which HTML element contains the paywalled content.

**How it works:**

1. Add a wrapper element around your paywalled content in your template
2. Configure the CSS selector in the SEO settings to match your wrapper

**Example template implementation:**

```nunjucks
{# views/show.html #}
<article>
  <h1>{{ data.piece.title }}</h1>
  
  {# Free preview content #}
  <div class="article-preview">
    {{ data.piece.excerpt }}
  </div>
  
  {# Paywalled content - note the class name #}
  <div class="paywall">
    {% if data.user %}
      {# Show full content to subscribers #}
      {{ data.piece.body }}
    {% else %}
      {# Show paywall message to non-subscribers #}
      <div class="paywall-notice">
        <p>Subscribe to read more...</p>
      </div>
    {% endif %}
  </div>
</article>
```

**Common CSS selector patterns:**

```css
/* By class (most common) */
.paywall
.premium-content
.members-only

/* By ID */
#paywalled-content

/* By data attribute */
[data-paywall="true"]

/* Multiple classes */
.article-body.premium
```

**In the SEO settings**, set the "Paywall CSS Selector" field to match your implementation (e.g., `.paywall`).

**Why this matters:** Google requires you to explicitly mark which parts of your page require payment. The CSS selector tells search engines exactly where the paywall boundary is, helping them show appropriate content previews without penalties.

### Author Information

For **Article** and **Recipe** schemas, the module looks for an `_author` relationship field to populate author information in structured data.

**Example implementation:**

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article'
  },
  fields: {
    add: {
      _author: {
        label: 'Author',
        type: 'relationship',
        withType: '@apostrophecms/user',
        max: 1
      }
    },
    group: {
      basics: {
        fields: ['title', '_author', 'publishedAt']
      }
    }
  }
};
```

The module will use `_author[0].title` or `_author[0].username` for the author name in structured data.

### URL Requirements

Most schema types require that documents have a `_url` property. This is automatically provided by ApostropheCMS for pages and pieces with "show pages" enabled.

**For pieces to have URLs**, ensure your piece type is configured properly:

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article',
    // This is required for pieces to have individual URLs
    showPages: true
  }
};
```

And create a corresponding piece-page-type:

```javascript
// modules/article-page/index.js
module.exports = {
  extend: '@apostrophecms/piece-page-type'
};
```

### Date Fields

Several schema types use date information. The module looks for these fields in priority order:

1. **Publication dates:** `publishedAt`, then `createdAt`
2. **Modification dates:** `updatedAt`, then `createdAt`

**Best practice:** Add a `publishedAt` field to content types that use Article schema:

```javascript
fields: {
  add: {
    publishedAt: {
      label: 'Publication Date',
      type: 'date',
      def: null
    }
  }
}
```

### Listing Pages (Item List)

For **Collection Page** schema with Item List generation, the module automatically detects listing items from these request data properties:

- `req.data.pieces`
- `req.data.items`
- `req.data._pieces`
- `req.data.docs`

Each item must have:
- A URL: `_url` or `url` property
- A title: `seoTitle` or `title` property

**Standard piece-page-type index pages work automatically** without additional configuration.

### Summary: Required Fields by Schema Type

| Schema Type | Required Fields | Optional Fields | Developer Notes |
|-------------|----------------|-----------------|-----------------|
| **Article** | None (uses title) | `_author`, `publishedAt`, `_featuredImage` | Standard blog post setup |
| **Product** | Product name (in schema settings) | `_featuredImage` (highly recommended) | Image critical for rich results |
| **Recipe** | Recipe name, ingredients, instructions | `_featuredImage` (highly recommended), `_author` | Image essential for recipe cards |
| **Event** | Event name, start date | Location details | None |
| **Person** | Person name | Job title, organization | None |
| **VideoObject** | Video name | `_featuredImage` (thumbnail), educational fields | See Learning Video features |
| **HowTo** | Guide name, steps | `_featuredImage` (recommended), supplies, tools | Step images improve visibility |
| **Review** | Item reviewed | `_author`, rating | None |
| **Course** | Course name | Provider, pricing | None |
| **JobPosting** | Job title, dates, location | Salary, requirements | Organization logo from global |
| **QAPage** | Question text | Answers, authors, votes | For single Q&A pages only |
| **FAQPage** | Q&A pairs | None | For curated FAQs |
| **WebPage/CollectionPage** | None | None | Standard pages |
| **LocalBusiness** | Business name | Address, hours, phone | None |
| **Offer** | Name, price | Availability, shipping | Falls back to global org |
| **AggregateOffer** | Name, price range | Individual offers array | For products with variants |

**Paywalled content (any type):** Must implement CSS wrapper with matching selector (see [Paywalled Content](#paywalled-content) section)

**Learning Videos:** VideoObject schema includes optional educational metadata - enable "Is Educational Video" checkbox to access additional fields for tutorials and courses
### Best Practices

- **One primary schema per page**: Use a single primary entity type (Article, Product, etc.) per detail page
- **Use CollectionPage for listings**: For index pages, use CollectionPage with ItemList enabled rather than individual entity schemas
- **Fill all relevant fields**: The more complete your structured data, the better search engines can understand your content
- **Test your markup**: Use Google's Rich Results Test to validate your structured data
- **Pricing consistency**: Ensure prices in your structured data match what's displayed on the page

### ItemList Generation

For CollectionPage schemas, the module automatically detects listing items from:
- `req.data.pieces`
- `req.data.items`
- `req.data._pieces`
- `req.data.docs`

Each item should provide `_url` (or `url`) and `title` (or `seoTitle`). Toggle the "Include ItemList in JSON-LD" field to control whether ItemList appears in your structured data.

### Debugging Structured Data

Set the environment variable `APOS_SEO_DEBUG=true` to print JSON-LD generation diagnostics to your server logs during development.

**Important:** Not all schema types show rich results in Google Search Console's URL Inspection Tool. The following schemas are valid and will be indexed, but may not appear in the rich results preview:

- **HowTo** - Valid schema, but not shown in URL Inspection Tool
- **QAPage** - Valid schema, but not shown in URL Inspection Tool
- **Learning Video** - Extension of VideoObject, shown as standard Video

Use the [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/) for comprehensive testing of all schema types.

## Essential Configuration

### Setting the Base URL

**This step is required** for proper canonical link generation and SEO performance. If using [ApostropheCMS hosting](https://apostrophecms.com/hosting), this is set automatically.

**Via environment variable (recommended):**
```bash
export APOS_BASE_URL=https://yoursite.com
```

**Via configuration file:**
```javascript
// data/local.js
export default {
  baseUrl: 'https://yoursite.com',
  modules: {
    // other module configuration
  }
};
```

**For multisite projects using ApostropheCMS Assembly:**
The base URL is automatically configured through the `baseUrlDomains` option. [Learn more about Assembly multisite hosting](https://apostrophecms.com/assembly).

## AI & Search Strategy

### Recommended Configuration for Most Sites

For optimal search visibility while protecting intellectual property:

**robots.txt Settings:**
- Mode: "Allow Search, Block AI Training"
- This maintains Google Search rankings while preventing your content from being used in AI training datasets

**llms.txt Settings:**
- Mode: "Disallow AI Training"
- This clearly communicates your AI usage policies to compliant systems

**Why This Works:**
- Traditional search engines (Google, Bing) continue normal indexing
- AI Overview and AI-powered search features remain functional
- Real-time AI browsing (ChatGPT browsing, Claude Projects) still works
- Your content is protected from AI training datasets
- No negative impact on search rankings (confirmed by Google)

### For Maximum AI Visibility

If you want your content widely used by AI systems:

**robots.txt Settings:**
- Mode: "Allow All (Search + AI)"

**llms.txt Settings:**
- Mode: "Allow AI Crawling"

### For Maximum Privacy/Protection

If you want to restrict all AI access:

**robots.txt Settings:**
- Mode: "Selective AI Crawlers"
- Check only: ChatGPT-User, Claude-User (if you want to allow real-time queries)
- Or use "Block All" for complete restriction

**llms.txt Settings:**
- Mode: "Disabled"

### Understanding the Difference

| Feature | robots.txt | llms.txt |
|---------|-----------|----------|
| **Purpose** | Enforceable crawler control | Policy communication |
| **Technical** | Bots must respect (enforceable) | Informational only |
| **Affects** | Which bots can crawl | How content may be used |
| **Best for** | Access control | Terms of use |
| **Required?** | Yes (standard) | Optional (emerging) |

### Google Analytics Integration

Enable Google Analytics tracking:

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'my-project',
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

This adds a field in the global configuration for your Google Analytics Measurement ID (e.g., `G-XXXXXXXXXX`).

### Google Tag Manager Integration

For advanced tracking and marketing campaigns:

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'my-project',
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

Add your GTM container ID (e.g., `GTM-XXXXXXX`) in the global configuration.

### Google Site Verification

Verify site ownership for Google Search Console:

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'my-project',
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

Enter your verification meta tag content from Google Search Console in the global settings.

### Sitemap Installation

Install the companion sitemap module for XML sitemap generation:

```bash
npm install @apostrophecms/sitemap
```

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'my-project',
  modules: {
    '@apostrophecms/seo': {},
    '@apostrophecms/sitemap': {}
  }
});
```

## Advanced Configuration

### Disabling SEO Fields

Disable SEO fields for specific page or piece types:

```javascript
// modules/my-piece-type/index.js
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    seoFields: false
  }
};
```

The following modules disable SEO fields by default:
- `@apostrophecms/global`
- `@apostrophecms/user`
- `@apostrophecms/image`
- `@apostrophecms/image-tag`
- `@apostrophecms/file`
- `@apostrophecms/file-tag`

### Canonical Link Configuration

Configure canonical URL options for pieces by specifying which document types editors can reference:

```javascript
// modules/article/index.js
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article',
    seoCanonicalTypes: [ '@apostrophecms/page', 'topic' ]
  }
};
```

This allows editors to designate another page or piece as the canonical source for search engines, helping prevent duplicate content penalties.

> **What are canonical links?** [As described on Moz.com](https://moz.com/learn/seo/canonicalization): "A canonical tag tells search engines which version of a URL you want to appear in search results." This prevents problems when identical content appears on multiple URLs.

### Pagination Support

For listing pages with pagination, the module automatically adds `rel="prev"` and `rel="next"` link tags when pagination data is provided:

```javascript
// In your index page or piece-page-type
module.exports = {
  async index(req) {
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 10;

    // Your query logic here...

    req.data.pagination = {
      currentPage,
      totalPages: Math.ceil(totalCount / perPage),
      baseUrl: req.data.page._url
    };

    return {};
  }
};
```

This helps search engines understand pagination relationships and prevents duplicate content issues.

### Custom 404 Tracking

Track 404 errors in Google Analytics by adding this to your `notFound.html` template:

```nunjucks
{% block extraBody %}
  {{ super() }}
  {% include "@apostrophecms/seo:404.html" %}
{% endblock %}
```

This automatically sends 404 events when a tracking ID is configured, helping you identify broken links.

## Performance Optimization

### Critical Font Preloading

Configure critical fonts in Global settings to preload them, improving page load performance and preventing layout shift. The module generates `<link rel="preload">` tags for specified font URLs.

### Mobile Optimization

The module automatically includes:
- Viewport meta tag for responsive design
- Optional theme-color meta tag for PWA compatibility

## Field Reference

|Name |Description  | Module Affected | Module Option |
--- | --- | --- | ---
|`seoTitle`|Title attribute for search results|`@apostrophecms/doc-type`|_Enabled by default_|
|`seoThemeColor`|Theme color for mobile browsers (PWA support)|`@apostrophecms/global`|_Enabled by default_|
|`seoDescription`|Description for search results|`@apostrophecms/doc-type`|_Enabled by default_|
|`seoRobots`|Robots indexing behavior|`@apostrophecms/doc-type`|_Enabled by default_|
|`_seoCanonical`|[Canonical URL](https://moz.com/learn/seo/canonicalization) reference|`@apostrophecms/page-type`|_Enabled by default_|
|`seoGoogleTagManager`|Google Tag Manager Container ID|`@apostrophecms/global`|`seoGoogleTagManager: true`|
|`seoGoogleTrackingId`|Google Analytics Measurement ID|`@apostrophecms/global`|`seoGoogleAnalytics: true`|
|`seoGoogleVerificationId`|Google Site Verification ID|`@apostrophecms/global`|`seoGoogleVerification: true`|
|`seoJsonLdType`|Schema.org type for this document|`@apostrophecms/doc-type`|_Enabled by default_|
|`seoJsonLdProduct`|Product schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'Product'`|
|`seoJsonLdOffer`|Offer schema fields (price, availability, seller, shipping)|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'Offer'`|
|`seoJsonLdAggregateOffer`|AggregateOffer schema fields (price range, variants)|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'AggregateOffer'`|
|`seoJsonLdEvent`|Event schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'Event'`|
|`seoJsonLdPerson`|Person schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'Person'`|
|`seoJsonLdBusiness`|LocalBusiness schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'LocalBusiness'`|
|`seoJsonLdJobPosting`|JobPosting schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'JobPosting'`|
|`seoJsonLdHowTo`|How-To guide schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'HowTo'`|
|`seoJsonLdReview`|Review schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'Review'`|
|`seoJsonLdRecipe`|Recipe schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'Recipe'`|
|`seoJsonLdCourse`|Course schema fields|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'Course'`|
|`seoIncludeItemList`|Toggle ItemList in structured data|`@apostrophecms/doc-type`|Shown when `seoJsonLdType: 'CollectionPage'`|
|`seoSiteName`|Site name for WebSite schema|`@apostrophecms/global`|_Enabled by default_|
|`seoSiteDescription`|Site description for WebSite schema|`@apostrophecms/global`|_Enabled by default_|
|`seoSiteCanonicalUrl`|Base URL for structured data|`@apostrophecms/global`|_Enabled by default_|
|`seoJsonLdOrganization`|Organization schema settings|`@apostrophecms/global`|_Enabled by default_|
|`seoCriticalFonts`|Critical font URLs for preloading|`@apostrophecms/global`|_Enabled by default_|

## 🚀 Ready for AI-Powered SEO?

**Want to supercharge your SEO workflow?** Create an account on Apostrophe Workspaces and upgrade to [**ApostropheCMS Pro**](https://app.apostrophecms.com/login). Get access to the [**SEO Assistant**](https://apostrophecms.com/extensions/seo-assistant) with AI-powered content optimization:

### ✨ SEO Assistant Pro Features
- **🤖 AI-Generated Meta Titles**: Compelling, keyword-optimized titles generated automatically
- **🔍 Smart Meta Descriptions**: AI-crafted descriptions that drive clicks
- **🎯 Content Analysis**: Get suggestions based on your actual page content
- **⚡ One-Click Optimization**: Generate, review, and apply SEO improvements instantly
- **🔄 Multiple Suggestions**: Try different approaches with regeneration options
- **✏️ Custom Prompts**: Fine-tune AI behavior for your brand voice

The SEO Assistant analyzes your page content and generates optimized meta titles and descriptions using advanced AI, making professional SEO accessible to content creators of all skill levels.

**[Contact us](https://apostrophecms.com/contact-us)** to learn more about ApostropheCMS Pro.

## 🏢 Managing Multiple Sites?

**Running multiple websites with shared content and branding?** Consider [**ApostropheCMS Assembly**](https://apostrophecms.com/assembly) for enterprise multisite management:

### ✨ Assembly Multisite Features
- **🗂️ Centralized Management**: Control multiple sites from a single dashboard
- **🚀 Shared Codebase**: Deploy updates across all sites simultaneously  
- **🌐 Multi-Domain Support**: Each site gets its own domain with automatic SSL
- **⚙️ Automatic SEO Configuration**: Base URLs and canonical links configured automatically
- **🎨 Per-Site Customization**: Individual themes, content, and settings per site
- **📊 Unified Analytics**: Track performance across your entire site network

Perfect for agencies, franchises, or organizations managing multiple branded websites.

**[Learn more about Assembly](https://apostrophecms.com/extensions/multisite-apostrophe-assembly)** or **[contact our team](https://apostrophecms.com/contact-us)**.

## Roadmap

| Feature | Status |
|---------|--------|
| SEO Meta fields for pages and pieces | ✅ Implemented |
| Google Analytics & Tag Manager integration | ✅ Implemented |
| Automated robots.txt generation | ✅ Implemented |
| Structured data (JSON-LD) for all major schema types | ✅ Implemented |
| Offer and AggregateOffer schemas | ✅ Implemented |
| SEO Assistant (AI-powered) | 🚀 Available in Pro |
| SEO Page Scanner | 🚧 Under development |

---

<div>
  <p>Made with ❤️ by the <a href="https://apostrophecms.com">ApostropheCMS</a> team. <strong>Found this useful? <a href="https://github.com/apostrophecms/seo">Give us a star on GitHub!</a> ⭐</strong>
  </p>
</div>