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

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

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

app.use(function (req, res) {
  return res.status(404).render('error')
})

if (process.env.NODE_ENV === 'production') {
  require('./jobs')
}
module.exports = app
