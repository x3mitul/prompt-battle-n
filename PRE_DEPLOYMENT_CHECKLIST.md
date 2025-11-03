# 🚀 Pre-Deployment Checklist

Use this checklist before deploying to production.

## ✅ Code Quality

- [x] TypeScript strict mode enabled
- [x] No TypeScript compilation errors
- [x] Production build successful
- [x] All unused imports removed
- [x] Code optimized and minified

## ✅ Security

- [x] All API keys stored in environment variables
- [x] `.env` files in `.gitignore`
- [x] No sensitive data in frontend code
- [x] Security headers configured (X-Frame-Options, CSP, etc.)
- [x] CORS properly configured with specific origins

## ✅ Environment Variables

### Frontend (.env)

- [ ] `VITE_BACKEND_URL` - Set to production backend URL

### Backend (server/.env)

- [ ] `GEMINI_API_KEY` - Valid Google Gemini API key
- [ ] `STABILITY_API_KEY` - Valid Stability AI API key with credits
- [ ] `PORT` - Server port (default: 3001)
- [ ] `FRONTEND_URL` - Production frontend URL for CORS

## ✅ Configuration Files

- [x] `vercel.json` - Frontend deployment config
- [x] `server/railway.toml` - Backend deployment config
- [x] `package.json` - Dependencies and scripts correct
- [x] `vite.config.ts` - Build optimization configured

## ✅ API Keys & Credits

- [ ] Stability AI account has sufficient credits ($0.012 per image)
- [ ] Google Gemini API key is active and has quota
- [ ] API keys tested locally

## ✅ Testing

- [ ] Local development servers working (backend + frontend)
- [ ] Multiplayer game tested locally
- [ ] Solo arena AI evaluation working
- [ ] Image generation working
- [ ] WebSocket connection stable
- [ ] All routes accessible

## ✅ Documentation

- [x] DEPLOYMENT.md - Complete deployment guide
- [x] README.md - Project overview and setup
- [x] .env.example files - Template for environment variables

## ✅ Performance

- [x] Code splitting implemented
- [x] Lazy loading for routes
- [x] Compression enabled on backend
- [x] Socket.IO optimized
- [ ] Production build tested

## 📋 Deployment Steps

1. **Backend (Railway)**

   ```bash
   # Ensure server/.env has all API keys
   # Push code to GitHub
   # Deploy to Railway from GitHub
   # Set environment variables in Railway dashboard
   # Copy Railway URL
   ```

2. **Frontend (Vercel)**

   ```bash
   # Set VITE_BACKEND_URL to Railway URL
   # Push code to GitHub
   # Deploy to Vercel from GitHub
   # Set environment variables in Vercel dashboard
   ```

3. **Update CORS**

   ```bash
   # Update FRONTEND_URL in Railway to Vercel URL
   # Railway will auto-redeploy
   ```

4. **Verify**
   ```bash
   # Test backend health: https://your-railway-url/health
   # Test frontend: https://your-vercel-url
   # Test WebSocket connection in browser console
   # Test multiplayer game
   # Test image generation
   ```

## 🔍 Common Issues

### WebSocket Connection Failed

- Check `VITE_BACKEND_URL` in Vercel
- Verify `FRONTEND_URL` in Railway
- Check CORS configuration in server.js

### Images Not Generating

- Verify Stability AI API key
- Check account credits balance
- Review Railway logs for API errors

### AI Evaluation Not Working

- Verify Gemini API key
- Check API quota limits
- Review Railway logs

## 📊 Monitoring

After deployment, monitor:

- Railway logs for backend errors
- Vercel logs for build/runtime issues
- API usage and costs
- WebSocket connection stability
- Error rates

## 💰 Cost Tracking

- **Railway**: ~$0-5/month (hobby tier)
- **Vercel**: Free tier sufficient
- **Stability AI**: ~$0.012 per image
- **Gemini**: Free tier (60 req/min)

---

**Ready to deploy?** Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide!
