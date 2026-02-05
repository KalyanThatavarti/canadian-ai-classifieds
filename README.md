# 🍁 Canadian AI Classifieds

A modern, AI-powered classifieds platform for buying and selling items across Canada. Built with Firebase, featuring real-time messaging, email notifications, and a beautiful user interface.

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://canadian-ai-classifieds.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### Core Functionality
- 🔐 **User Authentication** - Email/password and Google OAuth sign-in
- 📝 **Listing Management** - Create, edit, and manage classified ads
- 🔍 **Advanced Search** - Filter by category, location, and price range
- 💬 **Real-time Messaging** - Built-in chat system for buyers and sellers
- ⭐ **Favorites** - Save and track listings you're interested in
- 📊 **User Profiles** - Manage your listings and account settings

### Email Notifications
- 📧 **Message Notifications** - Get instant email alerts for new messages
- 💰 **Price Drop Alerts** - Notifications when favorited items drop in price
- 📬 **Weekly Digest** - Curated summary of new listings (opt-in)
- ⚙️ **Notification Settings** - Customizable email preferences

### UI/UX
- 🎨 **Modern Design** - Clean, responsive interface
- 📱 **Mobile-First** - Optimized for all devices
- 🌈 **Premium Aesthetics** - Vibrant colors, smooth animations
- ♿ **Accessible** - WCAG compliant design

## 🚀 Live Demo

Visit the live site: **[canadian-ai-classifieds.web.app](https://canadian-ai-classifieds.web.app)**

## 📸 Screenshots

[Add screenshots here once you upload them]

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Vanilla JS for interactivity
- **Firebase SDK v9** - Client-side Firebase integration

### Backend
- **Firebase Authentication** - User auth and session management
- **Cloud Firestore** - NoSQL database for real-time data
- **Cloud Functions** - Serverless Node.js 20 runtime
- **Firebase Storage** - Image and file storage
- **Firebase Hosting** - Static site hosting

### Email Service
- **Resend API** - Transactional email delivery
- **Custom HTML Templates** - Responsive email design

## 📋 Prerequisites

- Node.js 20+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project ([Create one here](https://console.firebase.google.com))
- A Resend account ([Sign up here](https://resend.com))

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/KalyanThatavarti/canadian-ai-classifieds.git
cd canadian-ai-classifieds
```

### 2. Set Up Firebase Configuration

```bash
# Copy the example file
cp js/firebase-config.example.js js/firebase-config.js
```

Edit `js/firebase-config.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 3. Set Up Cloud Functions

```bash
cd functions
npm install
cp .env.example .env
```

Add your Resend API key to `functions/.env`:

```
RESEND_API_KEY=re_your_api_key_here
```

### 4. Deploy to Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already)
firebase init

# Deploy everything
firebase deploy
```

For detailed setup instructions, see [SECURITY_SETUP.md](SECURITY_SETUP.md)

## 📁 Project Structure

```
canadian-ai-classifieds/
├── css/                    # Stylesheets
│   ├── styles.css         # Global styles
│   ├── header.css         # Navigation styles
│   └── toast.css          # Toast notification styles
├── js/                     # JavaScript files
│   ├── firebase-config.js # Firebase initialization (gitignored)
│   ├── header.js          # Header/navigation logic
│   ├── ui-components.js   # Reusable UI components
│   └── notification-settings.js  # Email preferences
├── pages/                  # HTML pages
│   ├── index.html         # Homepage
│   ├── auth/              # Authentication pages
│   ├── messages/          # Messaging interface
│   └── notification-settings.html  # Email settings
├── functions/              # Cloud Functions
│   ├── index.js           # Main functions entry
│   ├── lib/
│   │   ├── email-service.js      # Resend integration
│   │   └── email-templates.js    # Email HTML templates
│   └── package.json
├── firestore.rules        # Firestore security rules
├── firebase.json          # Firebase configuration
└── SECURITY_SETUP.md      # Security setup guide
```

## 🔐 Security

This repository follows security best practices:

- ✅ API keys are **gitignored** and not committed
- ✅ Example configuration files provided
- ✅ Firestore Security Rules enforce access control
- ✅ Cloud Functions use environment variables
- ✅ Firebase Client SDK keys are domain-restricted

See [SECURITY_SETUP.md](SECURITY_SETUP.md) for details.

## 📧 Email Notifications

The platform uses **Cloud Functions** to send automated emails:

1. **Message Notifications** (`onMessageCreated`)
   - Triggered when a new message is sent
   - Sends email to the recipient

2. **Price Drop Alerts** (`onListingPriceChanged`)
   - Monitors listing price changes
   - Alerts users who favorited the item (≥10% or $50 drop)

3. **Weekly Digest** (`sendWeeklyDigest`)
   - Scheduled function (Mondays at 9 AM EST)
   - Sends curated list of new listings to opted-in users

## 🎯 Roadmap

- [ ] Advanced AI-powered listing descriptions
- [ ] Image recognition for automatic categorization
- [ ] Seller ratings and reviews
- [ ] Payment integration
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Spam detection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kalyan Thatavarti**
- GitHub: [@KalyanThatavarti](https://github.com/KalyanThatavarti)
- Project: [canadian-ai-classifieds](https://github.com/KalyanThatavarti/canadian-ai-classifieds)

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Resend for email delivery
- Google Fonts for typography
- The open-source community

## 📞 Support

If you have any questions or run into issues:

1. Check [SECURITY_SETUP.md](SECURITY_SETUP.md) for setup help
2. Open an [issue](https://github.com/KalyanThatavarti/canadian-ai-classifieds/issues)
3. Email: [your-email@example.com]

---

**Built with ❤️ using Firebase and modern web technologies**
