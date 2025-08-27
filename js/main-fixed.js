// RateMyLooks.ai - Main JavaScript File - FIXED VERSION
// Premium viral-ready landing page with glassmorphism design
// ✅ INFINITE LOOP BUG FIXED

class RateMyLooksApp {
    constructor() {
        this.API_BASE_URL = 'https://ratemylooks-api.onrender.com';
        this.STRIPE_PUBLISHABLE_KEY = 'pk_live_51QQbn5HwfRkd7scfTdD4OaXCyatdCtujr37Zxs1bhd4riDG9AadZpSxlVC6SWxUs30mlR3XiI5i44TxfBkOLP0Nn00CMqIc62o';
        this.currentImage = null;
        this.isAnalyzing = false;
        
        // ✅ FIX #1: Add file input interaction guard
        this.fileInputInteractionInProgress = false;
        this.fileInputCooldownMs = 500; // Prevent rapid triggers
        this.lastFileInputTrigger = 0;
        
        this.initializeApp();
    }
    
    initializeApp() {
        // Wait for DOM to be fully loaded before setting up event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.initializeAnimations();
                this.startCarousel();
                this.startTestimonialRotation();
                this.updateStats();
                this.initializePremiumEffects();
                this.monitorPerformance();
                this.setupErrorHandling();
            });
        } else {
            this.setupEventListeners();
            this.initializeAnimations();
            this.startCarousel();
            this.startTestimonialRotation();
            this.updateStats();
            this.initializePremiumEffects();
            this.monitorPerformance();
            this.setupErrorHandling();
        }
    }
    
    // ✅ FIX #2: Completely rewritten file input trigger system
    triggerFileInput(fileInput) {
        // Prevent infinite loops with cooldown and guard
        const now = Date.now();
        if (this.fileInputInteractionInProgress || (now - this.lastFileInputTrigger) < this.fileInputCooldownMs) {
            console.log('🛑 File input trigger blocked - cooldown active or interaction in progress');
            return false;
        }

        this.fileInputInteractionInProgress = true;
        this.lastFileInputTrigger = now;

        console.log('🚀 Triggering file input with safety guards');
        
        try {
            // Direct click - no setTimeout, no complications
            fileInput.click();
            console.log('✅ File input clicked successfully');
            return true;
        } catch (error) {
            console.error('❌ File input click failed:', error);
            this.showToast('Unable to open file picker. Please try again.', 'error');
            return false;
        } finally {
            // Release guard after short delay
            setTimeout(() => {
                this.fileInputInteractionInProgress = false;
            }, this.fileInputCooldownMs);
        }
    }
    
    // ✅ FIX #3: Simplified and safe event listeners setup
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Upload functionality with enhanced element detection
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const removeBtn = document.getElementById('removeImage');
        const retryBtn = document.getElementById('retryBtn');
        const shareBtn = document.getElementById('shareBtn');
        
        // Debug element detection
        console.log('Upload elements found:', {
            uploadArea: !!uploadArea,
            fileInput: !!fileInput,
            uploadBtn: !!uploadBtn,
            removeBtn: !!removeBtn,
            retryBtn: !!retryBtn,
            shareBtn: !!shareBtn
        });
        
        // ✅ FIX #4: File input change with enhanced debugging
        if (fileInput) {
            // Initialize file input attributes
            fileInput.setAttribute('accept', 'image/*');
            fileInput.setAttribute('capture', 'environment'); // Allow camera on mobile

            // ⚠️ CRITICAL: Single, clean file input change handler
            fileInput.addEventListener('change', (e) => {
                console.log('📁 File input changed:', e.target.files);
                this.handleFileSelect(e);
            }, { once: false, passive: false });
        }
        
        // ✅ FIX #5: Upload area click handler - COMPLETELY REWRITTEN
        if (uploadArea && fileInput) {
            // Single, clean upload area click handler with proper guards
            const handleUploadAreaClick = (e) => {
                console.log('🖱️ Upload area clicked');
                
                // CRITICAL: Stop all event propagation immediately
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Only trigger if no file is currently selected
                if (this.currentImage) {
                    console.log('📸 File already selected, ignoring click');
                    return;
                }
                
                // Only trigger if not currently in analysis
                if (this.isAnalyzing) {
                    console.log('⏳ Analysis in progress, ignoring click');
                    return;
                }
                
                // Trigger file input with safety system
                this.triggerFileInput(fileInput);
            };

            // Attach single click listener
            uploadArea.addEventListener('click', handleUploadAreaClick, { 
                once: false, 
                passive: false,
                capture: false  // Use bubbling phase, not capture
            });
            
            // ✅ FIX #6: Enhanced mobile support with separate touch handler
            if ('ontouchstart' in window) {
                const handleUploadAreaTouch = (e) => {
                    console.log('👆 Upload area touched (touchend)');
                    
                    // Prevent default touch behavior and event propagation
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    // Same guards as click handler
                    if (this.currentImage || this.isAnalyzing) {
                        return;
                    }
                    
                    // Trigger file input with safety system
                    this.triggerFileInput(fileInput);
                };

                uploadArea.addEventListener('touchend', handleUploadAreaTouch, { 
                    once: false, 
                    passive: false,
                    capture: false
                });
            }
        }
        
        // ✅ FIX #7: Drag and drop handlers
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }
        
        // Button interactions - Enhanced with debugging
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                console.log('🚀 Upload button clicked!', {
                    disabled: uploadBtn.disabled,
                    currentImage: !!this.currentImage,
                    isAnalyzing: this.isAnalyzing
                });
                
                if (!uploadBtn.disabled && this.currentImage && !this.isAnalyzing) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.analyzeImage();
                } else {
                    console.warn('Upload button click ignored - button disabled, no image, or already analyzing');
                }
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeImage());
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.resetToUpload());
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareResults());
        }
        
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
        
        // ✅ FIX #8: Enhanced keyboard accessibility with guards
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.upload-area')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Same guards as click handlers
                if (this.currentImage || this.isAnalyzing) {
                    return;
                }
                
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    this.triggerFileInput(fileInput);
                }
            }
        });
    }
    
    // ✅ All other methods remain the same but with improved error handling
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('✅ File selected:', file.name, file.type, file.size);
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
        
        console.log('🖼️ Processing selected file:', file.name);
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
            console.log('✅ Upload button enabled successfully', {
                disabled: uploadBtn.disabled,
                hasEnabledClass: uploadBtn.classList.contains('enabled'),
                currentImage: !!this.currentImage
            });
        } else {
            console.error('❌ Upload button not found when trying to enable');
        }
    }
    
    removeImage() {
        console.log('🗑️ Removing image');
        this.currentImage = null;
        const uploadArea = document.getElementById('uploadArea');
        const uploadPreview = document.getElementById('uploadPreview');
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadArea) uploadArea.style.display = 'block';
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.classList.remove('enabled');
        }
        if (fileInput) fileInput.value = '';
    }
    
    async analyzeImage() {
        if (!this.currentImage || this.isAnalyzing) {
            console.log('❌ Cannot analyze - no image or already analyzing');
            return;
        }
        
        console.log('🧠 Starting image analysis');
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
            percentile: Math.floor(65 + Math.random() * 30), // 65-95th percentile
        };
    }
    
    displayResults(results) {
        // Hide upload section and show results
        const uploadSection = document.getElementById('upload');
        const resultsSection = document.getElementById('results');
        
        if (uploadSection) uploadSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'flex';
        
        // Animate score counter
        this.animateScore(results.score);
        
        // Update score label
        const scoreLabel = document.getElementById('scoreLabel');
        if (scoreLabel) {
            scoreLabel.textContent = results.label;
        }
        
        // Populate results details with basic info
        const resultsDetails = document.getElementById('resultsDetails');
        if (resultsDetails) {
            const htmlContent = `
                <div class="result-section">
                    <h4 style="color: #10b981; margin-bottom: 1rem;">✅ Your Best Features</h4>
                    <div class="features-grid" style="display: grid; gap: 0.75rem;">
                        ${results.positiveTraits.map(trait => 
                            `<div class="feature-item" style="background: rgba(16, 185, 129, 0.1); padding: 0.75rem; border-radius: 8px; border-left: 3px solid #10b981;">
                                <span style="color: rgba(255,255,255,0.9); font-weight: 500;">${trait}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                <div class="result-section" style="margin-top: 2rem; text-align: center;">
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 0.5rem;">
                            📊 You scored higher than ${results.percentile}% of people analyzed
                        </p>
                        <div style="background: linear-gradient(45deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; font-size: 1.1rem;">
                            Want more detailed analysis? Try again with different photos!
                        </div>
                    </div>
                </div>
            `;
            resultsDetails.innerHTML = htmlContent;
        }
        
        // Scroll to results with smooth animation
        setTimeout(() => {
            resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
        
        // Hide loading state
        this.hideLoadingState();
    }

    animateScore(targetScore) {
        const scoreElement = document.getElementById('scoreNumber');
        if (!scoreElement) return;
        
        let currentScore = 0;
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
        console.log('🔄 Resetting to upload');
        const uploadSection = document.getElementById('upload');
        const resultsSection = document.getElementById('results');
        
        if (resultsSection) resultsSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'flex';
        
        this.removeImage();
        
        // Scroll back to upload
        uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    shareResults() {
        const scoreElement = document.getElementById('scoreNumber');
        const score = scoreElement?.textContent || '0.0';
        
        const shareData = {
            title: 'RateMyLooks.ai - My Attractiveness Score',
            text: `I scored ${score}/10 on RateMyLooks.ai! 🔥 How hot are you? Find out now!`,
            url: 'https://kingivthe1st.github.io/ratemylooks/'
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
    
    // Initialize premium effects
    initializePremiumEffects() {
        this.initializeIntersectionObserver();
        this.optimizeForHighRefreshRate();
    }
    
    initializeIntersectionObserver() {
        const observerOptions = {
            threshold: [0, 0.1, 0.5, 1],
            rootMargin: '0px 0px -10% 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const ratio = entry.intersectionRatio;
                
                if (ratio > 0.1) {
                    element.classList.add('animate-in');
                    
                    // Add staggered animation for child elements
                    const children = element.querySelectorAll('.step, .trust-stat, .feature');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);
        
        // Observe sophisticated elements
        document.querySelectorAll(
            '.hero-container, .upload-card, .results-card, .examples-section, ' +
            '.how-it-works, .trust-section, .cta-section'
        ).forEach(el => observer.observe(el));
    }
    
    optimizeForHighRefreshRate() {
        // Optimize for 120Hz displays
        if (window.screen && window.screen.refreshRate > 60) {
            document.documentElement.style.setProperty('--transition-micro', '0.08s cubic-bezier(0.4, 0, 0.2, 1)');
            document.documentElement.style.setProperty('--transition-swift', '0.12s cubic-bezier(0.4, 0, 0.2, 1)');
        }
    }
    
    // Carousel functionality
    startCarousel() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('.carousel-item').length;
        
        // Auto-advance every 5 seconds
        if (this.totalSlides > 1) {
            setInterval(() => {
                this.nextSlide();
            }, 5000);
        }
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
        });
    }
    
    // Error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rateMyLooksApp = new RateMyLooksApp();
    console.log('✅ RateMyLooks app initialized successfully - INFINITE LOOP BUG FIXED');
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RateMyLooksApp;
}