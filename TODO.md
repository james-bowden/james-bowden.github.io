# Site TODOs

## Next: verify the migration
- [ ] Commit all changes and push to `jtd`, confirm GitHub Pages rebuilds correctly
  ```
  git add -A
  git commit -m "Migrate from Millennial to Just the Docs remote theme"
  git push origin jtd
  ```

## Content & Structure
- [ ] Relocate Bytes section into the Vault
- [ ] Update CV: update date and swap in the latest PDF file
- [ ] Merge home page and about page — make the home page the primary "about me" page

## Post-migration polish
- [ ] Style the `obs` layout metadata (tags, dates created/modified, backlinks) in `_sass/custom/custom.scss`
- [ ] Restore Google Analytics — add GA4 tracking ID to `_config.yml` as `ga_tracking_id: G-XXXXXXXXXX`
  (old UA-177242959-1 is Universal Analytics, deprecated by Google)

---

## Customizations available (Just the Docs)

### Layout & structure
- [ ] Sidebar width (`$nav-width`) and content width (`$content-width`) via `_sass/custom/custom.scss`
- [ ] Add a site logo image: `_config.yml` → `logo: /assets/img/your-logo.png`
- [ ] Customize the site title link and header
- [ ] Footer text: create `_includes/footer_custom.html`
- [ ] Enable/disable search: `search_enabled: true/false` in `_config.yml`
- [ ] Table of contents per page: add `has_toc: false` to front matter to suppress

### Colors & typography
- [ ] Switch to built-in dark mode: `_config.yml` → `color_scheme: dark`
- [ ] Define a fully custom color scheme: create `_sass/color_schemes/my-scheme.scss`,
      then set `color_scheme: my-scheme` in `_config.yml`
- [ ] Override SCSS variables in `_sass/custom/custom.scss`
  - `$body-font-family` — main text font
  - `$mono-font-family` — code font
  - `$body-line-height`
  - `$body-text-color`
  - `$body-background-color`
  - `$sidebar-color`
  - `$link-color`
  - `$base-button-color`

### Navigation
- [ ] Nested sidebar nav: add `has_children: true` to parent, `parent: "Page Title"` to children
- [ ] Nav section labels (visual groupings): add `nav_fold: true` for collapsible sections
- [ ] Exclude any page from nav with `nav_exclude: true` in front matter
- [ ] Control ordering with `nav_order: N` in front matter

### Per-page features
- [ ] Callout/note boxes (built-in CSS classes: `.note`, `.warning`, `.highlight`)
- [ ] Code blocks with copy button (enabled by default)
- [ ] Mermaid diagrams: `_config.yml` → `mermaid: { version: "9.1.3" }`
- [ ] MathJax: already restored via `_includes/head_custom.html`
- [ ] "Edit this page on GitHub" link: add `gh_edit_link: true` + repo info to `_config.yml`
- [ ] Last-modified date: `_config.yml` → `last_edit_timestamp: true`
- [ ] Aux links (top-right header links): `_config.yml` → `aux_links:`

### Content
- [ ] Poetry: decide nav strategy (currently all excluded; consider a Poetry index page)
- [ ] Back-links and tag display on vault/obs pages (style via `_sass/custom/custom.scss`)
- [ ] Add favicon (already present at `favicon.ico` — Just the Docs picks it up automatically)
