# Firestore Database Schema

## Collections Overview

### users
Stores user profiles and account information.

```javascript
{
  userId: "auto-generated-uid",
  firstName: "string",
  lastName: "string",
  email: "string",
  role: "client" | "admin",
  subscription: "free" | "paid",
  modulesAccess: ["moduleId1", "moduleId2"], // Array of module IDs user has access to
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### modules
Stores all course modules (free and paid).

```javascript
{
  moduleId: "auto-generated-id",
  title: "string",
  description: "string",
  content: "string (HTML/Markdown)",
  thumbnailUrl: "string (Storage URL)",
  isFree: boolean,
  price: number, // 0 if free
  category: "string",
  tags: ["tag1", "tag2"],
  videoUrl: "string (optional)",
  downloadableResources: [
    {
      name: "string",
      url: "string",
      type: "pdf" | "audio" | "image"
    }
  ],
  published: boolean,
  order: number, // For sorting
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "userId"
}
```

### consultations
Stores consultation bookings and history.

```javascript
{
  consultationId: "auto-generated-id",
  userId: "string",
  type: "initial" | "follow-up" | "emergency",
  status: "scheduled" | "completed" | "cancelled",
  scheduledDate: timestamp,
  duration: number, // in minutes
  meetLink: "string (Google Meet URL)",
  notes: "string", // Admin notes during/after session
  clientNotes: "string", // Client's notes/questions before session
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### leads
Stores email leads from e-book downloads.

```javascript
{
  leadId: "auto-generated-id",
  firstName: "string",
  email: "string",
  consent: boolean,
  source: "ebook-gratuit" | "newsletter" | "other",
  ebookSent: boolean,
  convertedToUser: boolean,
  createdAt: timestamp,
  tags: ["tag1", "tag2"]
}
```

### payments
Stores payment transactions (Stripe integration).

```javascript
{
  paymentId: "auto-generated-id",
  userId: "string",
  amount: number,
  currency: "EUR",
  status: "pending" | "completed" | "failed" | "refunded",
  type: "module" | "ebook" | "consultation" | "subscription",
  itemId: "string", // moduleId, ebookId, or consultationId
  stripePaymentId: "string",
  createdAt: timestamp
}
```

### progress
Tracks user progress through modules.

```javascript
{
  progressId: "auto-generated-id",
  userId: "string",
  moduleId: "string",
  completed: boolean,
  completionPercentage: number,
  lastAccessedAt: timestamp,
  startedAt: timestamp,
  completedAt: timestamp
}
```

### blog_posts
Stores blog articles for SEO.

```javascript
{
  postId: "auto-generated-id",
  title: "string",
  slug: "string",
  content: "string (HTML/Markdown)",
  excerpt: "string",
  featuredImage: "string (Storage URL)",
  author: "Jennifer",
  category: "string",
  tags: ["tag1", "tag2"],
  seoTitle: "string",
  seoDescription: "string",
  seoKeywords: ["keyword1", "keyword2"],
  published: boolean,
  publishedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Modules collection
    match /modules/{moduleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Consultations collection
    match /consultations/{consultationId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (resource.data.userId == request.auth.uid || 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Leads collection
    match /leads/{leadId} {
      allow create: if true; // Anyone can create a lead
      allow read, update, delete: if request.auth != null && 
                                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
    }
    
    // Progress collection
    match /progress/{progressId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Blog posts collection
    match /blog_posts/{postId} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Indexes

Required composite indexes for queries:

1. **consultations**: userId (Ascending) + status (Ascending) + scheduledDate (Ascending)
2. **modules**: published (Ascending) + order (Ascending)
3. **progress**: userId (Ascending) + moduleId (Ascending)
4. **blog_posts**: published (Ascending) + publishedAt (Descending)

## Storage Structure

```
/modules/{moduleId}/
  - thumbnail.jpg
  - video.mp4
  - resources/
    - resource1.pdf
    - resource2.mp3

/ebooks/
  - free-guide.pdf
  - complete-guide.pdf

/blog/
  - {postId}/
    - featured-image.jpg

/users/{userId}/
  - profile-picture.jpg
```
