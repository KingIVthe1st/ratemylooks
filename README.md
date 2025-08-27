# RateMyLooks.ai 🔥

An AI-powered attractiveness rating app that analyzes user photos to provide instant attractiveness scores (1-10) with personalized improvement recommendations. Built for viral growth on social media platforms.

![RateMyLooks.ai Screenshot](assets/screenshot.png)

## 🚀 Live Demo

- **Frontend**: [https://kingivthe1st.github.io/ratemylooks](https://kingivthe1st.github.io/ratemylooks)
- **API**: [https://ratemylooks-api.onrender.com](https://ratemylooks-api.onrender.com)

## ✨ Features

### Free Tier
- 📸 **Instant Photo Analysis** - Drag & drop or click to upload
- 🤖 **AI-Powered Rating** - Get your attractiveness score (1-10) in seconds
- 💬 **Basic Feedback** - Simple explanation of your rating
- 📱 **Social Sharing** - Share your score on TikTok, Instagram, Twitter

### Premium Tiers
- **$4.99 - Detailed Analysis**
  - Facial feature breakdown
  - Strengths and weaknesses analysis
  - Specific score factors

- **$9.99 - Improvement Suggestions**
  - AI-powered hairstyle recommendations
  - Skincare tips based on analysis
  - Fashion and style advice

- **$29.99 - Complete Glow Up Plan**
  - Full transformation roadmap
  - Product recommendations with affiliate links
  - Before/after projections
  - Personalized action plan

## 🏗️ Architecture

### Frontend (GitHub Pages)
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Glassmorphism, gradient backgrounds, smooth animations
- **Features**: PWA capabilities, responsive design, social sharing

### Backend (Render)
- **Tech Stack**: Node.js, Express.js
- **AI Integration**: OpenAI Vision API
- **Security**: Helmet, CORS, rate limiting
- **Payments**: Stripe (with test mode)

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- OpenAI API Key
- Git

### Backend Setup
```bash
# Clone repository
git clone https://github.com/kingivthe1st/ratemylooks.git
cd ratemylooks/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Open frontend/index.html in browser or use Live Server
# Or serve with Python
cd ../frontend
python3 -m http.server 8000
```

## 🧪 Test Mode

The app includes a comprehensive test mode for development:

- **Test Checkout**: No real payments required
- **Mock Payments**: Simulate premium unlocks
- **Test Card**: 4242 4242 4242 4242
- **API Testing**: Works without OpenAI credits

### Using Test Mode
1. Set `TEST_MODE=true` in `.env`
2. Use test card number for payments
3. Click "Skip Payment - Unlock Now" for instant testing

## 🌐 API Endpoints

### Analysis
- `POST /api/analyze` - Submit photo for analysis
- `POST /api/analyze/base64` - Analyze base64 image
- `GET /api/analyze/limits` - Get rate limit info

### Payments
- `POST /api/payment/create-checkout` - Create Stripe checkout
- `POST /api/payment/test-checkout` - Test mode checkout
- `POST /api/payment/verify-payment` - Verify payment status
- `GET /api/payment/pricing` - Get pricing tiers

### Health
- `GET /health` - Server health check

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository to Render
2. Add environment variables:
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY` (if using payments)
   - `NODE_ENV=production`
3. Deploy automatically on push to main

### Frontend (GitHub Pages)
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to main branch `/frontend` folder
4. Access at `https://yourusername.github.io/ratemylooks`

## 📊 Growth Strategy

### Viral Mechanics
- **Instant Gratification**: Quick AI analysis creates immediate engagement
- **Social Sharing**: Built-in share buttons for TikTok virality
- **Curiosity Loop**: "How hot are you?" hooks drive clicks
- **Comparison**: Friends challenge each other to get rated

### Marketing Channels
- TikTok trending hashtags (#RateMe #AIRating)
- Instagram story shares
- Reddit communities
- Influencer partnerships

## 🔒 Privacy & Ethics

- **No Data Storage**: Images deleted after processing
- **Privacy Focused**: GDPR/CCPA compliant
- **Ethical AI**: Diverse training data, bias mitigation
- **Age Verification**: 18+ requirement
- **Mental Health**: Positive, constructive feedback focus

## 🛡️ Security Features

- **Input Validation**: File size/type restrictions
- **Rate Limiting**: 100 requests/hour free tier
- **CORS Protection**: Whitelist-based origins
- **Helmet Security**: Standard security headers
- **Environment Secrets**: Secure API key handling

## 📈 Analytics & Monitoring

- **User Analytics**: Conversion funnels, retention rates
- **Performance**: Response times, error rates
- **Business Metrics**: Premium conversion, social shares
- **A/B Testing**: Multiple rating display formats

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kingivthe1st/ratemylooks/issues)
- **Email**: support@ratemylooks.ai

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video analysis support
- [ ] Dating app integrations
- [ ] Multi-language support
- [ ] AI style recommendations
- [ ] Before/after tracking
- [ ] Premium subscription model

---

**Built with ❤️ for viral growth and user engagement.**