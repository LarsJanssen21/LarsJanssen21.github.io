---
layout: plain
title: Home
permalink: /
---

<link href="/css/override.css" rel="stylesheet" type="text/css">

<section class="about">
  <img src="/Images/profile_picture.jpeg" alt="" class="about-image">
  <div class="about-text">
    <p>
      I'm Lars, a Creative Media and Game Technologies student at
      Breda University of Applied Sciences (BUas), with a background starting off in
      graphics programming. I'm currently exploring a bunch of different things in and around game development.
      I write about what interests me in technology on here. Whether that's graphics and
      rendering work or anything else I do along the way. You can find those posts on the
      <a href="{{ '/archive.html' | relative_url }}">Articles</a> page.
    </p>
  </div>
</section>

## Projects

<div class="project-grid">
  {% for project in site.data.projects %}
  <div class="project-card">
    <h3 class="project-card-title"><b>{{ project.title }}</b></h3>
    {% if project.image %}
    <img src="{{ project.image | relative_url }}" alt="{{ project.title }}" class="project-card-image">
    {% endif %}
    <div class="project-card-body">
      {% if project.tags %}
      <div class="project-card-tags">
        {% for tag in project.tags %}<span class="project-tag">{{ tag }}</span>{% endfor %}
      </div>
      {% endif %}
      <p>{{ project.description }}</p>
      {% assign related_posts = site.posts | where: "project", project.slug %}
      {% if related_posts.size > 0 %}
      <div class="project-card-writeups">
        <p>Related articles:</p>
        {% for post in related_posts %}
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        {% endfor %}
      </div>
      {% endif %}
      <div class="project-card-links">
        {% if project.link %}<a href="{{ project.link }}">Demo</a>{% endif %}
        {% if project.repo %}
          <a href="{{ project.repo }}">Code</a>
        {% elsif project.code_note %}
          <span class="project-code-note">{{ project.code_note }}</span>
        {% endif %}
      </div>
      {% if project.date %}  
      <div class="project-card-date">{{project.date}}</div> 
      {% endif %}
    </div>
  </div>
  {% endfor %}
</div>
