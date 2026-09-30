---
layout: page
title: Articles
permalink: /archive.html
---

<link href="/css/override.css" rel="stylesheet" type="text/css">

<div class="articles-list">
{% assign sorted_posts = site.posts | sort: 'date' | reverse %}
{% for post in sorted_posts %}
  <div class="article-entry">
    <span class="article-date">{{ post.date | date: "%B %Y" }}</span>
    <a class="article-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
    {% if post.tags %}
    <div class="article-tags">
      {% for tag in post.tags %}<span class="project-tag">{{ tag }}</span>{% endfor %}
    </div>
    {% endif %}
  </div>
{% endfor %}
</div>
