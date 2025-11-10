// File: constants.ts
// Path: /src/lib/constants.ts
// Application-wide constants

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  ULTIMATE: 'ultimate',
} as const

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS]

// Subscription Prices (monthly)
export const SUBSCRIPTION_PRICES = {
  [SUBSCRIPTION_TIERS.BASIC]: 0,
  [SUBSCRIPTION_TIERS.STANDARD]: 9.99,
  [SUBSCRIPTION_TIERS.PREMIUM]: 24.99,
  [SUBSCRIPTION_TIERS.ULTIMATE]: 99.99,
} as const

// Commission Rates by Tier
export const COMMISSION_RATES = {
  [SUBSCRIPTION_TIERS.BASIC]: 0.40, // 40%
  [SUBSCRIPTION_TIERS.STANDARD]: 0.30, // 30%
  [SUBSCRIPTION_TIERS.PREMIUM]: 0.20, // 20%
  [SUBSCRIPTION_TIERS.ULTIMATE]: 0.10, // 10%
} as const

// Product Upload Limits
export const PRODUCT_LIMITS = {
  [SUBSCRIPTION_TIERS.BASIC]: 3,
  [SUBSCRIPTION_TIERS.STANDARD]: 10,
  [SUBSCRIPTION_TIERS.PREMIUM]: 50,
  [SUBSCRIPTION_TIERS.ULTIMATE]: Infinity,
} as const

// Storage Limits (in MB)
export const STORAGE_LIMITS = {
  [SUBSCRIPTION_TIERS.BASIC]: 100,
  [SUBSCRIPTION_TIERS.STANDARD]: 500,
  [SUBSCRIPTION_TIERS.PREMIUM]: 5120, // 5GB
  [SUBSCRIPTION_TIERS.ULTIMATE]: 51200, // 50GB
} as const

// Featured Product Slots
export const FEATURED_SLOTS = {
  [SUBSCRIPTION_TIERS.BASIC]: 0,
  [SUBSCRIPTION_TIERS.STANDARD]: 1,
  [SUBSCRIPTION_TIERS.PREMIUM]: 3,
  [SUBSCRIPTION_TIERS.ULTIMATE]: 10,
} as const

// Experience Levels
export const EXPERIENCE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  PROFESSIONAL: 'professional',
  VETERAN: 'veteran',
} as const

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[keyof typeof EXPERIENCE_LEVELS]

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_IMAGE_SIZE_MB: 5,
  MAX_AUDIO_SIZE_MB: 100,
  MAX_VIDEO_SIZE_MB: 500,
  MAX_DOCUMENT_SIZE_MB: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/zip', 'application/x-rar-compressed'],
} as const

// Pagination
export const PAGINATION = {
  PRODUCTS_PER_PAGE: 20,
  SERVICES_PER_PAGE: 20,
  POSTS_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
  NOTIFICATIONS_PER_PAGE: 20,
  TRANSACTIONS_PER_PAGE: 50,
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FEED: '/feed',
  COMMUNITY: '/community',
  MARKETPLACE: '/marketplace',
  PRODUCTS: '/marketplace/products',
  SERVICES: '/marketplace/services',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  WALLET: '/wallet',
  ORDERS: '/orders',
  STORE: '/store',
} as const

// API Endpoints
export const API_ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  PRODUCTS_LIST: '/api/products',
  SERVICES_LIST: '/api/services',
  ORDERS_CREATE: '/api/orders/create',
  STRIPE_CHECKOUT: '/api/stripe/checkout',
  STRIPE_WEBHOOK: '/api/stripe/webhook',
} as const

// Social Media Links (placeholder - update with actual URLs)
export const SOCIAL_LINKS = {
  INSTAGRAM: 'https://instagram.com/producersavenue',
  TWITTER: 'https://twitter.com/producersavenue',
  YOUTUBE: 'https://youtube.com/@producersavenue',
  DISCORD: 'https://discord.gg/producersavenue',
  FACEBOOK: 'https://facebook.com/producersavenue',
} as const

// Support Email
export const SUPPORT_EMAIL = 'support@producersavenue.com'

// Platform Name
export const PLATFORM_NAME = 'Producers Avenue'

// Smart Link Domain
export const SMART_LINK_DOMAIN = 'rolink.me'

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MMM dd, yyyy',
  NUMERIC: 'MM/dd/yyyy',
  TIME: 'hh:mm a',
  DATETIME: 'MMMM dd, yyyy hh:mm a',
} as const

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  SMART_LINK: /^https?:\/\/(www\.)?rolink\.me\/.+$/i,
  URL: /^https?:\/\/.+$/i,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username must be 3-20 characters (letters, numbers, _ or -)',
  INVALID_PASSWORD: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
  INVALID_SMART_LINK: 'Only rolink.me Smart Links are allowed',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  UNAUTHORIZED: 'You must be logged in to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'Server error. Please try again later',
} as const