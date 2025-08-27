// RateMyLooks.ai - Main JavaScript File
// Premium viral-ready landing page with glassmorphism design

class RateMyLooksApp {
    constructor() {
        this.API_BASE_URL = 'https://ratemylooks-api.onrender.com';
        // TODO: Move to server-side configuration or environment variables
        // For production, this should be loaded from a secure endpoint
        // Browser-compatible environment variable handling - completely remove process reference
        this.STRIPE_PUBLISHABLE_KEY = 'pk_live_51QQbn5HwfRkd7scfTdD4OaXCyatdCtujr37Zxs1bhd4riDG9AadZpSxlVC6SWxUs30mlR3XiI5i44TxfBkOLP0Nn00CMqIc62o';
        this.currentImage = null;
        this.isAnalyzing = false;
        
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
    
    triggerFileInput(fileInput) {
        // Simple, direct file input trigger with proper safeguards
        console.log('🎯 Triggering file input (simplified)');
        
        // CRITICAL: Don't modify file input state right before clicking
        // The element needs to be stable for the click to work
        
        try {
            console.log('📝 File input properties before click:', {
                hidden: fileInput.hidden,
                disabled: fileInput.disabled,
                style: fileInput.style.cssText,
                type: fileInput.type,
                accept: fileInput.accept
            });
            
            // Direct click - most reliable when user gesture is preserved
            fileInput.click();
            console.log('✅ File input triggered successfully');
            return true;
        } catch (error) {
            console.error('❌ File input trigger failed:', error);
            this.showToast('Unable to open file selector. Please try refreshing the page.', 'error');
            return false;
        }
    }
    
    ensureFileInputSafeState(fileInput) {
        // Always ensure file input is in a safe, non-interfering state
        fileInput.style.position = 'absolute';
        fileInput.style.left = '-9999px';
        fileInput.style.top = '-9999px';
        fileInput.style.opacity = '0';
        fileInput.style.pointerEvents = 'none';
        fileInput.style.zIndex = '-9999';
        fileInput.style.width = '1px';
        fileInput.style.height = '1px';
        fileInput.style.visibility = 'hidden';
        fileInput.hidden = true;
        
        console.log('File input set to safe state with z-index -9999');
    }
    
    
    initializePremiumEffects() {
        // Initialize sophisticated visual enhancements
        this.initializeParallaxEffects();
        this.initializeIntersectionObserver();
        this.initializeMouseTrackingEffects();
        this.optimizeForHighRefreshRate();
    }
    
    initializeParallaxEffects() {
        // Subtle parallax for hero elements
        window.addEventListener('scroll', this.throttle(() => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-container, .bg-particles');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16)); // 60fps throttling
    }
    
    initializeIntersectionObserver() {
        // Enhanced intersection observer for sophisticated animations
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
    
    initializeMouseTrackingEffects() {
        // Sophisticated mouse tracking for premium feel
        document.addEventListener('mousemove', this.throttle((e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            // Calculate mouse position as percentage
            const xPercent = (clientX / innerWidth) * 2 - 1;
            const yPercent = (clientY / innerHeight) * 2 - 1;
            
            // Apply subtle transforms to glassmorphism elements
            const glassElements = document.querySelectorAll('.hero-container, .upload-card, .results-card');
            glassElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const elementCenterX = rect.left + rect.width / 2;
                const elementCenterY = rect.top + rect.height / 2;
                
                const deltaX = (clientX - elementCenterX) / rect.width;
                const deltaY = (clientY - elementCenterY) / rect.height;
                
                // Apply subtle 3D transform
                element.style.transform = `
                    perspective(1000px) 
                    rotateX(${deltaY * 2}deg) 
                    rotateY(${deltaX * 2}deg) 
                    translateZ(0)
                `;
            });
        }, 16));
    }
    
    optimizeForHighRefreshRate() {
        // Optimize for 120Hz displays
        if (window.screen && window.screen.refreshRate > 60) {
            document.documentElement.style.setProperty('--transition-micro', '0.08s cubic-bezier(0.4, 0, 0.2, 1)');
            document.documentElement.style.setProperty('--transition-swift', '0.12s cubic-bezier(0.4, 0, 0.2, 1)');
        }
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
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
        
        // File input change with enhanced debugging
        if (fileInput) {
            // CRITICAL: Initialize file input in safe state immediately
            this.ensureFileInputSafeState(fileInput);
            
            fileInput.addEventListener('change', (e) => {
                console.log('File input changed:', e.target.files);
                this.handleFileSelect(e);
            });
            
            // Ensure file input is properly configured for mobile
            fileInput.setAttribute('accept', 'image/*');
            fileInput.setAttribute('capture', 'environment'); // Allow camera on mobile
        }
        
        // COMPLETELY RESET EVENT HANDLERS - Clean slate approach
        if (uploadArea && fileInput) {
            // STEP 1: Remove ALL existing event listeners by cloning the element
            const cleanUploadArea = uploadArea.cloneNode(true);
            uploadArea.parentNode.replaceChild(cleanUploadArea, uploadArea);
            
            // Update reference to the clean element
            const newUploadArea = document.getElementById('uploadArea');
            
            // STEP 2: Simple, bulletproof single event handler
            let isProcessingClick = false; // Simple flag, no timestamps needed
            
            newUploadArea.addEventListener('click', (e) => {
                console.log('🎯 CLEAN upload area clicked');
                
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Simple checks in order
                if (isProcessingClick) {
                    console.log('❌ Already processing a click, ignoring');
                    return;
                }
                
                if (this.currentImage) {
                    console.log('❌ File already selected, ignoring');
                    return;
                }
                
                // Set flag and trigger
                isProcessingClick = true;
                console.log('✅ Processing upload click...');
                
                try {
                    fileInput.click();
                    console.log('✅ File input clicked successfully');
                } catch (error) {
                    console.error('❌ File input click failed:', error);
                }
                
                // Reset flag immediately
                setTimeout(() => {
                    isProcessingClick = false;
                    console.log('🔄 Click processing flag reset');
                }, 100);
            });
            
            // Simple mobile touch support  
            if ('ontouchstart' in window) {
                newUploadArea.addEventListener('touchend', (e) => {
                    console.log('📱 Touch end on upload area');
                    
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (isProcessingClick) {
                        console.log('❌ Touch ignored - already processing');
                        return;
                    }
                    
                    if (this.currentImage) {
                        console.log('❌ Touch ignored - file already selected');
                        return;
                    }
                    
                    isProcessingClick = true;
                    console.log('✅ Processing touch...');
                    
                    try {
                        fileInput.click();
                        console.log('✅ File input clicked via touch');
                    } catch (error) {
                        console.error('❌ Touch file input failed:', error);
                    }
                    
                    setTimeout(() => {
                        isProcessingClick = false;
                        console.log('🔄 Touch processing flag reset');
                    }, 100);
                }, { passive: false });
            }
            
            // Drag and drop support on clean element
            newUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            newUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            newUploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }
        
        // Button interactions - Enhanced with debugging
        uploadBtn?.addEventListener('click', (e) => {
            console.log('Upload button clicked!', {
                disabled: uploadBtn.disabled,
                currentImage: !!this.currentImage,
                isAnalyzing: this.isAnalyzing
            });
            
            if (!uploadBtn.disabled && this.currentImage) {
                e.preventDefault();
                e.stopPropagation();
                this.analyzeImage();
            } else {
                console.warn('Upload button click ignored - button disabled or no image');
            }
        });
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
        
        // Enhanced keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.upload-area')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                if (!this.currentImage) {
                    const now = Date.now();
                    if (this.fileInputInteractionInProgress) {
                        console.log('Keyboard trigger ignored - interaction in progress');
                        return;
                    }
                    
                    if (this.lastFileInputTrigger > 0 && (now - this.lastFileInputTrigger) < this.fileInputCooldownMs) {
                        console.log('Keyboard trigger ignored - cooldown active');
                        return;
                    }
                    
                    console.log('Keyboard trigger for file input');
                    this.fileInputInteractionInProgress = true;
                    
                    const success = this.triggerFileInput(fileInput);
                    
                    if (success) {
                        this.lastFileInputTrigger = now;
                    }
                    
                    setTimeout(() => {
                        this.fileInputInteractionInProgress = false;
                    }, 100);
                }
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
        
        // Enhanced mock data for detailed analysis
        const mockDetailedFeatures = {
            faceShape: 'Oval with balanced proportions',
            eyeShape: 'Almond-shaped with good symmetry',
            eyebrowShape: 'Well-defined arch with natural thickness',
            noseShape: 'Straight bridge with refined tip',
            lipShape: 'Balanced fullness with defined cupid\'s bow',
            jawlineDefinition: 'Clean definition with good angular structure',
            cheekboneStructure: 'Prominent cheekbones adding facial definition',
            skinTexture: 'Smooth complexion with healthy glow',
            hairTexture: 'Well-maintained with good volume and styling',
            overallHarmony: 'Features work together cohesively'
        };

        const mockSpecificSuggestions = {
            hairstyles: [
                'Try a layered cut to add dimension and frame your face shape',
                'A side-swept bang would complement your forehead proportions',
                'Consider highlights to add depth and brightness around your face'
            ],
            eyebrowStyling: [
                'Shape eyebrows with a subtle arch to enhance your eye shape',
                'Use a brow gel to keep hairs in place and add definition',
                'Consider professional threading for precise shaping'
            ],
            skincare: [
                'Use a vitamin C serum in the morning for added glow',
                'Incorporate a gentle exfoliant 2-3 times per week',
                'Apply SPF 30+ daily to maintain skin health'
            ],
            accessories: [
                'Cat-eye or rectangular frames would complement your face shape',
                'Statement earrings would draw attention to your strong jawline',
                'A delicate necklace would enhance your neckline'
            ],
            grooming: [
                'Regular eyebrow maintenance every 3-4 weeks',
                'Use a hydrating face mask weekly for skin brightness',
                'Keep facial hair well-trimmed and styled'
            ],
            styling: [
                'V-neck tops would flatter your face shape and neckline',
                'Colors in the blue and green family would enhance your complexion',
                'A blazer would add structure and professional appeal'
            ]
        };

        const mockActionableSteps = {
            immediate: [
                'Ensure your eyebrows are well-groomed and shaped',
                'Use a moisturizer with SPF for daily skin protection',
                'Try a new hairstyle that frames your face better'
            ],
            shortTerm: [
                'Book a professional haircut consultation',
                'Start a consistent skincare routine with quality products',
                'Experiment with accessories that complement your features'
            ],
            longTerm: [
                'Maintain regular grooming appointments for consistency',
                'Consider professional color consultation for wardrobe',
                'Develop a signature style that reflects your personality'
            ]
        };
        
        return {
            score: score,
            label: label,
            positiveTraits: positiveTraits,
            improvements: improvements,
            percentile: Math.floor(65 + Math.random() * 30), // 65-95th percentile
            detailedFeatures: mockDetailedFeatures,
            specificSuggestions: mockSpecificSuggestions,
            actionableSteps: mockActionableSteps
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
        if (resultsDetails && typeof DOMPurify !== 'undefined') {
            const htmlContent = `
                <div class="detailed-analysis">
                    <div class="result-section">
                        <h4 style="color: #10b981; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>✅</span> Your Best Features
                        </h4>
                        <div class="features-grid" style="display: grid; gap: 0.75rem;">
                            ${results.positiveTraits.map(trait => 
                                `<div class="feature-item" style="background: rgba(16, 185, 129, 0.1); padding: 0.75rem; border-radius: 8px; border-left: 3px solid #10b981;">
                                    <span style="color: rgba(255,255,255,0.9); font-weight: 500;">${trait}</span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>

                    <div class="result-section" style="margin-top: 2rem;">
                        <h4 style="color: #3b82f6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>🔍</span> Detailed Analysis
                        </h4>
                        <div class="analysis-details" style="background: rgba(59, 130, 246, 0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                            ${results.detailedFeatures ? Object.entries(results.detailedFeatures).map(([key, value]) => 
                                `<div style="margin-bottom: 0.5rem;">
                                    <strong style="color: #3b82f6; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').trim()}:</strong>
                                    <span style="color: rgba(255,255,255,0.8); margin-left: 0.5rem;">${value}</span>
                                </div>`
                            ).join('') : '<p style="color: rgba(255,255,255,0.7);">Detailed features analysis available in premium version.</p>'}
                        </div>
                    </div>

                    <div class="result-section" style="margin-top: 2rem;">
                        <h4 style="color: #f59e0b; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>💡</span> Specific Improvement Tips
                        </h4>
                        <div class="improvements-grid" style="display: grid; gap: 1rem;">
                            ${this.renderImprovementCategories(results.specificSuggestions || {})}
                        </div>
                    </div>

                    <div class="result-section" style="margin-top: 2rem;">
                        <h4 style="color: #8b5cf6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>📋</span> Action Plan
                        </h4>
                        <div class="action-plan" style="display: grid; gap: 1rem;">
                            ${this.renderActionPlan(results.actionableSteps || {})}
                        </div>
                    </div>

                    <div class="result-section" style="margin-top: 2rem; text-align: center;">
                        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 0.5rem;">
                                📊 You scored higher than ${results.percentile}% of people analyzed
                            </p>
                            <div style="background: linear-gradient(45deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; font-size: 1.1rem;">
                                Want even more detailed analysis? Upgrade to Premium!
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultsDetails.innerHTML = DOMPurify.sanitize(htmlContent);
        }
        
        // Scroll to results with smooth animation
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
        
        // Hide loading state
        this.hideLoadingState();
    }
    
    renderImprovementCategories(specificSuggestions) {
        const categories = [
            { key: 'hairstyles', icon: '💇', title: 'Hairstyle Recommendations', color: '#f59e0b' },
            { key: 'eyebrowStyling', icon: '🤎', title: 'Eyebrow Styling', color: '#8b5cf6' },
            { key: 'skincare', icon: '✨', title: 'Skincare Tips', color: '#10b981' },
            { key: 'accessories', icon: '👓', title: 'Accessories', color: '#3b82f6' },
            { key: 'grooming', icon: '🧴', title: 'Grooming', color: '#ef4444' },
            { key: 'styling', icon: '👔', title: 'Style & Fashion', color: '#f97316' }
        ];

        return categories.map(category => {
            const suggestions = specificSuggestions[category.key] || [];
            if (suggestions.length === 0) return '';

            return `
                <div class="improvement-category" style="background: rgba(${this.hexToRgb(category.color)}, 0.1); border: 1px solid rgba(${this.hexToRgb(category.color)}, 0.2); border-radius: 12px; padding: 1rem;">
                    <h5 style="color: ${category.color}; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 600;">
                        <span>${category.icon}</span> ${category.title}
                    </h5>
                    <div class="suggestions-list" style="display: grid; gap: 0.5rem;">
                        ${suggestions.slice(0, 3).map(suggestion => 
                            `<div class="suggestion-item" style="background: rgba(255,255,255,0.05); padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                                • ${suggestion}
                            </div>`
                        ).join('')}
                        ${suggestions.length > 3 ? 
                            `<div style="color: rgba(255,255,255,0.6); font-size: 0.8rem; font-style: italic; margin-top: 0.25rem;">
                                +${suggestions.length - 3} more suggestions in premium version
                            </div>` : ''
                        }
                    </div>
                </div>
            `;
        }).filter(Boolean).join('');
    }

    renderActionPlan(actionableSteps) {
        const timeframes = [
            { key: 'immediate', icon: '⚡', title: 'Immediate (Today)', color: '#10b981' },
            { key: 'shortTerm', icon: '📅', title: 'Short-term (1-4 weeks)', color: '#3b82f6' },
            { key: 'longTerm', icon: '🎯', title: 'Long-term (1-6 months)', color: '#8b5cf6' }
        ];

        return timeframes.map(timeframe => {
            const actions = actionableSteps[timeframe.key] || [];
            if (actions.length === 0) return '';

            return `
                <div class="action-timeframe" style="background: rgba(${this.hexToRgb(timeframe.color)}, 0.1); border: 1px solid rgba(${this.hexToRgb(timeframe.color)}, 0.2); border-radius: 12px; padding: 1rem;">
                    <h5 style="color: ${timeframe.color}; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 600;">
                        <span>${timeframe.icon}</span> ${timeframe.title}
                    </h5>
                    <div class="actions-list" style="display: grid; gap: 0.5rem;">
                        ${actions.slice(0, 2).map((action, index) => 
                            `<div class="action-item" style="background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 8px; display: flex; align-items: flex-start; gap: 0.75rem;">
                                <div style="background: ${timeframe.color}; color: white; width: 1.5rem; height: 1.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; flex-shrink: 0;">
                                    ${index + 1}
                                </div>
                                <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem; line-height: 1.4;">
                                    ${action}
                                </div>
                            </div>`
                        ).join('')}
                        ${actions.length > 2 ? 
                            `<div style="color: rgba(255,255,255,0.6); font-size: 0.8rem; font-style: italic; margin-top: 0.25rem; text-align: center;">
                                +${actions.length - 2} more action items in premium version
                            </div>` : ''
                        }
                    </div>
                </div>
            `;
        }).filter(Boolean).join('');
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '59, 130, 246';
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
            
            // Add performance indicator for development
            this.addPerformanceIndicator();
            
            // Track Core Web Vitals if available
            this.trackCoreWebVitals();
        });
        
        // Initialize scroll progress indicator
        this.initializeScrollProgress();
        
        // Monitor FPS
        this.startFPSMonitoring();
    }
    
    addPerformanceIndicator() {
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            const indicator = document.createElement('div');
            indicator.className = 'fps-indicator';
            indicator.id = 'fpsCounter';
            indicator.textContent = 'FPS: --';
            document.body.appendChild(indicator);
        }
    }
    
    startFPSMonitoring() {
        let fps = 0;
        let lastTime = performance.now();
        let frames = 0;
        
        const updateFPS = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                const indicator = document.getElementById('fpsCounter');
                if (indicator) {
                    indicator.textContent = `FPS: ${fps}`;
                    indicator.style.color = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';
                }
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        if (document.getElementById('fpsCounter')) {
            requestAnimationFrame(updateFPS);
        }
    }
    
    initializeScrollProgress() {
        // Create scroll progress indicator
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        
        const scrollProgress = document.createElement('div');
        scrollProgress.className = 'scroll-progress';
        
        scrollIndicator.appendChild(scrollProgress);
        document.body.appendChild(scrollIndicator);
        
        // Update scroll progress
        window.addEventListener('scroll', this.throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            scrollProgress.style.width = `${Math.min(scrollPercent, 100)}%`;
        }, 16));
    }
    
    trackCoreWebVitals() {
        // Track Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            console.log('LCP:', entry.startTime);
                        }
                        if (entry.entryType === 'layout-shift') {
                            console.log('CLS:', entry.value);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
            } catch (error) {
                console.log('Performance observation not supported');
            }
        }
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
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4) !important;
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

// PWA Service Worker Registration - Disabled until sw.js is created
// TODO: Create service worker file for offline functionality
/*
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
*/

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RateMyLooksApp;
}