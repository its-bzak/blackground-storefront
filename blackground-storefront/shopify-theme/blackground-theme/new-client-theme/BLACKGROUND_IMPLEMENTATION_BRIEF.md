# BLACKGROUND Shopify Theme Implementation Brief

## Project

This is a custom Shopify Online Store 2.0 theme for a dark luxury ecommerce brand called BLACKGROUND.

The design source is three screenshots exported from Figma:
- Homepage / archetype hero
- Collection / product grid
- Product detail page

The goal is to implement the visual design as a Shopify-native custom theme using Liquid, JSON templates, sections, snippets, CSS, and minimal JavaScript.

Do not use React.
Do not install dependencies unless approved.
Do not remove core Shopify functionality.

## Brand Direction

BLACKGROUND is dark, sparse, editorial, brutalist, and luxury-coded.

Visual characteristics:
- Near-black / charcoal page background
- Black fixed header
- Yellow-gold UI text
- Large rounded gray product/media cards
- Monospace utility/product typography
- Editorial serif-style centered wordmark
- Lots of negative space
- Minimal ecommerce UI
- Product presentation should feel like an archive, catalogue, or archetype system

## Global Layout

All major pages should use:
- Fixed or sticky black header at the top
- Left header link: MENU
- Centered wordmark: BLACKGROUND
- Right header link: JOIN US
- Yellow-gold text
- Dark charcoal body background
- Spacious desktop layout
- Responsive mobile layout that preserves the design mood

Header requirements:
- Full-width top bar
- Height roughly 56–80px depending on viewport
- MENU aligned left
- JOIN US aligned right
- BLACKGROUND centered absolutely or via grid
- Header should not shift page layout unexpectedly
- Header links should be editable where practical

## Typography Direction

Use:
- A bold editorial serif or available fallback serif for the BLACKGROUND wordmark
- Monospace for utility links, product labels, prices, metadata, and buttons

Suggested CSS direction:
- Wordmark: serif, bold, high contrast, uppercase
- UI text: monospace, uppercase, letter-spaced
- Color: yellow-gold
- Body text on product pages: monospace unless otherwise needed

If custom fonts are added later, keep the CSS structured so they can be swapped in easily.

## Colors

Use CSS variables.

Suggested tokens:
- --bg: #111111 or similar charcoal
- --header-bg: #000000
- --gold: #d6bf00 or similar yellow-gold
- --media-gray: #9a9a98
- --media-gray-dark: #666666
- --border-dark: #1e1e1e
- --white-soft: #f2f2f2

Exact values can be adjusted after visual QA.

## Screen 1: Homepage / Archetype Hero

Reference: design-reference/home.png

Layout:
- Full viewport height
- Fixed black header
- Large stacked rounded-rectangle card visual centered horizontally
- Card stack appears as multiple gray rounded cards offset vertically
- Main front card is very large and extends toward bottom of viewport
- CTA pill button placed near bottom center of card stack
- CTA text: FIND YOUR ARCHETYPE
- Bottom-left link: ABOUT
- Bottom-right link: PRODUCTS

Implementation:
- Create a custom section, likely sections/hero-archetype.liquid
- Use CSS card placeholders if no images are configured
- Allow optional image settings for the hero cards if practical
- Make CTA label and link editable
- Make ABOUT and PRODUCTS links editable
- Update templates/index.json to use this section

Responsive:
- On mobile, reduce card width and height
- Header remains readable
- Bottom links should not overlap the card or CTA

## Screen 2: Collection / Product Grid

Reference: design-reference/collection.png

Layout:
- Fixed black header
- Section label near upper left: [PRODUCT TYPE]
- Product grid: 4 columns on desktop, 2 rows visible in screenshot
- Large rounded product image/card
- Product name centered underneath
- Price centered underneath product name
- Yellow-gold monospace text
- Very sparse layout with generous gaps

Implementation:
- Use Shopify collection data
- Create or adapt a collection section, likely sections/main-collection-blackground.liquid
- Create reusable product card snippet, likely snippets/product-card-blackground.liquid
- Product cards should use product.featured_image when available
- Use gray placeholder cards when no image is available
- Product title links to product.url
- Price uses Shopify money formatting
- Preserve pagination if the collection has many products

Responsive:
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column
- Maintain large rounded image feel

## Screen 3: Product Detail Page

Reference: design-reference/product.png

Layout:
- Fixed black header
- Large product media card on left
- Product metadata column on right
- Metadata:
  - [PRODUCT TYPE]
  - price
  - [STYLE]
  - [SIZE]
- Product description block
- ADD TO BAG control
- COMPLETE THE LOOK section on right/lower area
- Two smaller rounded product cards

Implementation:
- Create or adapt product section, likely sections/main-product-blackground.liquid
- Preserve real Shopify product form behavior
- Preserve variant selection
- Preserve sold-out/unavailable states
- Preserve product media rendering
- ADD TO BAG must submit to Shopify cart
- COMPLETE THE LOOK can use Shopify product recommendations first
- If recommendations are unavailable, allow manual product selection via section settings or blocks

Responsive:
- Desktop: media left, info right
- Mobile: stack media, info, complete-the-look
- Ensure add-to-cart remains usable

## Component Plan

Likely reusable pieces:
- sections/header-blackground.liquid
- sections/hero-archetype.liquid
- sections/main-collection-blackground.liquid
- sections/main-product-blackground.liquid
- sections/complete-the-look.liquid
- snippets/product-card-blackground.liquid
- snippets/responsive-image-blackground.liquid if needed
- assets/blackground.css
- assets/blackground.js only if needed

Prefer minimal new files where possible, but do not force all code into existing Dawn files if custom sections are cleaner.

## Shopify Functionality Requirements

Do not break:
- Product URLs
- Product image rendering
- Product prices
- Variant selection
- Add to cart
- Sold-out/unavailable states
- Cart drawer or cart page behavior
- Collection pagination
- Theme editor compatibility
- Shopify dynamic sources/metafields
- Accessibility basics

Use Shopify-native Liquid patterns where possible.

## Theme Editor Settings

Expose useful settings for:
- Header links
- Hero CTA text and link
- Hero bottom links
- Hero card images or placeholder mode
- Collection label override if useful
- Complete-the-look products or recommendations mode if useful

Do not overbuild settings during first pass.

## Build Rules for Claude Code

Before coding each phase:
1. Read this brief.
2. Inspect relevant existing Dawn theme files.
3. Explain which files will change.
4. Implement only the requested phase.
5. Preserve existing Shopify functionality.
6. Report exactly what changed.

Do not rewrite the entire theme in one pass.
Do not remove large parts of Dawn without explaining why.
Do not install packages.
Do not introduce React, Vue, or a frontend framework.
Do not create fake product data when real Shopify product data is available.
Do not hardcode products except as placeholders/fallbacks.
Do not make unnecessary JavaScript.

## Implementation Order

1. Add design-reference screenshots to the repo.
2. Create this implementation brief.
3. Implement global visual system and header.
4. Implement homepage hero.
5. Implement collection grid.
6. Implement product detail page.
7. Implement complete-the-look.
8. Visual QA against screenshots.
9. Shopify functionality QA.
10. Mobile QA.
11. Cleanup CSS and unused code.
