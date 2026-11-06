# Inquiry Manager

A small responsive web app for a shop to log customer inquiries, set a priority, assign them to a team member and track their status. Built for INFO3130 The Emerging Interface (midterm, option 04).

**Live site:** _add the GitHub Pages URL here_
**Figma:** https://www.figma.com/design/WCbkxlPRzHjb26fzt2ti7l

## What it does

- **Add an inquiry:** customer name, phone, optional email, the inquiry text, priority (High, Medium, Low) and who it is assigned to.
- **See and filter inquiries:** the open list is sorted by priority. The status tiles (New, In progress, Resolved) filter by status, the priority chips filter by priority, and the search box looks through name, phone, email and message.
- **Update an inquiry:** change priority, assignee or status, or press Resolve. Resolved inquiries leave the open list and stay available through the Resolved tile.
- Data is saved in the browser (`localStorage`). There is no backend.

## Run it

It is a static site with ES modules, so serve the folder over HTTP (opening `index.html` as a file will not load the scripts):

```
python3 -m http.server 8000
```

then open http://localhost:8000.

## Layout

- `index.html`: page shell
- `css/tokens.css`: design tokens (same names and values as the Figma variables)
- `css/styles.css`: styles; mobile first, split view from 960px
- `js/store.js`: data and localStorage
- `js/ui.js`: icons, badges, date format
- `js/app.js`: routing, list, forms, details
- `docs/decisions.md`: design decision log

## Accessibility

Visible keyboard focus on every control, labels on every field (not placeholders), error summary that takes focus with links to the fields, status and priority shown with icon and text (never colour alone), 44 px minimum touch targets, native selects, a skip link, and live announcements for saves and filter results. Target: WCAG 2.2 AA.
