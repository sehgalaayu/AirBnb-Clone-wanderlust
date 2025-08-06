# 🏠 Wanderlust - Airbnb Clone

A full-stack web application inspired by Airbnb, built with modern web technologies. Wanderlust allows users to browse, create, and manage property listings with user-generated reviews and ratings.

## 📸 Screenshots

### Home Page
![Home Page](public/home-page.jpg)

### New Listing Page
![New Listing Page](public/new-listing.jpg)

### Review Page
![Review Page](public/review-page.jpg)

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure authentication system with JWT tokens
- **Session Management**: Persistent sessions with MongoDB store
- **Password Security**: Bcrypt hashing for password protection
- **User Profiles**: Individual user accounts with personalized experiences

### 🏘️ Listing Management
- **Browse Listings**: View all available property listings
- **Detailed Views**: Comprehensive listing pages with images and descriptions
- **CRUD Operations**: Create, read, update, and delete listings
- **Image Upload**: Cloudinary integration for image storage
- **Location Services**: Geographic coordinates for map functionality
- **Search & Filter**: Find listings by location, price, and other criteria

### ⭐ Review System
- **User Reviews**: Leave detailed reviews and ratings for listings
- **Rating System**: Star-based rating system with visual feedback
- **Review Management**: Edit and delete your own reviews
- **Aggregated Ratings**: Average ratings displayed on listing pages

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Modern UI**: Clean, intuitive interface inspired by Airbnb
- **Flash Messages**: Real-time feedback for user actions
- **Error Handling**: Comprehensive error pages and user-friendly messages

### 🔧 Technical Features
- **RESTful API**: Well-structured API endpoints
- **Database Integration**: MongoDB with Mongoose ODM
- **File Upload**: Multer middleware for image handling
- **Security**: CSRF protection, secure cookies, and input validation
- **Performance**: Optimized database queries and caching

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + Express Sessions
- **File Upload**: Multer + Cloudinary
- **Validation**: Zod schema validation
- **Security**: bcryptjs for password hashing

### Frontend
- **Template Engine**: EJS with ejs-mate layouts
- **Styling**: Bootstrap 5 + Custom CSS
- **Icons**: Font Awesome (via Bootstrap)
- **JavaScript**: Vanilla JS with modern ES6+ features

### Development & Deployment
- **Environment**: dotenv for configuration management
- **Session Store**: connect-mongo for session persistence
- **Error Handling**: Custom ExpressError class
- **Deployment**: Render.com ready with environment variables

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for cloning the repository)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sehgalaayu/AirBnb-Clone-wanderlust.git
cd AirBnb-Clone-wanderlust
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGO_URL=mongodb://127.0.0.1:27017/wanderlust

# Security Secrets
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Environment
NODE_ENV=development
PORT=8080
```

### 4. Database Setup
Ensure MongoDB is running on your local machine:
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or start MongoDB manually
mongod
```

### 5. Initialize Database (Optional)
Run the database initialization script to populate with sample data:
```bash
node init-database.js
```

### 6. Start the Application

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at [http://localhost:8080](http://localhost:8080)

## 📁 Project Structure

```
AirBnb-Clone-wanderlust/
├── 📁 controllers/          # Business logic handlers
│   ├── listingController.js # Listing CRUD operations
│   ├── reviewController.js  # Review management
│   └── userController.js    # User authentication
├── 📁 models/              # Database schemas
│   ├── listing.js          # Listing model with reviews
│   ├── reviews.js          # Review model
│   └── user.js             # User model
├── 📁 routes/              # Express route definitions
│   ├── listing.js          # Listing routes
│   ├── reviews.js          # Review routes
│   └── user.js             # User authentication routes
├── 📁 views/               # EJS templates
│   ├── 📁 auth/           # Authentication pages
│   ├── 📁 includes/       # Reusable components
│   ├── 📁 layouts/        # Template layouts
│   └── 📁 listings/       # Listing pages
├── 📁 public/             # Static assets
│   ├── 📁 css/           # Stylesheets
│   ├── 📁 js/            # Client-side JavaScript
│   └── 📁 images/        # Application images
├── 📁 utils/              # Utility functions
│   ├── ExpressError.js    # Custom error handling
│   └── wrapAsync.js       # Async error wrapper
├── 📁 init/               # Database initialization
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication Routes
- `GET /user/signup` - User registration page
- `POST /user/signup` - Create new user account
- `GET /user/login` - User login page
- `POST /user/login` - Authenticate user
- `GET /user/logout` - Logout user

### Listing Routes
- `GET /listings` - Display all listings
- `GET /listings/new` - Create new listing form
- `POST /listings` - Create new listing
- `GET /listings/:id` - Show specific listing
- `GET /listings/:id/edit` - Edit listing form
- `PUT /listings/:id` - Update listing
- `DELETE /listings/:id` - Delete listing

### Review Routes
- `POST /listings/:id/reviews` - Create new review
- `DELETE /reviews/:reviewId` - Delete review

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

### Listing Model
```javascript
{
  title: String (required),
  description: String,
  image: {
    filename: String,
    url: String (default: placeholder)
  },
  price: Number,
  location: String,
  country: String,
  geometry: {
    type: String (enum: 'Point'),
    coordinates: [Number]
  },
  reviews: [ObjectId (ref: 'Review')],
  owner: ObjectId (ref: 'User', required)
}
```

### Review Model
```javascript
{
  comment: String (required),
  rating: Number (required, min: 1, max: 5),
  createdAt: Date,
  author: ObjectId (ref: 'User', required)
}
```

## 🚀 Deployment

### Render.com Deployment

1. **Connect Repository**: Link your GitHub repository to Render
2. **Configure Service**:
   - **Name**: wanderlust-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**: Set all required environment variables
4. **Deploy**: Click "Create Web Service"

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Environment Variables for Production
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/wanderlust
SESSION_SECRET=your-production-session-secret
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

## 🧪 Testing

### Manual Testing Routes
- `GET /test-flash` - Test flash message functionality
- `GET /debug` - Debug environment and session information
- `GET /debug-auth` - Debug authentication status

### Running Tests
```bash
npm test
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Session Security**: HttpOnly cookies with secure settings
- **Input Validation**: Zod schema validation for all inputs
- **CSRF Protection**: Built-in Express security middleware
- **XSS Prevention**: EJS auto-escaping and input sanitization

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `brew services start mongodb-community`
   - Check connection string in `.env` file
   - Verify MongoDB Atlas network access (if using cloud)

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:8080 | xargs kill -9`

3. **Module Not Found Errors**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Image Upload Issues**
   - Verify Cloudinary credentials in `.env`
   - Check file size limits
   - Ensure proper file format (jpg, png, etc.)

### Debug Routes
- Visit `/debug` to check environment configuration
- Visit `/debug-auth` to verify authentication status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is for educational purposes only and is not affiliated with Airbnb.

## 👨‍💻 Author

**Aayu Sehgal**
- GitHub: [@sehgalaayu](https://github.com/sehgalaayu)
- Project: [Wanderlust Airbnb Clone](https://github.com/sehgalaayu/AirBnb-Clone-wanderlust)

## 🙏 Acknowledgments

- **Airbnb** for inspiration
- **Unsplash** for placeholder images
- **Bootstrap** for UI components
- **MongoDB Atlas** for cloud database hosting
- **Render** for deployment platform

---

⭐ **Star this repository if you found it helpful!**
