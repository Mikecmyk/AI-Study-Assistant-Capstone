"""
Django settings for study_config project.
"""
import os
from pathlib import Path
from decouple import config # Used for reading .env locally and environment variables on Render
import dj_database_url # Used for parsing the DATABASE_URL connection string

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# --- Deployment Configuration (Production vs. Local) ---

# SECURITY WARNING: keep the secret key used in production secret!
# Updated with fallback for Render environment variables
SECRET_KEY = config('SECRET_KEY', default=os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-for-development-only'))

# Check environment variable for Debug status. Crucial for switching behavior.
DEBUG = config('DEBUG', default=os.environ.get('DEBUG', 'True') == 'True', cast=bool)

# ALLOWED_HOSTS configuration - Updated for Render
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS = [RENDER_EXTERNAL_HOSTNAME, '.onrender.com']
elif DEBUG:
    # Local development hosts
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']
else:
    # Production on Render and any custom domains
    ALLOWED_HOSTS = ['.onrender.com']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework.authtoken',
    'study_core',
    'users',
]

# --- WhiteNoise Static File Setup & Security Middleware ---
# WhiteNoise handles static file serving in production on Render.
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Required for React communication
    'django.middleware.security.SecurityMiddleware',
    # ADD WhiteNoise IMMEDIATELY AFTER SecurityMiddleware
    'whitenoise.middleware.WhiteNoiseMiddleware', 

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',

    # Ensure Auth is BEFORE CSRF
    'django.contrib.auth.middleware.AuthenticationMiddleware', 
    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'study_config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # ✅ REMOVED React template directory
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'study_config.wsgi.application'


# ------------------------------------
# | DATABASE Configuration (Switching) |
# ------------------------------------
# Use SQLite for local development (if DEBUG=True) or PostgreSQL in production.

if DEBUG and not os.environ.get('DATABASE_URL'):
    # Local SQLite database
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Production PostgreSQL database - reads connection string from DATABASE_URL env var
    # conn_max_age is good for connection pooling on the service
    DATABASES = {
        'default': dj_database_url.config(
            default=config('DATABASE_URL', default=os.environ.get('DATABASE_URL')),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# --- Static files (CSS, JavaScript, Images) ---
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
# FIXED: STATIC_ROOT should always be set (this is where collectstatic puts files)
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ✅ REMOVED React static files - backend only serves its own static files
# STATICFILES_DIRS = [
#     BASE_DIR / 'frontend/build/static',  # ❌ REMOVED
# ]

if not DEBUG:
    # Configure WhiteNoise storage backend with compression and versioning
    STORAGES = {
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- CORS (Cross-Origin Resource Sharing) Configuration ---
CORS_ALLOW_ALL_ORIGINS = False # Good practice: explicitly list allowed origins

# Get the production front-end URL from environment variables
# Fallback to local for development - UPDATED WITH PLACEHOLDER
FRONTEND_URL = config('FRONTEND_URL', default=os.environ.get('FRONTEND_URL', 'http://localhost:3000'))

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", # Local React Dev Server
    "http://127.0.0.1:3000",
    "http://localhost:5173", # Vite dev server
    "http://127.0.0.1:5173",
    FRONTEND_URL,           # Production Render URL
    "https://ai-study-assistant-frontend.onrender.com",  # Add this explicitly
    "https://ai-study-assistant-capstone-2.onrender.com",  # ✅ ADD YOUR FRONTEND URL HERE
]

# Add the FRONTEND_URL to CSRF trusted origins if it exists
csrf_trusted_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    'https://*.onrender.com',
    "https://ai-study-assistant-frontend.onrender.com",  # Add this explicitly
    "https://ai-study-assistant-capstone-2.onrender.com",  # ✅ ADD YOUR FRONTEND URL HERE
]

if FRONTEND_URL:
    csrf_trusted_origins.append(FRONTEND_URL)

CSRF_TRUSTED_ORIGINS = csrf_trusted_origins

CORS_ALLOW_CREDENTIALS = True


# --- Django REST Framework Configuration ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
}

# --- AI Key ---
# Updated with proper fallbacks for Render
GEMINI_API_KEY = config('GEMINI_API_KEY', default=os.environ.get('GEMINI_API_KEY', ''))