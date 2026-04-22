require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

const apolloServer = require('./schema')

const app = express()

// İzin verilen adresler
const allowedOrigins = [
  'https://ana-manga-siten.com',
  'https://admin-studio-siten.com',
  'https://mangacephesi.com',
  'https://www.mangacephesi.com',
  'http://localhost:3000',
  'http://localhost:3001', // Admin Studio
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://192.168.1.101:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS tarafindan engellendi'));
    }
  },
  credentials: true
};

// 1. App middleware'inden ÖNCE cors ekle
app.use(cors(corsOptions))

// 2. Apollo Server'a aynı CORS ayarlarını ver
apolloServer.applyMiddleware({
  app,
  cors: corsOptions
})

//  apply to all requests
// app.use(limiter)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(cookieParser())
// app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/upload', express.static(path.join(__dirname, 'public/upload')))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const homeRouter = require('./routes/index')
const storyRouter = require('./routes/story')
const categoryRouter = require('./routes/category')
const aboutRoutes = require('./routes/about')

const uploadRoutes = require('./routes/upload')
const siteMapRoutes = require('./routes/sitemap')

app.use('/sitemap', siteMapRoutes)

const sideBar = require('./utilities/sidebar')
const authRoutes = require('./utilities/auth')

app.use(sideBar)
app.use(authRoutes)

app.use(uploadRoutes)

app.use(homeRouter)
app.use(storyRouter)
app.use(categoryRouter)
app.use(aboutRoutes)
app.use('/settings', require('./routes/settings'))
app.use('/api/comments', require('./routes/comment'))
app.use('/api/reactions', require('./routes/reaction'))
app.use('/api/announcements', require('./routes/announcement'))

// Admin sayfaları
app.get('/admin/announcements', async (req, res) => {
  if (!res.locals.user || res.locals.user.role !== 'admin') {
    return res.redirect('/')
  }
  const Announcement = require('./models/Announcement')
  const announcements = await Announcement.find().sort({ createdAt: -1 }).lean()
  res.render('admin-announcements', { announcements })
})

app.use(function (req, res) {
  return res.status(404).render('error')
})

if (process.env.NODE_ENV === 'production') {
  require('./jobs')
}

// Global Error Handler for Express
app.use(function (err, req, res, next) {
  console.error('[FATAL ERROR] Express Middleware:', err);
  res.status(500).json({
    message: 'Sunucu tarafında beklenmedik bir hata oluştu.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Process-level event listeners for better debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: Send this to a logging service
});

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  // Give the server time to log/cleanup before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = app
