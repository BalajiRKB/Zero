# 💰 Channel Zero (MERN Stack)

## 📋 Overview

**Channel Zero** is a full-stack MERN application that helps groups (roommates, friends, travel buddies) manage shared expenses transparently and efficiently. Users can create dedicated channels for specific purposes like "Room Cooking", "Goa Trip", or "Monthly Groceries", invite others to join, track expenses, and maintain clear financial accountability within groups.

## ✨ Features

### Core Functionality
- 🏠 **Channel-based Organization:** Create separate channels for different activities, trips, or shared expenses
- 👥 **Flexible Member Management:** Invite members via email or shareable join links
- 💳 **Expense Tracking:** Add expenses with details (amount, description, date, payer)
- 📊 **Real-time Summaries:** View total expenses, individual balances, and contribution breakdowns
- 🔍 **Advanced Filtering:** Filter expenses by date range, member, category, or keywords
- 🔐 **Secure Authentication:** JWT-based user authentication and authorization

### Planned Features
- 📱 **Mobile Responsive Design**
- 📧 **Email Notifications** for new expenses and settlements
- 📈 **Expense Analytics** with charts and insights
- 💾 **Export Options** (CSV, PDF) for accounting
- 🗳️ **Group Polls** for expense approvals
- 📱 **Mobile App** (React Native)

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling (planned)
- **Axios** for API communication (planned)
- **React Router** for navigation (planned)

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM (planned)
- **JWT** for authentication (planned)
- **bcrypt** for password hashing (planned)
- **Joi** for input validation (planned)

### Development Tools
- **ESLint** with TypeScript support
- **Nodemon** for backend development
- **Git** for version control

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/shared-expenses-channels.git
cd shared-expenses-channels
```

2. **Backend Setup**
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:3000`

3. **Frontend Setup** (in a new terminal)
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`

### Environment Variables

Create `.env` files in both client and server directories:

**Server (.env)**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shared-expenses
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Client (.env)**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📁 Project Structure

```
shared-expenses-channels/
├── README.md
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Helper functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration files
│   ├── index.js
│   └── package.json
└── docs/                  # Documentation
```

## 🔄 How It Works

### User Journey
1. **Sign Up/Login:** Users create accounts with secure authentication
2. **Create Channel:** Start a new expense channel (e.g., "Room Groceries March 2025")
3. **Invite Members:** Add friends via email invites or shareable links
4. **Track Expenses:** Log purchases with who paid, amount, and description
5. **Monitor Balances:** View real-time summaries of who owes what
6. **Settle Up:** Clear balances and maintain transparency

### Example Use Cases
- **Roommate Expenses:** Monthly groceries, utilities, cleaning supplies
- **Travel Groups:** Trip accommodations, meals, activities, transportation
- **Event Planning:** Party supplies, venue costs, catering
- **Study Groups:** Books, materials, shared subscriptions

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
```

### Channel Endpoints
```
GET    /api/channels           # Get user's channels
POST   /api/channels           # Create new channel
GET    /api/channels/:id       # Get channel details
PUT    /api/channels/:id       # Update channel
DELETE /api/channels/:id       # Delete channel
POST   /api/channels/:id/join  # Join channel via invite
```

### Expense Endpoints
```
GET    /api/channels/:id/expenses     # Get channel expenses
POST   /api/channels/:id/expenses     # Add new expense
PUT    /api/expenses/:id              # Update expense
DELETE /api/expenses/:id              # Delete expense
```

## 🧪 Available Scripts

### Client Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Server Scripts
```bash
npm run dev        # Start with nodemon (development)
npm start          # Start production server
npm test           # Run tests (planned)
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the client: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure build and start commands

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Configure network access and users
3. Update connection string in environment variables

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configurations
- Write meaningful commit messages
- Add tests for new features

## 📈 Roadmap

### Phase 1: Core Features (Current)
- [x] Basic project setup
- [ ] User authentication
- [ ] Channel creation and management
- [ ] Expense CRUD operations
- [ ] Basic UI components

### Phase 2: Enhanced UX
- [ ] Responsive design
- [ ] Real-time updates (Socket.io)
- [ ] Advanced filtering and search
- [ ] Expense categories and tags
- [ ] Settlement suggestions

### Phase 3: Advanced Features
- [ ] Email notifications
- [ ] Export functionality
- [ ] Mobile app (React Native)
- [ ] Expense analytics and charts
- [ ] Multi-currency support

## 🐛 Known Issues

- Currently in active development
- Authentication system needs implementation
- Database models need to be created
- Frontend components need styling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Balaji R** - Full Stack Developer
- GitHub: [@BalajiRKB](https://github.com/balajirkb)
- LinkedIn: [Balaji RKB](https://linkedin.com/in/balaji-rkb)
- Email: balaji648balaji@gmail.com

## 🙏 Acknowledgments

- Inspired by real-world roommate and travel group expense management needs
- Built with modern MERN stack best practices
- Thanks to the open-source community for amazing tools and libraries

---

**⭐ If you find this project helpful, please give it a star!**

---

*Built with ❤️ for transparent group expense management*