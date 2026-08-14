# Music DApp - Complete Working Process Documentation

## Overview
A decentralized music streaming platform built with Next.js, Supabase, and Ethereum blockchain integration. Users can upload, stream, download music, and earn MUSIC tokens.

---

## 🎯 Core Features

### 1. **User Authentication System**
- **Email/Password Authentication** via Supabase Auth
- **Automatic Profile Creation** in `profiles` table
- **Session Management** with localStorage persistence
- **Auto-generated Ethereum Wallet** for each user

**How it works:**
1. User registers with email, password, and username
2. Supabase creates auth account
3. Backend creates profile record with initial 1000 MUSIC tokens
4. User automatically logged in with session stored in browser
5. Session persists across page refreshes

---

## 💰 Token Economy System

### MUSIC Token System
- **Initial Balance:** Every new user gets **1000 MUSIC tokens**
- **Token Database:** Stored in `profiles.music_token_balance`

### Token Costs:
| Action | Cost | Recipient |
|--------|------|-----------|
| **Upload Music** | -10 MUSIC | Deducted from uploader |
| **Download Music** | -10 MUSIC | Transferred to track creator |

### Token Purchase Process:
1. **User clicks "Buy Tokens"** button
2. Modal shows available packages:
   - 100 MUSIC = 0.01 ETH
   - 500 MUSIC = 0.04 ETH (Popular)
   - 1000 MUSIC = 0.07 ETH
   - 5000 MUSIC = 0.30 ETH
   - Custom amount supported

3. **Payment Methods:**
   - **MetaMask:** One-click payment via browser wallet
   - **Manual:** Send ETH to receiver address, paste transaction hash

4. **Verification Process:**
   - Backend verifies transaction on Sepolia Etherscan
   - Checks payment amount matches token package
   - Credits tokens to user's balance
   - Stores transaction hash to prevent double-crediting

5. **Instant Credit:**
   - After 1 block confirmation, tokens appear in balance
   - User can immediately upload/download tracks

---

## 🎵 Music Upload Process

### Step-by-Step Upload Flow:

**Step 1: Upload Audio**
- User selects audio file (MP3, WAV, FLAC up to 50MB)
- Drag & drop or click to browse
- File stored in browser memory (not uploaded yet)

**Step 2: Add Details**
- **Required:** Track Title
- **Optional:** Artist Name, Genre, Description
- **Cover Art Options:**
  - Upload custom image
  - Choose from 8 gradient presets

**Step 3: Set Price**
- Optional NFT mint price in ETH (Sepolia testnet)
- If blank, track is free to mint
- Royalties system for secondary sales

**Step 4: Publish**
- **Review summary** of all details
- Click "Publish Track"

**Backend Process:**
1. **Check Token Balance**
   - Verify user has ≥10 MUSIC tokens
   - If insufficient, show error with buy tokens link

2. **Upload Audio to Supabase Storage**
   - Direct client-side upload to `music` bucket
   - Bypasses Vercel 4.5MB body limit
   - File URL: `https://[project].supabase.co/storage/v1/object/public/music/[filename]`

3. **Upload Cover Image** (if provided)
   - API route `/api/upload/image`
   - Stored in Supabase Storage
   - Returns public URL

4. **Create Database Record**
   - Insert into `posts` table:
     ```javascript
     {
       user_id: userId,
       title: "Track Title",
       artist: "Artist Name",
       genre: "Electronic",
       description: "Track description",
       audio_url: "https://...",
       cover_url: "https://...",  // or null
       cover_gradient: "linear-gradient(...)", // if no cover
       duration: "3:45",
       nft_price: 0.05, // or null
       created_at: timestamp
     }
     ```

5. **Deduct Tokens**
   - Update `profiles.music_token_balance`
   - Subtract 10 MUSIC tokens
   - Return new balance

6. **Success Response**
   - Show toast: "Track published! 🎉 (-10 MUSIC — balance: 990 MUSIC)"
   - Redirect to home feed
   - Track appears immediately in feed

---

## 🎧 Audio Playback System

### Global Audio Player Architecture

**AudioPlayerContext** (Global State Manager):
```javascript
{
  currentTrack: { id, title, artist, audioUrl, coverUrl },
  isPlaying: boolean,
  progress: currentTime in seconds,
  duration: total duration in seconds,
  playTrack(track),
  pauseTrack(),
  seekTo(time),
  setVolume(0-100)
}
```

**How Playback Works:**

1. **User clicks play button** on any track (Home feed, Explore, etc.)

2. **Component calls** `playTrack(track)`:
   - If same track: resume playback
   - If different track: load new audio file

3. **Audio Element** (created in context):
   ```javascript
   audioRef.current = new Audio()
   audioRef.current.src = track.audioUrl
   audioRef.current.play()
   ```

4. **Real-time Updates:**
   - `timeupdate` event → updates progress bar
   - `loadedmetadata` event → sets total duration
   - `ended` event → stops playback, resets progress

5. **Bottom Player UI** displays:
   - Track cover (image or gradient)
   - Title and artist name
   - Play/pause button
   - Progress bar (seekable)
   - Volume control
   - Like button

6. **Sync Across Pages:**
   - Same track shows "● PLAYING" indicator everywhere
   - Play state syncs between Home, Explore, Profile
   - Only one track plays at a time

---

## 📥 Download System

### Download with Token Transfer Process:

**User clicks "Download" button on track:**

1. **Frontend Request:**
   ```javascript
   POST /api/downloads
   Body: { postId: 123, userId: 456 }
   ```

2. **Backend Validation:**
   - Check user is logged in
   - Verify track exists
   - Check user has ≥10 MUSIC tokens

3. **Token Transfer:**
   - **Downloader:** -10 MUSIC
   - **Creator:** +10 MUSIC
   - Database transaction (both updates must succeed)

4. **Return Download URL:**
   ```javascript
   {
     success: true,
     downloadUrl: "https://[project].supabase.co/storage/v1/object/public/music/[file]",
     newBalance: 490,
     creatorBalance: 1020
   }
   ```

5. **Trigger Download:**
   - Create temporary `<a>` element
   - Set `href` to download URL
   - Set `download` attribute to filename
   - Programmatically click link
   - File downloads to user's device

6. **Success Message:**
   - Toast: "Downloaded! -10 MUSIC (Balance: 490)"
   - Creator receives notification of purchase

---

## 🔔 Real-time Notifications

### Notification System Architecture:

**Triggers:**
- New follower
- Track download/purchase
- Comment on track
- Like on track

**How it Works:**

1. **Action Occurs** (e.g., user downloads track):
   ```javascript
   // In /api/downloads/index.js after successful download:
   await supabaseAdmin.from("notifications").insert({
     user_id: creatorId,  // track creator
     type: "download",
     message: `${downloader.username} downloaded your track "${track.title}"`,
     post_id: postId,
     from_user_id: downloaderId,
     read: false
   })
   ```

2. **Real-time Subscription** (in Notifications page):
   ```javascript
   supabase
     .channel('notifications')
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'notifications',
       filter: `user_id=eq.${user.id}`
     }, (payload) => {
       // New notification received
       setNotifications([payload.new, ...notifications])
       showToast('New notification!')
     })
     .subscribe()
   ```

3. **Notification Display:**
   - Shows in `/notifications` page
   - Badge count on sidebar icon
   - Shows sender avatar, message, time ago
   - Click to mark as read

4. **RLS Policy:**
   - Uses `supabaseAdmin` to bypass Row Level Security
   - Service role key has full access
   - Prevents 403 errors

---

## 👤 Profile Management

### Profile Features:

**Display:**
- Avatar (uploaded image or gradient circle with initial)
- Cover photo (banner image)
- Username, bio
- Stats: Total uploads, Followers, Following
- MUSIC token balance
- Generated Ethereum wallet address

**Edit Profile Process:**

1. **User clicks "Edit Profile"** button

2. **Modal opens** with current data pre-filled

3. **User can update:**
   - Username
   - Bio text
   - Avatar image (uploads to Supabase Storage)
   - Cover photo (uploads to Supabase Storage)

4. **Save Changes:**
   ```javascript
   PUT /api/users/[userId]
   Body: { username, bio, avatarUrl, coverPhotoUrl }
   ```

5. **Database Update:**
   - Updates `profiles` table
   - Returns updated profile

6. **UI Refresh:**
   - Uses `window.location.href` to force full page reload
   - Ensures all components see new data
   - Avatar updates everywhere (posts, comments, navbar)

---

## 🎨 Genre System

### Available Genres:
- **Electronic**
- **Hindi**
- **Artistic**
- **Pop**
- **Japanese**
- **Other**

**Genre Filtering:**
- Tracks tagged with genre on upload
- Filter buttons in Explore page (removed from sidebar)
- Color-coded genre badges on track cards
- API endpoint: `/api/posts?genre=Electronic`

---

## 🗄️ Database Structure

### Supabase Tables:

**profiles**
```sql
{
  id: UUID (primary key, references auth.users)
  username: TEXT
  bio: TEXT
  avatar_url: TEXT
  cover_photo_url: TEXT
  music_token_balance: INTEGER (default 1000)
  generated_wallet_address: TEXT
  created_at: TIMESTAMP
}
```

**posts**
```sql
{
  id: BIGSERIAL (primary key)
  user_id: UUID (foreign key → profiles)
  title: TEXT
  artist: TEXT
  genre: TEXT
  description: TEXT
  audio_url: TEXT
  cover_url: TEXT
  cover_gradient: TEXT
  duration: TEXT
  nft_price: NUMERIC
  plays: INTEGER (default 0)
  created_at: TIMESTAMP
}
```

**notifications**
```sql
{
  id: BIGSERIAL (primary key)
  user_id: UUID (foreign key → profiles)
  type: TEXT (download, follow, like, comment)
  message: TEXT
  post_id: BIGINT (foreign key → posts, nullable)
  from_user_id: UUID (foreign key → profiles, nullable)
  read: BOOLEAN (default false)
  created_at: TIMESTAMP
}
```

**Storage Buckets:**
- `music` - Audio files (PUBLIC)
- `images` - Cover art, avatars, banners (PUBLIC)

---

## 🔐 Security & Permissions

### Row Level Security (RLS):

**profiles table:**
- Read: Public (anyone can view profiles)
- Insert: Authenticated users only
- Update: User can only update own profile

**posts table:**
- Read: Public (anyone can view tracks)
- Insert: Authenticated users only
- Update: User can only update own posts
- Delete: User can only delete own posts

**notifications table:**
- Read: User can only see own notifications
- Insert: Authenticated users (system creates)
- Update: User can only update own notifications

**Storage Policies:**
```sql
-- Allow public reads from music bucket
CREATE POLICY "Allow public reads from music"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

-- Allow authenticated uploads to music bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music' AND auth.role() = 'authenticated');
```

---

## 🚀 Deployment Architecture

### Tech Stack:
- **Frontend:** Next.js 13 (React)
- **Styling:** Inline styles (no CSS framework)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (S3-compatible)
- **Authentication:** Supabase Auth
- **Blockchain:** Ethereum Sepolia Testnet
- **Hosting:** Vercel
- **Wallet:** MetaMask integration

### Environment Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### Build Process:
1. Git push to main branch
2. Vercel detects changes
3. Installs dependencies (`npm install`)
4. Builds Next.js app (`npm run build`)
5. Server-side renders pages
6. Deploys to production
7. Available at: https://music-dapp-mu.vercel.app

---

## 🎯 User Journey Example

**New User Registration to First Download:**

1. **Visit site** → Click "Sign Up"
2. **Enter** email, password, username → Submit
3. **Account created** → Auto-login → 1000 MUSIC tokens credited
4. **Browse home feed** → See tracks uploaded by other users
5. **Click play** on track → Audio streams in bottom player
6. **Like the track** → Heart icon fills
7. **Click download** → 10 MUSIC deducted, 10 MUSIC sent to creator
8. **File downloads** to computer
9. **Want more tokens?** → Click "Buy Tokens"
10. **Send 0.04 ETH** → Get 500 MUSIC tokens instantly
11. **Upload own track:**
    - Select audio file
    - Add title "My First Song"
    - Choose genre "Electronic"
    - Pick gradient cover
    - Publish → 10 MUSIC deducted
12. **Track appears** in home feed and profile
13. **Other users download** → Earn 10 MUSIC per download
14. **Check notifications** → See who downloaded your track

---

## 🔄 Data Flow Diagrams

### Upload Flow:
```
User → File Selection → Details Form → Review → 
Backend Check Balance → Upload Audio → Upload Cover → 
Create Post Record → Deduct Tokens → Success → 
Show in Feed
```

### Download Flow:
```
User Click Download → Check Auth → Check Balance → 
Deduct 10 from Downloader → Add 10 to Creator → 
Create Notification → Return Download URL → 
Trigger Browser Download → Success Toast
```

### Playback Flow:
```
User Click Play → Context.playTrack() → 
Load Audio Element → Update State → 
Render Player UI → Listen to Events → 
Update Progress → Sync Across Components
```

---

## 🐛 Common Issues & Solutions

### Issue: Audio not playing
**Solution:** Add Supabase storage SELECT policy for `music` bucket

### Issue: Images not showing
**Solution:** Verify `cover_url` in database, check storage permissions

### Issue: Balance shows 0 MUSIC
**Solution:** Refresh button in Buy Tokens modal, or check API response

### Issue: Upload fails with 413 error
**Solution:** Client-side upload directly to Supabase Storage (already implemented)

### Issue: Deployment fails
**Solution:** SSR safety checks for browser APIs (Audio, window) - already fixed

---

## 📊 Analytics & Metrics

**Track Metrics:**
- Play count (incremented on each play)
- Download count
- Like count
- Comment count

**User Metrics:**
- Total uploads
- Total downloads received
- MUSIC tokens earned
- Followers/Following count

**Platform Metrics:**
- Total users
- Total tracks uploaded
- Total MUSIC tokens in circulation
- Total transactions processed

---

## 🔮 Future Enhancements

**Planned Features:**
- [ ] NFT minting functionality
- [ ] Playlist creation
- [ ] Social features (comments, shares)
- [ ] Artist verification badges
- [ ] Advanced search & filters
- [ ] Trending tracks algorithm
- [ ] Mobile app (React Native)
- [ ] Mainnet deployment
- [ ] IPFS storage integration
- [ ] Smart contract royalties

---

## 📝 API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Login existing user |
| `/api/posts` | GET | Fetch tracks with filters |
| `/api/posts` | POST | Upload new track |
| `/api/downloads` | POST | Download track + transfer tokens |
| `/api/tokens/credit` | POST | Credit MUSIC tokens after ETH payment |
| `/api/wallet/balance` | GET | Get user's MUSIC token balance |
| `/api/users/[id]` | GET | Get user profile |
| `/api/users/[id]` | PUT | Update user profile |
| `/api/notifications` | GET | Get user's notifications |
| `/api/upload/image` | POST | Upload image to storage |

---

## 🎓 Conclusion

This Music DApp combines traditional web2 features (authentication, file storage) with web3 elements (token economy, wallet integration) to create a hybrid decentralized music platform. The token economy incentivizes content creation while the real-time features provide a modern streaming experience.

**Key Innovations:**
- ✅ Direct-to-storage audio upload (bypasses API limits)
- ✅ Global audio player context (seamless playback)
- ✅ Real-time notifications (Supabase subscriptions)
- ✅ Token-gated downloads (creator earnings)
- ✅ Instant token crediting (verified via Etherscan)
- ✅ SSR-safe audio player (works with Next.js)

The platform is production-ready and deployed at: **https://music-dapp-mu.vercel.app**

---

**Last Updated:** February 2025  
**Version:** 1.0.0  
**Author:** Built with Kiro AI Assistant
