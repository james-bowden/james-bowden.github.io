# Site TODO & Session Context

## What we're doing and why
This is **james-bowden.github.io**, a personal/academic site for James Bowden (Berkeley CS PhD).
The site is deploying from the **`jtd` branch** on GitHub Pages.

### Migration status
We migrated away from the **Millennial** Jekyll theme (which was a forked repo) to
**Just the Docs** as a remote theme (`remote_theme: just-the-docs/just-the-docs`).
The migration is done and the site is live. The guiding principle was:
- Preserve all content and URLs
- Make only the changes required to wire up the new theme
- Then clean up and customize incrementally

### Key architectural decisions made
- `github-pages` gem in Gemfile (classic GitHub Pages build, no Actions workflow)
- `jekyll-remote-theme` plugin; theme pulled directly from `just-the-docs/just-the-docs` default branch
- All existing layouts (`page`, `post`, `misc`, `obs`) kept as thin wrappers over JTD's `default`
- Navigation: sidebar driven by `nav_order` front matter; large content sections
  (`_posts`, `pages/poetry`, `pages/anthology`, vault sub-folders) excluded from sidebar via
  `defaults` in `_config.yml` rather than editing every file
- Customizations live in `_sass/custom/custom.scss` and `_includes/head_custom.html`
- Profile photo displayed via `logo:` in `_config.yml`, styled as a circle via CSS

### Repo layout to know
```
_config.yml          — theme, plugins, nav defaults
_layouts/            — thin wrappers: page.html, post.html, misc.html, obs.html
_includes/
  head_custom.html   — MathJax v3 (for vault/atomic pages and posts)
_sass/custom/
  custom.scss        — all custom CSS overrides (profile photo, future styles)
pages/
  about/             nav_order: 1
  research/          nav_order: 2
  resume/            nav_order: 3
  teaching/          nav_order: 4
  vault/             nav_order: 5  (sub-pages excluded from sidebar, linked internally)
  poetry/            185 poems — nav_excluded, accessed via poetry_pub index
  anthology/         18 files  — nav_excluded
  blog/              nav_excluded
  bytes/             nav_excluded (to be moved into vault)
  dailies/           nav_excluded
_posts/              63 posts  — nav_excluded, layout: post set via defaults
assets/
  img/               photos and logos
  resumes/           versioned CV/resume PDFs
  research/          paper PDFs and posters
  slides/            lecture slides
sync.py              Obsidian → Jekyll vault sync script (excluded from build)
TODO.md              this file (excluded from build)
```

### Things to keep in mind
- `site.github_url` (Millennial variable) has been replaced with `site.url` everywhere
- `site.github.url` (GitHub metadata dot notation) also replaced with `site.url`
- MathJax is loaded globally via `_includes/head_custom.html`
- Google Analytics ID `UA-177242959-1` was Universal Analytics (deprecated by Google).
  GA needs to be set up fresh with a GA4 ID before re-enabling.
- The `obs` layout (Obsidian vault pages) renders date created/modified, tags, and
  backlinks — these are currently unstyled (Millennial CSS gone); can be styled in custom.scss
- `pages/resume/index.md` embeds a PDF; the CV link at top still points to an older file
- CSS note: `margin: auto` does not center the logo because the `<a class="site-title">`
  wrapper is only as wide as its content; left-aligning with `margin-left: 1rem` is the fix

---

## In-progress / next steps

### Sidebar polish (in progress)
- [x] Verify migration is working on live site
- [ ] Sidebar photo position: currently `margin-left: 1rem; margin-top: 9rem` — tune if needed
      (each 1rem ≈ 16px; increase margin-left to nudge right, margin-top to move down)

### Content & structure (deferred)
- [ ] Relocate Bytes section into the Vault
- [ ] Update CV: swap in latest PDF, update "last updated" date in `pages/resume/index.md`
- [ ] Merge home page (`index.html`) and about page (`pages/about/index.md`) —
      make the root page the primary "about me" page

### Post-migration polish
- [ ] Style the `obs` layout metadata (tags, dates, backlinks) in `_sass/custom/custom.scss`
- [ ] Restore Google Analytics with a GA4 ID: `ga_tracking_id: G-XXXXXXXXXX` in `_config.yml`

---

## Customizations available (Just the Docs reference)

### Layout & structure
- [ ] Sidebar width: `$nav-width` in `_sass/custom/custom.scss`
- [ ] Content width: `$content-width` in `_sass/custom/custom.scss`
- [ ] Footer text: create `_includes/footer_custom.html`
- [ ] Aux links (top-right of sidebar): `aux_links:` in `_config.yml`
- [ ] Search: `search_enabled: true/false` in `_config.yml`
- [ ] Table of contents: suppress per-page with `has_toc: false` in front matter

### Colors & typography
- [ ] Dark mode: `color_scheme: dark` in `_config.yml`
- [ ] Fully custom color scheme: create `_sass/color_schemes/my-scheme.scss`,
      set `color_scheme: my-scheme` in `_config.yml`
- [ ] SCSS variable overrides in `_sass/custom/custom.scss`:
  - `$body-font-family`, `$mono-font-family`
  - `$body-line-height`
  - `$body-text-color`, `$body-background-color`
  - `$sidebar-color`, `$link-color`, `$base-button-color`

### Navigation
- [ ] Nested sidebar: `has_children: true` on parent, `parent: "Title"` on children
- [ ] Collapsible sections: `nav_fold: true` on a parent page
- [ ] Ordering: `nav_order: N` in front matter

### Per-page features
- [ ] Callout boxes: `.note`, `.warning`, `.highlight` CSS classes (built in)
- [ ] Code copy button: enabled by default
- [ ] Mermaid diagrams: `mermaid: { version: "9.1.3" }` in `_config.yml`
- [ ] MathJax: already active via `_includes/head_custom.html`
- [ ] "Edit on GitHub" link: `gh_edit_link: true` + repo details in `_config.yml`
- [ ] Last-modified date: `last_edit_timestamp: true` in `_config.yml`

### Content
- [ ] Poetry nav strategy: all 185 poems excluded from sidebar; consider a top-level
      Poetry index page linked from the sidebar
- [ ] Vault backlinks/tags: style `.tags`, `.tag`, `.post-date` in `custom.scss`
- [ ] Favicon: already at `favicon.ico` in repo root — Just the Docs picks it up automatically
