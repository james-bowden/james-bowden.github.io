---
layout: page
title: Bowden Blogs
---

{% for post in site.categories.blog %}
  <a href="{{ site.github.url }}{{ post.url }}">
    <div class="featured-posts">
      <h2><span>{{ post.title }}</span></h2>
    </div>
  </a>
{% endfor %}
