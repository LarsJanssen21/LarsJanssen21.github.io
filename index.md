---
layout: page
title: Home
permalink: /
---

<link href="/css/override.css" rel="stylesheet" type="text/css">

<section class="about">
  <img src="/Images/ExposureCorrectedScene.png" alt="" class="about-image">
  <div class="about-text">
    <!--
      Edit this paragraph with a couple of sentences about yourself:
      who you are, what you work on, and where you're headed.
    -->
    <p>
      I'm Lars, a Creative Media and Game Technologies student at
      Breda University of Applied Sciences (BUas), with a background in
      graphics programming. I write about the graphics and
      rendering work I do along the way. You can find those posts on the
      <a href="{{ '/archive.html' | relative_url }}">Articles</a> page.
    </p>
  </div>
</section>

## Projects

<div class="project-grid">
  {% for project in site.data.projects %}
  <div class="project-card">
    {% if project.image %}
    <img src="{{ project.image | relative_url }}" alt="{{ project.title }}" class="project-card-image">
    {% endif %}
    <div class="project-card-body">
      <h3>{{ project.title }}</h3>
      {% if project.tags %}
      <div class="project-card-tags">
        {% for tag in project.tags %}<span class="project-tag">{{ tag }}</span>{% endfor %}
      </div>
      {% endif %}
      <p>{{ project.description }}</p>
      <div class="project-card-links">
        {% if project.writeup %}<a href="{{ project.writeup | relative_url }}">Write-up</a>{% endif %}
        {% if project.link %}<a href="{{ project.link }}">Demo</a>{% endif %}
        {% if project.repo %}<a href="{{ project.repo }}">Code</a>{% endif %}
      </div>
    </div>
  </div>
  {% endfor %}
</div>
