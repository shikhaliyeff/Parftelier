# Environment Configuration Guide

## Overview

This document describes the environment configuration for the ScentSage Perfume Recommender application.

## Environment Files

### `.env` (Production/Development)
- **Location**: Project root
- **Status**: ✅ Present and configured
- **Git Status**: Ignored (✅ Correct - contains sensitive data)
- **Purpose**: Contains actual environment variables for the application

### `.env.example` (Template)
- **Status**: ❌ Missing (blocked by global ignore)
- **Purpose**: Template file showing required environment variables
- **Note**: Should be created manually if needed

## Required Environment Variables

### Database Configuration
| Variable | Value | Status | Notes |
|----------|-------|--------|-------|
| `DB_HOST` | `localhost` | ✅ Set | PostgreSQL host |
| `DB_PORT` | `5432` | ✅ Set | PostgreSQL port |
| `DB_NAME` | `perfume_recommender` | ✅ Set | Database name |
| `DB_USER` | `shikhaliyeff` | ✅ Set | Database user |
| `DB_PASSWORD` | (empty) | ⚠️ Optional | Not required for local auth |

### JWT Authentication
| Variable | Value | Status | Notes |
|----------|-------|--------|-------|
| `JWT_SECRET` | (secret) | ✅ Set | 32+ character secret key |
| `JWT_EXPIRES_IN` | `7d` | ✅ Set | Token expiration time |

### OpenAI API
| Variable | Value | Status | Notes |
|----------|-------|--------|-------|
| `OPENAI_API_KEY` | (secret) | ✅ Set | OpenAI API key for AI features |

### Server Configuration
| Variable | Value | Status | Notes |
|----------|-------|--------|-------|
| `PORT` | `5000` | ✅ Set | Backend server port |
| `NODE_ENV` | `development` | ✅ Set | Environment mode |

### Rate Limiting
| Variable | Value | Status | Notes |
|----------|-------|--------|-------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | ✅ Set | 15 minutes in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | ✅ Set | Max requests per window |

### Frontend (Optional)
| Variable | Value | Status | Notes |
|----------|-------|--------|-------|
| `REACT_APP_API_URL` | (not set) | ⚠️ Optional | Uses proxy in development |

## Environment Loading

### Backend (Node.js)
- **Method**: `require('dotenv').config()` in `server/index.js`
- **Status**: ✅ Working correctly
- **Location**: Called at the top of the main server file

### Frontend (React)
- **Method**: React environment variables (REACT_APP_*)
- **Status**: ✅ Working correctly
- **Proxy**: Configured in `client/package.json` for development

## Verification Tools

### Quick Check
```bash
npm run check-env
```
- Basic environment variable check
- Shows which variables are loaded

### Comprehensive Verification
```bash
npm run verify
```
- Full system verification
- Tests database, backend, frontend, and proxy
- Provides detailed status report

## Database Configuration

### PostgreSQL Setup
- **Host**: localhost
- **Port**: 5432
- **Database**: perfume_recommender
- **User**: shikhaliyeff
- **Authentication**: Local (no password required)
- **Status**: ✅ Working correctly

### Connection Test
```bash
psql -h localhost -p 5432 -U shikhaliyeff -d perfume_recommender -c "SELECT version();"
```

## API Configuration

### Backend API
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Status**: ✅ Working correctly

### Frontend Proxy
- **Development**: http://localhost:3000/api/* → http://localhost:5000/api/*
- **Configuration**: `client/package.json` proxy setting
- **Status**: ✅ Working correctly

## Security Considerations

### Environment Variables
- ✅ `.env` is in `.gitignore`
- ✅ Sensitive variables (passwords, secrets) are properly masked
- ✅ JWT secret is 32+ characters
- ✅ OpenAI API key is properly secured

### Database Security
- ✅ Local authentication (no password required for development)
- ✅ Connection pooling configured
- ✅ Error handling implemented

### API Security
- ✅ Rate limiting enabled
- ✅ CORS configured for development
- ✅ Helmet security headers
- ✅ JWT authentication

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify database exists

2. **Environment Variables Not Loading**
   - Ensure `.env` file exists in project root
   - Check file permissions
   - Verify `dotenv.config()` is called

3. **Frontend Can't Reach Backend**
   - Check if backend is running on port 5000
   - Verify proxy configuration in `client/package.json`
   - Check CORS settings

4. **OpenAI API Errors**
   - Verify `OPENAI_API_KEY` is set correctly
   - Check API key permissions
   - Monitor rate limits

### Verification Commands

```bash
# Check environment variables
npm run check-env

# Full system verification
npm run verify

# Test database connection
psql -h localhost -p 5432 -U shikhaliyeff -d perfume_recommender

# Test backend health
curl http://localhost:5000/health

# Test frontend proxy
curl http://localhost:3000/api/profile/onboarding-questions
```

## Production Considerations

### Environment Variables
- Use strong, unique values for all secrets
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Use environment-specific database credentials

### Security
- Enable HTTPS
- Configure proper CORS for production domains
- Use strong JWT secrets
- Implement proper rate limiting
- Set up database with password authentication

### Monitoring
- Set up logging
- Monitor API usage
- Track database performance
- Monitor OpenAI API usage

## Current Status

✅ **All systems operational**
- Environment variables properly configured
- Database connection working
- Backend API responding
- Frontend loading correctly
- API proxy functioning
- All verification tests passing

The application is ready for development and testing.
