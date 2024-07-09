---
layout: page
title: Dailies
---

<p>
I'm beginning this to record some reflections, hopefully at the end of each day, about what I enjoyed, what went well, what I accomplished and also perhaps what I did not enjoy or wish to change. Reflections, in a word. And daily. Thanks Maggie for bumping me into trying this.
</p>

<hr>

{% for post in site.categories.dailies %}
  <h5><a href="{{ site.github.url }}{{ post.url }}"><span>{{ post.datetitle }}</span></a></h5>
{% endfor %}
