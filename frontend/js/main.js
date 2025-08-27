// RateMyLooks.ai - Main JavaScript File
// Premium viral-ready landing page with glassmorphism design

class RateMyLooksApp {
    constructor() {
        this.API_BASE_URL = 'https://ratemylooks-api.onrender.com';
        this.currentImage = null;
        this.isAnalyzing = false;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.startCarousel();
        this.startTestimonialRotation();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Upload functionality
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const removeBtn = document.getElementById('removeImage');
        const retryBtn = document.getElementById('retryBtn');
        const shareBtn = document.getElementById('shareBtn');
        
        // File input change
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Upload area interactions
        uploadArea?.addEventListener('click', () => fileInput?.click());
        uploadArea?.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea?.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Button interactions
        uploadBtn?.addEventListener('click', () => this.analyzeImage());
        removeBtn?.addEventListener('click', () => this.removeImage());
        retryBtn?.addEventListener('click', () => this.resetToUpload());
        shareBtn?.addEventListener('click', () => this.shareResults());
        
        // Smooth scrolling for nav links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });
        
        // Carousel controls
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Dynamic nav background
        window.addEventListener('scroll', () => this.handleNavScroll());
        
        // Prevent form submission on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.closest('.upload-area')) {
                e.preventDefault();
                fileInput?.click();
            }
        });
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processSelectedFile(file);
        }
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const uploadArea = event.currentTarget;
        uploadArea.classList.add('drag-over');
    }
    
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        const uploadArea = event.currentTarget;
        uploadArea.classList.remove('drag-over');
    }
    
    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const uploadArea = event.currentTarget;
        uploadArea.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (this.isValidImageFile(file)) {
                this.processSelectedFile(file);
            } else {
                this.showToast('Please upload a valid image file (PNG, JPG, JPEG)', 'error');
            }
        }
    }
    
    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            this.showToast('Please upload a JPG, PNG, or WebP image', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showToast('Image must be less than 10MB', 'error');
            return false;
        }
        
        return true;
    }
    
    processSelectedFile(file) {
        if (!this.isValidImageFile(file)) return;
        
        this.currentImage = file;
        this.displayImagePreview(file);
        this.enableUploadButton();
        this.showToast('Image uploaded successfully! Click "Get My Rating" to analyze.', 'success');
    }
    
    displayImagePreview(file) {
        const reader = new FileReader();
        const uploadArea = document.getElementById('uploadArea');
        const uploadPreview = document.getElementById('uploadPreview');
        const previewImage = document.getElementById('previewImage');
        
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            uploadPreview.style.display = 'block';
            
            // Add fade-in animation
            uploadPreview.style.opacity = '0';
            uploadPreview.style.transform = 'scale(0.9)';
            
            requestAnimationFrame(() => {
                uploadPreview.style.transition = 'all 0.5s ease';
                uploadPreview.style.opacity = '1';
                uploadPreview.style.transform = 'scale(1)';
            });
        };
        
        reader.readAsDataURL(file);
    }
    
    enableUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.classList.add('enabled');
        }
    }
    
    removeImage() {
        this.currentImage = null;
        const uploadArea = document.getElementById('uploadArea');
        const uploadPreview = document.getElementById('uploadPreview');
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        
        uploadArea.style.display = 'block';
        uploadPreview.style.display = 'none';
        uploadBtn.disabled = true;
        uploadBtn.classList.remove('enabled');
        fileInput.value = '';
    }
    
    async analyzeImage() {
        if (!this.currentImage || this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.showLoadingState();
        
        try {
            // Simulate API call with realistic delay
            await this.simulateAnalysis();
            
            // For now, generate mock results
            const results = this.generateMockResults();
            this.displayResults(results);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showToast('Analysis failed. Please try again.', 'error');
            this.hideLoadingState();
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    showLoadingState() {
        const uploadBtn = document.getElementById('uploadBtn');
        const btnText = uploadBtn?.querySelector('.btn-text');
        const btnLoader = uploadBtn?.querySelector('.btn-loader');
        
        if (btnText && btnLoader) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'flex';
        }
        
        // Add loading class to body for additional effects
        document.body.classList.add('loading');
    }
    
    hideLoadingState() {
        const uploadBtn = document.getElementById('uploadBtn');
        const btnText = uploadBtn?.querySelector('.btn-text');
        const btnLoader = uploadBtn?.querySelector('.btn-loader');
        
        if (btnText && btnLoader) {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
        
        document.body.classList.remove('loading');
    }
    
    async simulateAnalysis() {
        // Simulate realistic API processing time
        const steps = [
            { message: 'Uploading image...', delay: 800 },
            { message: 'Detecting facial features...', delay: 1200 },
            { message: 'Analyzing symmetry...', delay: 1000 },
            { message: 'Calculating attractiveness score...', delay: 1500 },
            { message: 'Generating insights...', delay: 800 }
        ];
        
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            // Could update loading message here if desired
        }
    }
    
    generateMockResults() {
        // Generate realistic mock results
        const scores = [7.2, 7.8, 8.1, 6.9, 8.4, 7.5, 8.7, 6.8, 7.9, 8.2];
        const score = scores[Math.floor(Math.random() * scores.length)];
        
        const features = [
            'Facial symmetry', 'Eye alignment', 'Jaw structure', 'Skin quality',
            'Nose proportions', 'Lip fullness', 'Cheekbone prominence', 'Facial harmony'
        ];
        
        const positiveTraits = features.slice(0, 3 + Math.floor(Math.random() * 3));
        const improvements = features.slice(-2 - Math.floor(Math.random() * 2));
        
        const labels = {
            9: 'Absolutely Stunning! 🔥',
            8: 'Very Attractive! ✨',
            7: 'Quite Good Looking! 😊',
            6: 'Above Average! 👍',
            5: 'Average Beauty! 😐'
        };
        
        const scoreRange = Math.floor(score);
        const label = labels[scoreRange] || labels[5];
        
        return {
            score: score,
            label: label,
            positiveTraits: positiveTraits,
            improvements: improvements,
            percentile: Math.floor(65 + Math.random() * 30) // 65-95th percentile
        };
    }
    
    displayResults(results) {
        // Hide upload section and show results
        const uploadSection = document.getElementById('upload');
        const resultsSection = document.getElementById('results');
        
        uploadSection.style.display = 'none';
        resultsSection.style.display = 'flex';
        
        // Animate score counter
        this.animateScore(results.score);
        
        // Update score label
        const scoreLabel = document.getElementById('scoreLabel');
        if (scoreLabel) {
            scoreLabel.textContent = results.label;
        }
        
        // Populate results details
        const resultsDetails = document.getElementById('resultsDetails');
        if (resultsDetails) {
            resultsDetails.innerHTML = `
                <div class="result-item">
                    <h4 style="color: #10b981; margin-bottom: 0.5rem;">✅ Your Best Features:</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${results.positiveTraits.map(trait => 
                            `<li style="padding: 0.25rem 0; color: rgba(255,255,255,0.8);">• ${trait}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="result-item" style="margin-top: 1.5rem;">
                    <h4 style="color: #f59e0b; margin-bottom: 0.5rem;">💡 Enhancement Tips:</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${results.improvements.map(improvement => 
                            `<li style="padding: 0.25rem 0; color: rgba(255,255,255,0.8);">• Focus on ${improvement.toLowerCase()}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="result-item" style="margin-top: 1.5rem;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                        📊 You scored higher than ${results.percentile}% of people analyzed
                    </p>
                </div>
            `;
        }
        
        // Scroll to results with smooth animation
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
        
        // Hide loading state
        this.hideLoadingState();
    }
    
    animateScore(targetScore) {
        const scoreElement = document.getElementById('scoreNumber');
        if (!scoreElement) return;
        
        let currentScore = 0;
        const increment = targetScore / 60; // 60 frames for 1 second at 60fps
        const duration = 2000; // 2 seconds
        const frameRate = 60;
        const totalFrames = (duration / 1000) * frameRate;
        const scoreIncrement = targetScore / totalFrames;
        
        const animate = () => {
            currentScore += scoreIncrement;
            
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                scoreElement.textContent = currentScore.toFixed(1);
                return;
            }
            
            scoreElement.textContent = currentScore.toFixed(1);
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    resetToUpload() {
        const uploadSection = document.getElementById('upload');
        const resultsSection = document.getElementById('results');
        
        resultsSection.style.display = 'none';
        uploadSection.style.display = 'flex';
        
        this.removeImage();
        
        // Scroll back to upload
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    shareResults() {
        const scoreElement = document.getElementById('scoreNumber');
        const score = scoreElement?.textContent || '0.0';
        
        const shareData = {
            title: 'RateMyLooks.ai - My Attractiveness Score',
            text: `I scored ${score}/10 on RateMyLooks.ai! 🔥 How hot are you? Find out now!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => this.showToast('Thanks for sharing! 🎉', 'success'))
                .catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback to clipboard
            const shareText = `${shareData.text} ${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast('Results copied to clipboard! Share away! 📋', 'success');
            }).catch(() => {
                this.showToast('Unable to share. Try again later.', 'error');
            });
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = toast?.querySelector('.toast-message');
        const toastIcon = toast?.querySelector('.toast-icon');
        
        if (!toast || !toastMessage || !toastIcon) return;
        
        // Set icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toastIcon.textContent = icons[type] || icons.info;
        toastMessage.textContent = message;
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
    
    handleSmoothScroll(event) {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
    
    handleNavScroll() {
        const nav = document.querySelector('.nav');
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            nav?.classList.add('scrolled');
        } else {
            nav?.classList.remove('scrolled');
        }
    }
    
    // Carousel functionality
    startCarousel() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('.carousel-item').length;
        
        // Auto-advance every 5 seconds
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }
    
    updateCarousel() {
        const items = document.querySelectorAll('.carousel-item');
        const dots = document.querySelectorAll('.dot');
        
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentSlide);
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    // Testimonial rotation
    startTestimonialRotation() {
        const testimonials = document.querySelectorAll('.testimonial');
        if (testimonials.length <= 1) return;
        
        let currentTestimonial = 0;
        
        setInterval(() => {
            testimonials[currentTestimonial].classList.remove('active');
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].classList.add('active');
        }, 4000);
    }
    
    // Initialize scroll animations
    initializeAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.step, .celebrity-card, .trust-stat').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Dynamic stats counter
    updateStats() {
        const statsElements = document.querySelectorAll('.trust-number, .stat-number');
        
        statsElements.forEach(element => {
            const finalValue = element.textContent;
            const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
            
            if (!isNaN(numericValue) && numericValue > 0) {
                this.animateCounter(element, numericValue, finalValue);
            }
        });
    }
    
    animateCounter(element, targetValue, finalText) {
        let currentValue = 0;
        const increment = targetValue / 100;
        const suffix = finalText.replace(targetValue.toString(), '');
        
        const timer = setInterval(() => {
            currentValue += increment;
            
            if (currentValue >= targetValue) {
                element.textContent = finalText;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentValue) + suffix;
            }
        }, 30);
    }
    
    // Performance monitoring
    monitorPerformance() {
        // Monitor loading times
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
            
            // Track Core Web Vitals if available
            if ('web-vital' in window) {
                // Implementation would go here
            }
        });
    }
    
    // Error handling and analytics
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            // Could send to analytics service
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            // Could send to analytics service
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rateMyLooksApp = new RateMyLooksApp();
});

// Add additional CSS classes dynamically for enhanced animations
const addDynamicStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .nav.scrolled {
            background: rgba(15, 15, 35, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .upload-btn.enabled {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            box-shadow: 0 10px 30px rgba(250, 112, 154, 0.4);
            transform: translateY(-1px);
        }
        
        .loading .upload-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2s infinite;
            pointer-events: none;
        }
        
        @keyframes shimmer {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
            }
        }
        
        /* Enhanced mobile responsiveness */
        @media (max-width: 480px) {
            .upload-features {
                grid-template-columns: 1fr;
                text-align: center;
            }
            
            .hero-stats {
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
            }
            
            .trust-stats {
                grid-template-columns: 1fr;
            }
        }
        
        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
            .animate-in {
                animation: none;
                opacity: 1;
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);
};

// Apply dynamic styles
addDynamicStyles();

// PWA Service Worker Registration (if service worker exists)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RateMyLooksApp;
}