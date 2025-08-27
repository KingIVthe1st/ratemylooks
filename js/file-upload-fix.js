// FILE UPLOAD DIAGNOSTIC AND FIX MODULE
// This module addresses the file dialog not opening issue

class FileUploadFix {
    constructor() {
        this.setupDiagnostics();
        this.applyFixes();
    }

    setupDiagnostics() {
        // Enhanced logging for file input interactions
        console.log('🔍 File Upload Diagnostics Started');
        
        // Test if file input click is working
        this.testFileInputClick();
        
        // Monitor for any interfering elements
        this.checkForInterferences();
        
        // Validate browser compatibility
        this.checkBrowserCompatibility();
    }

    testFileInputClick() {
        const fileInput = document.getElementById('fileInput');
        if (!fileInput) {
            console.error('❌ File input element not found');
            return;
        }

        // Test 1: Direct click test
        console.log('🧪 Testing direct fileInput.click()');
        try {
            const clickResult = fileInput.click();
            console.log('✅ Direct click executed, result:', clickResult);
        } catch (error) {
            console.error('❌ Direct click failed:', error);
        }

        // Test 2: Check element properties
        console.log('🔍 File input properties:', {
            hidden: fileInput.hidden,
            style: fileInput.style.cssText,
            disabled: fileInput.disabled,
            accept: fileInput.accept,
            capture: fileInput.capture,
            computedDisplay: window.getComputedStyle(fileInput).display,
            computedVisibility: window.getComputedStyle(fileInput).visibility,
            computedPointerEvents: window.getComputedStyle(fileInput).pointerEvents
        });

        // Test 3: Check parent element properties
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            console.log('🔍 Upload area properties:', {
                computedPointerEvents: window.getComputedStyle(uploadArea).pointerEvents,
                zIndex: window.getComputedStyle(uploadArea).zIndex,
                position: window.getComputedStyle(uploadArea).position
            });
        }
    }

    checkForInterferences() {
        console.log('🔍 Checking for potential interferences...');
        
        // Check for elements that might be blocking
        const uploadArea = document.getElementById('uploadArea');
        const uploadContent = uploadArea?.querySelector('.upload-content');
        
        if (uploadContent) {
            const computedStyle = window.getComputedStyle(uploadContent);
            if (computedStyle.pointerEvents === 'none') {
                console.warn('⚠️ Upload content has pointer-events: none');
            }
        }

        // Check for global user-select restrictions
        const bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.userSelect === 'none') {
            console.warn('⚠️ Body has user-select: none which may interfere');
        }
    }

    checkBrowserCompatibility() {
        console.log('🔍 Browser compatibility check:', {
            userAgent: navigator.userAgent,
            vendor: navigator.vendor,
            platform: navigator.platform,
            touchEnabled: 'ontouchstart' in window,
            fileAPISupported: !!(window.File && window.FileReader && window.FileList && window.Blob)
        });
    }

    applyFixes() {
        console.log('🔧 Applying file upload fixes...');
        
        // Fix 1: Remove existing event listeners and add improved ones
        this.setupImprovedEventListeners();
        
        // Fix 2: Fix CSS issues
        this.applyCSSFixes();
        
        // Fix 3: Add multiple fallback methods
        this.setupFallbackMethods();
    }

    setupImprovedEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        if (!uploadArea || !fileInput) {
            console.error('❌ Required elements not found for improved event listeners');
            return;
        }

        // Remove existing listeners by cloning elements (clean slate approach)
        const newUploadArea = uploadArea.cloneNode(true);
        uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);

        // Method 1: Improved primary click handler
        newUploadArea.addEventListener('click', (e) => {
            console.log('🎯 Primary click handler triggered');
            
            // Don't prevent default or stop propagation here
            // Let the event bubble naturally
            
            // Use requestAnimationFrame to ensure click happens after current event loop
            requestAnimationFrame(() => {
                this.triggerFileInputWithMultipleMethods(fileInput);
            });
        });

        // Method 2: Alternative via label mechanism
        this.setupLabelMethod(newUploadArea, fileInput);

        // Method 3: Enhanced mobile support
        this.setupMobileSupport(newUploadArea, fileInput);

        console.log('✅ Improved event listeners setup complete');
    }

    setupLabelMethod(uploadArea, fileInput) {
        // Create an invisible label that wraps the file input
        const label = document.createElement('label');
        label.htmlFor = 'fileInput';
        label.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
            z-index: 10;
            background: transparent;
        `;

        uploadArea.style.position = 'relative';
        uploadArea.appendChild(label);

        console.log('✅ Label method setup complete');
    }

    setupMobileSupport(uploadArea, fileInput) {
        // Enhanced mobile support with proper touch handling
        uploadArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            console.log('📱 Touch end triggered');
            
            // Small delay to ensure touch is processed
            setTimeout(() => {
                this.triggerFileInputWithMultipleMethods(fileInput);
            }, 100);
        }, { passive: false });

        console.log('✅ Mobile support setup complete');
    }

    triggerFileInputWithMultipleMethods(fileInput) {
        console.log('🚀 Triggering file input with multiple methods...');
        
        const methods = [
            // Method 1: Direct click (most common)
            () => {
                console.log('🎯 Trying Method 1: Direct click');
                fileInput.click();
                return true;
            },
            
            // Method 2: Synthetic click event
            () => {
                console.log('🎯 Trying Method 2: Synthetic click event');
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    button: 0,
                    buttons: 1
                });
                return fileInput.dispatchEvent(clickEvent);
            },
            
            // Method 3: Focus + keyboard simulation
            () => {
                console.log('🎯 Trying Method 3: Focus + keyboard');
                fileInput.focus();
                const keyEvent = new KeyboardEvent('keydown', {
                    key: ' ',
                    code: 'Space',
                    keyCode: 32,
                    which: 32,
                    bubbles: true
                });
                return fileInput.dispatchEvent(keyEvent);
            },
            
            // Method 4: Show file input temporarily
            () => {
                console.log('🎯 Trying Method 4: Temporary show');
                const originalStyle = fileInput.style.cssText;
                fileInput.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    pointer-events: auto;
                    z-index: 9999;
                `;
                fileInput.hidden = false;
                
                const success = fileInput.click();
                
                // Restore original state
                setTimeout(() => {
                    fileInput.style.cssText = originalStyle;
                    fileInput.hidden = true;
                }, 100);
                
                return success;
            }
        ];

        // Try methods sequentially with delays
        let methodIndex = 0;
        const tryNextMethod = () => {
            if (methodIndex < methods.length) {
                try {
                    const result = methods[methodIndex]();
                    console.log(`✅ Method ${methodIndex + 1} executed, result:`, result);
                } catch (error) {
                    console.error(`❌ Method ${methodIndex + 1} failed:`, error);
                }
                
                methodIndex++;
                
                // Try next method after delay
                if (methodIndex < methods.length) {
                    setTimeout(tryNextMethod, 200);
                }
            }
        };

        tryNextMethod();
    }

    applyCSSFixes() {
        console.log('🎨 Applying CSS fixes...');
        
        // Create CSS fixes
        const style = document.createElement('style');
        style.id = 'file-upload-fixes';
        style.textContent = `
            /* File Upload Fixes */
            #fileInput {
                /* Ensure file input is accessible */
                position: absolute !important;
                opacity: 0 !important;
                width: 0.1px !important;
                height: 0.1px !important;
                overflow: hidden !important;
                pointer-events: auto !important;
                z-index: -1 !important;
            }
            
            #uploadArea {
                /* Ensure upload area is clickable */
                position: relative !important;
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 1 !important;
            }
            
            #uploadArea .upload-content {
                /* Fix pointer events on content */
                pointer-events: none !important;
            }
            
            #uploadArea .upload-link {
                /* Make browse link clickable */
                pointer-events: auto !important;
                position: relative !important;
                z-index: 2 !important;
            }
            
            /* Fix mobile touch targets */
            @media (max-width: 768px) {
                #uploadArea {
                    min-height: 200px !important;
                    touch-action: manipulation !important;
                    -webkit-tap-highlight-color: rgba(59, 130, 246, 0.3) !important;
                }
            }
            
            /* Accessibility improvements */
            #uploadArea:focus-visible {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
            }
        `;
        
        // Remove existing fix styles if any
        const existingStyle = document.getElementById('file-upload-fixes');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
        console.log('✅ CSS fixes applied');
    }

    setupFallbackMethods() {
        console.log('🔧 Setting up fallback methods...');
        
        // Add keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('#uploadArea')) {
                e.preventDefault();
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    this.triggerFileInputWithMultipleMethods(fileInput);
                }
            }
        });

        // Add double-click fallback
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dblclick', () => {
                console.log('🔄 Double-click fallback triggered');
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    this.triggerFileInputWithMultipleMethods(fileInput);
                }
            });
        }

        console.log('✅ Fallback methods setup complete');
    }

    // Method to manually trigger if needed
    manualTrigger() {
        console.log('🖱️ Manual trigger requested');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            this.triggerFileInputWithMultipleMethods(fileInput);
        }
    }
}

// Initialize the fix when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fileUploadFix = new FileUploadFix();
    });
} else {
    window.fileUploadFix = new FileUploadFix();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUploadFix;
}