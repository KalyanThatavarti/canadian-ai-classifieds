# 🇨🇦 Canadian AI Classifieds Website

A modern, ultra-premium classifieds website for the Canadian public, powered by AI and Firebase.

## ✨ Features

- **AI-Powered Ad Creation**: Create ads in 60 seconds with AI-generated descriptions
- **Verified Safety System**: AI-powered identity verification and fraud detection
- **Local Matching**: Find buyers and sellers within 2-5 km radius
- **Real-time Listings**: Live updates powered by Firebase Firestore
- **Secure Messaging**: End-to-end encrypted communication
- **Smart Pricing**: AI suggests optimal prices based on market data

## 🎨 Design

- **Ultra-Modern UI**: Glassmorphism design with smooth animations
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: WCAG 2.1 compliant with semantic HTML
- **Performance**: Optimized assets and lazy loading

## 📚 Documentation

For detailed feature documentation, see the [docs](docs/) folder:
- **[Feature Documentation](docs/FEATURES.md)** - Complete guide to all implemented features
  - Premium Glassmorphic Header
  - Hero Section with Image Slider
  - AI-Powered Search Bar
  - Luxury Card Components
  - Responsive Design
  - Browser Support & Performance

## 🏗️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Firebase
  - Authentication (Email/Password, Google)
  - Firestore Database
  - Cloud Storage
  - Cloud Functions (future)
  - Analytics
- **Fonts**: Inter from Google Fonts
- **Hosting**: Firebase Hosting (recommended)

## 📂 Project Structure

```
canadian-classifieds/
├── index.html              # Main homepage
├── css/
│   ├── styles.css          # Global styles
│   ├── header.css          # Premium glassmorphic header
│   ├── hero-slider.css     # Hero section with image slider
│   ├── luxury-cards.css    # Card components
│   └── search-bar.css      # AI-powered search bar
├── js/
│   ├── app.js              # Main application logic
│   ├── firebase-config.js  # Firebase configuration
│   ├── header.js           # Header interactions
│   ├── hero-slider.js      # Image slider functionality
│   └── category-title-animation.js  # Category animations
├── images/
│   ├── hero_background_*.png  # Hero slider images
│   └── ai-safety.png       # AI safety illustration
├── docs/
│   ├── README.md           # Documentation index
│   └── FEATURES.md         # Complete feature documentation
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (free tier is fine)
- Basic knowledge of HTML/CSS/JavaScript

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to Authentication
   - Click "Get Started"
   - Enable "Email/Password" sign-in method
   - Enable "Google" sign-in method

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in **test mode** (change security rules later)
   - Choose a location close to your users (e.g., `us-central` for Canada)

4. **Enable Storage**
   - Go to Storage
   - Click "Get Started"
   - Start in test mode

5. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon (`</>`)
   - Copy the `firebaseConfig` object

6. **Update Configuration**
   - Open `js/firebase-config.js`
   - Replace the placeholder config with your actual config
   - Uncomment the Firebase initialization code

7. **Add Firebase SDK to HTML**
   - Open `index.html`
   - Add these scripts before the closing `</body>` tag (before `app.js`):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
```

### Local Development

1. **Option 1: Using Python**
   ```bash
   cd canadian-classifieds
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser

2. **Option 2: Using Node.js**
   ```bash
   npx http-server -p 8000
   ```

3. **Option 3: Using VS Code**
   - Install "Live Server" extension
   - Right-click `index.html`
   - Select "Open with Live Server"

### Deployment

#### Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Set public directory to `.` (current directory)
   - Configure as single-page app: `No`
   - Don't overwrite index.html

4. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

Your site will be live at `https://your-project-id.web.app`

## 📊 Firestore Database Structure

### Collections

#### `listings` Collection
```javascript
{
  userId: "user123",
  title: "Modern Sofa Set",
  description: "AI-generated description...",
  price: 450,
  category: "furniture",
  location: {
    latitude: 43.6532,
    longitude: -79.3832,
    city: "Toronto",
    province: "ON"
  },
  images: ["url1.jpg", "url2.jpg"],
  status: "active", // 'active' | 'sold' | 'deleted'
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `users` Collection
```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  verified: true,
  createdAt: timestamp,
  listings: ["listing1", "listing2"]
}
```

### Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 🎯 Next Steps

### Phase 1: Core Features (Current)
- [x] Homepage design
- [x] Responsive layout
- [x] Firebase configuration
- [ ] User authentication UI
- [ ] Listing creation page
- [ ] Listings browse page

### Phase 2: Enhanced Features
- [ ] AI description generation (OpenAI API)
- [ ] Image upload and compression
- [ ] Real-time chat messaging
- [ ] User profiles
- [ ] Review system
- [ ] Search and filters

### Phase 3: Advanced Features
- [ ] Geolocation and maps integration
- [ ] Push notifications
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard
- [ ] Analytics and reporting

## 🐛 Troubleshooting

### Firebase Not Loading
- Check browser console for errors
- Verify Firebase config is correct
- Ensure Firebase SDK scripts are loaded before your app.js

### Images Not Showing
- Check image paths are correct
- Verify images are in the `images/` folder
- Check browser console for 404 errors

### Styles Not Applied
- Clear browser cache (Ctrl+Shift+R)
- Check CSS file path in index.html
- Verify styles.css has no syntax errors

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for Canadians 🇨🇦**
