const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'RateMyLooks API is running' });
});

// Image analysis endpoint
app.post('/analyze-image', upload.single('image'), async (req, res) => {
    try {
        let base64Image;
        
        // Handle both file upload and base64 data
        if (req.file) {
            base64Image = req.file.buffer.toString('base64');
        } else if (req.body.image) {
            // Remove data URL prefix if present
            base64Image = req.body.image.replace(/^data:image\/[a-z]+;base64,/, '');
        } else {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            console.log('OpenAI API key not configured, returning mock response');
            return res.json({
                rating: 8.5,
                analysis: "This is a mock response since OpenAI API is not configured. You have great features and a warm smile! To get real AI analysis, please set up your OPENAI_API_KEY environment variable in Render.",
                confidence: 0.85
            });
        }

        // Strategic prompt for comprehensive image analysis
        const prompt = `You are an expert photo analyst providing constructive, confidence-building feedback. Analyze this person's photo comprehensively and provide:

1. OVERALL RATING (1-10): Give a fair, encouraging rating
2. FACIAL FEATURES: Comment on eyes, smile, facial structure, skin
3. STYLE & PRESENTATION: Clothing, grooming, overall aesthetic
4. PHOTO QUALITY: Lighting, angle, composition
5. CONFIDENCE BOOSTERS: Specific positive highlights
6. GENTLE IMPROVEMENTS: 2-3 actionable, kind suggestions
7. FINAL ENCOURAGEMENT: Personal, uplifting message

Be specific, honest but kind, and focus on helping them feel confident while providing genuinely helpful feedback. Make your response personal to what you actually see in their photo.`;

        // Call OpenAI Vision API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const analysis = response.data.choices[0].message.content;
        
        // Extract rating from analysis (look for number out of 10)
        const ratingMatch = analysis.match(/(?:rating|score).*?(\d+(?:\.\d+)?)/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 8.0;
        
        res.json({
            rating: rating,
            analysis: analysis,
            confidence: 0.95
        });

    } catch (error) {
        console.error('Error analyzing image:', error);
        
        // Return fallback response on error
        res.json({
            rating: 7.5,
            analysis: "I'm having trouble connecting to the AI service right now, but from what I can see, you have great features! Try again in a moment for a detailed analysis.",
            confidence: 0.5,
            error: true
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});