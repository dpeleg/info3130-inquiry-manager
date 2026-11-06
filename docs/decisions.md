# Decision log (Small Business Inquiry Manager)

| # | Decision | Who decided | Notes |
|---|---|---|---|
| 1 | Project option 04, Small Business Inquiry Manager | Human | Core flow: add inquiry, assign priority, update and view status |
| 2 | One persona (Priya, office manager who takes calls, sets priority, assigns a technician); technician side out of scope | Human | AI had proposed two personas; human reduced to one |
| 3 | Three user stories: add, view/filter, modify (priority, status, resolve) | Human | AI had proposed four; human merged and trimmed |
| 4 | Three statuses: New, In progress, Resolved | Human | AI recommended three, human confirmed |
| 5 | Mobile first; list and details side by side on desktop | Human set mobile-first; AI proposed the desktop split | Desktop split not yet confirmed by the human |
| 6 | Style direction A (calm slate) with a darker, redder primary: deep violet #3A2A78 | Human | AI offered three options (indigo, deep violet, plum-navy); human chose deep violet; contrast with white is 11.8:1 |
| 7 | Atkinson Hyperlegible typeface | AI proposed; human has not yet confirmed | Chosen for legibility; available in Figma and Google Fonts |
| 8 | "In progress" badge changed to teal (#115E59 on #CCFBF1, 6.7:1) so it does not clash with the violet primary | AI proposed; human has not yet confirmed | Badges also carry an icon and a label, never colour alone |
| 9 | List view filters: the three status count tiles double as the status filter (tap to filter, tap again to clear); priority is a row of three selectable chips (High, Medium, Low); no separate status chip | Human | AI's first wireframe had generic "Status" and "Priority" chips; human pointed out the counts already filter status and that a priority chip must show which priority |
| 10 | List view has a search bar (customer name, phone, issue text) | Human | Missing from the AI's first wireframe |
| 11 | Search bar sits below the status tiles and priority chips (order: tiles, priority, search, results) | Human | Human changed the AI's wireframe order |
| 12 | Status count tiles show totals for all inquiries, not counts within the current filter | AI default; human has not yet confirmed | Keeps the tiles stable while filtering |
| 13 | No desktop frames in Figma; the desktop layout is designed directly in code | Human | Mobile-first: Figma holds the mobile screens, code expands them |
| 14 | Status tiles show the status label above the number | Human | Replaces the earlier number-above-label tile |
| 15 | App bar added: brand name and Add inquiry button; back arrow and screen title on form and details screens | Human | |
| 16 | Badge colours softened (lighter tints, mid-tone text, all at least 4.5:1) | Human asked; AI chose the new values | Values checked by eye, then by the contrast table in the report |
| 17 | Wording is general: "Assigned to" instead of "Technician", sample data is a shop (shipping, stock, returns) | Human | Inquiries can be about anything, not only repairs |
| 18 | Email field added to the new inquiry form, optional | Human | |
| 19 | Details screen order: Priority dropdown, details, Assigned to dropdown, Update status dropdown, Save / Resolve / Cancel | Human | |
| 20 | Priority is a dropdown on the new inquiry form too, for consistency with details | AI; human approved the canvas | List filter keeps the three priority chips |
| 21 | Desktop (960px and up): list on the left, details or new inquiry form in a right pane; no dialog | AI | A pane avoids the focus-trap work a dialog needs |
| 22 | Default list shows open inquiries (New and In progress); Resolved is reached through its status tile | Human (earlier decision), AI implementation | Search and priority filters apply inside whichever status is showing |
| 23 | Plain HTML, CSS and JavaScript (ES modules), localStorage key `inquiryManager.v1`, hash routing | AI | No build step, deploys as-is to GitHub Pages |
| 24 | Resolved inquiries sit in a collapsed "Resolved (n)" list under the open list, greyed out; the Resolved tile opens it and scrolls to it. Status tiles New and In progress still filter the open list | Human | Replaces decision 22: the old Resolved tile filter showed nothing useful to the human. Priority and search filters apply to both lists. Figma not changed yet |
