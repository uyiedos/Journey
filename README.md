This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# Journey App Overview

Journey is a gamified Bible reading and discipleship app built on Next.js and Supabase. It combines reading plans, devotionals, community features, AI-assisted tools, and a rich points/achievements system to encourage consistent spiritual growth.

## Core Features

- Reading plans with progress tracking and streaks.
- Devotionals with scripture references and images.
- Gamified points, streak milestones, referrals, and achievements.
- Community posts, comments, likes, and events.
- AI tools (Virgo AI) for reading plans and spiritual content.

## Recent Updates

- Added **comprehensive notification system**:
  - Backend notifications for points, achievements, post likes/comments, and more.
  - `NotificationBell` in the header with unread count and dropdown list.
  - `useNotifications` hook for fetching/marking notifications as read.
- Improved **achievements** page:
  - Badges now correctly unlock based on `userAchievements` from Supabase.
- Enhanced **Virgo AI**:
  - Rich, Christ-centered persona and theological capabilities.
  - New UI with tabs for reading plans, exegesis, sermons, prayers, essays, and debates.
- Devotional creation improvements:
  - Replaced fixed sample verse dropdown with **book/chapter/verse range** selector using full Bible books list.
  - Stores a human-readable `verse_reference` (e.g., `John 3:16-18`).
- UI polish:
  - Notification and form dropdowns now use solid backgrounds (no transparency) for better readability.
  - Profile avatar and username in the header now link to `/profile`.
- Events system update:
  - Creating an event now awards **500 points**.

## Points System

For a detailed breakdown of how points are earned and spent across reading, devotionals, community, events, referrals, streaks, and achievements, see:

- [`POINTS.md`](./POINTS.md)

