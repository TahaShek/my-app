v# Vercel Deployment Guide

This app can be deployed on Vercel and will work fine! Here's what you need to do:

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Firebase Project** - Already set up
3. **Supabase Project** - Already set up

## Environment Variables

Add these environment variables in your Vercel project settings:

### Firebase Client (Public - Safe to expose)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### Firebase Admin (Private - Server-side only)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (Make sure to include the full key with `\n` characters)

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deployment Methods

### Method 1: Deploy via Terminal (CLI) - Recommended

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   # or
   yarn global add vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variables** (you can do this via CLI or dashboard)
   
   Option A: Via CLI (one at a time)
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
   vercel env add NEXT_PUBLIC_FIREBASE_VAPID_KEY
   vercel env add FIREBASE_PROJECT_ID
   vercel env add FIREBASE_CLIENT_EMAIL
   vercel env add FIREBASE_PRIVATE_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   
   Option B: Via `.env.local` file (then push to Vercel)
   ```bash
   # Create .env.local with all your variables
   vercel env pull .env.local
   # Edit .env.local and add your variables
   vercel env push .env.local
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```
   
   Or deploy to preview:
   ```bash
   vercel
   ```

5. **That's it!** Your app will be deployed and the URL will be shown in the terminal.

### Method 2: Deploy via Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import project in Vercel**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Import your repository

3. **Add Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all the variables listed above
   - Make sure to add them for Production, Preview, and Development

4. **Deploy**
   - Vercel will automatically detect Next.js
   - The build will run `prebuild` script which generates the service worker
   - Deploy!

## Important Notes

- **Service Worker**: The service worker is automatically built with environment variables during the build process
- **HTTPS Required**: Push notifications require HTTPS, which Vercel provides automatically
- **Service Worker Scope**: The service worker is served from the root domain, which is required for push notifications
- **Firebase Config**: The service worker uses the same Firebase config as your app (public config is safe to expose)

## Testing After Deployment

1. Visit your deployed app
2. Grant notification permissions
3. Click "Send Notification" button
4. Check browser console for notification count logs
5. Test background notifications by closing the tab and sending a notification

## Quick Deploy Commands

```bash
# First time setup
vercel login
vercel

# Set environment variables (interactive)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls
```

## Troubleshooting

- **Service Worker not registering**: Make sure the app is served over HTTPS
- **Notifications not working**: Check browser console and Vercel function logs
- **Environment variables not working**: Make sure they're added in Vercel (via CLI or dashboard) and prefixed correctly (`NEXT_PUBLIC_` for client-side)
- **CLI not found**: Make sure Vercel CLI is installed globally: `npm i -g vercel`
- **Build fails**: Check that all environment variables are set: `vercel env ls`
