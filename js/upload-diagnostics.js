// COMPREHENSIVE FILE UPLOAD DIAGNOSTICS
// This script provides detailed analysis of file upload issues

class UploadDiagnostics {
    constructor() {
        this.results = [];
        this.init();
    }

    init() {
        console.log('🔍 Starting comprehensive upload diagnostics...');
        this.runAllTests();
    }

    runAllTests() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.executeTests());
        } else {
            this.executeTests();
        }
    }

    executeTests() {
        console.log('🧪 Executing diagnostic tests...');
        
        // Test 1: Browser capability check
        this.testBrowserCapabilities();
        
        // Test 2: Element detection and properties
        this.testElementProperties();
        
        // Test 3: CSS interference detection
        this.testCSSInterference();
        
        // Test 4: Event propagation test
        this.testEventPropagation();
        
        // Test 5: File input click methods
        this.testFileInputMethods();
        
        // Test 6: Mobile-specific tests
        this.testMobileSpecific();
        
        // Generate report
        setTimeout(() => this.generateReport(), 1000);
    }

    testBrowserCapabilities() {
        console.log('🌐 Testing browser capabilities...');
        
        const capabilities = {
            fileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),
            touchSupport: 'ontouchstart' in window,
            dragDrop: 'draggable' in document.createElement('span'),
            webkitFileSystem: !!window.webkitRequestFileSystem,
            chromeFileSystem: !!window.chrome?.fileSystem,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor,
            cookieEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled?.() || false,
            language: navigator.language,
            onLine: navigator.onLine
        };

        this.results.push({
            category: 'Browser Capabilities',
            status: capabilities.fileAPI ? 'PASS' : 'FAIL',
            details: capabilities,
            recommendations: capabilities.fileAPI 
                ? ['Browser supports all required file APIs']
                : ['Browser lacks File API support - file upload may not work']
        });

        console.log('✅ Browser capabilities test complete', capabilities);
    }

    testElementProperties() {
        console.log('🔍 Testing element properties...');
        
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        if (!uploadArea || !fileInput) {
            this.results.push({
                category: 'Element Detection',
                status: 'FAIL',
                details: { uploadArea: !!uploadArea, fileInput: !!fileInput },
                recommendations: ['Missing required DOM elements - check HTML structure']
            });
            return;
        }

        const uploadAreaStyles = window.getComputedStyle(uploadArea);
        const fileInputStyles = window.getComputedStyle(fileInput);
        
        const properties = {
            uploadArea: {
                display: uploadAreaStyles.display,
                visibility: uploadAreaStyles.visibility,
                pointerEvents: uploadAreaStyles.pointerEvents,
                position: uploadAreaStyles.position,
                zIndex: uploadAreaStyles.zIndex,
                cursor: uploadAreaStyles.cursor,
                opacity: uploadAreaStyles.opacity
            },
            fileInput: {
                display: fileInputStyles.display,
                visibility: fileInputStyles.visibility,
                pointerEvents: fileInputStyles.pointerEvents,
                position: fileInputStyles.position,
                zIndex: fileInputStyles.zIndex,
                opacity: fileInputStyles.opacity,
                width: fileInputStyles.width,
                height: fileInputStyles.height,
                hidden: fileInput.hidden,
                disabled: fileInput.disabled,
                accept: fileInput.accept,
                capture: fileInput.capture
            }
        };

        const issues = [];
        if (uploadAreaStyles.pointerEvents === 'none') {
            issues.push('Upload area has pointer-events: none');
        }
        if (fileInputStyles.display === 'none' && !fileInput.hidden) {
            issues.push('File input is display: none but not hidden');
        }
        if (fileInput.disabled) {
            issues.push('File input is disabled');
        }

        this.results.push({
            category: 'Element Properties',
            status: issues.length === 0 ? 'PASS' : 'WARN',
            details: properties,
            recommendations: issues.length === 0 
                ? ['All element properties look good']
                : issues.map(issue => `Fix: ${issue}`)
        });

        console.log('✅ Element properties test complete', properties);
    }

    testCSSInterference() {
        console.log('🎨 Testing CSS interference...');
        
        const bodyStyle = window.getComputedStyle(document.body);
        const htmlStyle = window.getComputedStyle(document.documentElement);
        
        const interference = {
            bodyUserSelect: bodyStyle.userSelect,
            bodyPointerEvents: bodyStyle.pointerEvents,
            htmlUserSelect: htmlStyle.userSelect,
            htmlPointerEvents: htmlStyle.pointerEvents,
            customStyles: []
        };

        // Check for custom stylesheets that might interfere
        const stylesheets = Array.from(document.styleSheets);
        stylesheets.forEach((sheet, index) => {
            try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                rules.forEach(rule => {
                    if (rule.style && rule.selectorText) {
                        if (rule.selectorText.includes('input[type="file"]') || 
                            rule.selectorText.includes('#fileInput') ||
                            rule.selectorText.includes('.upload-area')) {
                            interference.customStyles.push({
                                selector: rule.selectorText,
                                styles: rule.style.cssText
                            });
                        }
                    }
                });
            } catch (e) {
                // Cross-origin stylesheet, skip
            }
        });

        const issues = [];
        if (bodyStyle.userSelect === 'none') {
            issues.push('Body has user-select: none which may interfere with file selection');
        }
        if (bodyStyle.pointerEvents === 'none') {
            issues.push('Body has pointer-events: none');
        }

        this.results.push({
            category: 'CSS Interference',
            status: issues.length === 0 ? 'PASS' : 'WARN',
            details: interference,
            recommendations: issues.length === 0 
                ? ['No obvious CSS interference detected']
                : issues
        });

        console.log('✅ CSS interference test complete', interference);
    }

    testEventPropagation() {
        console.log('🎯 Testing event propagation...');
        
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) {
            this.results.push({
                category: 'Event Propagation',
                status: 'FAIL',
                details: 'Upload area not found',
                recommendations: ['Cannot test event propagation without upload area']
            });
            return;
        }

        let eventData = {
            clickFired: false,
            touchStartFired: false,
            touchEndFired: false,
            mouseDownFired: false,
            mouseUpFired: false,
            eventsPrevented: []
        };

        // Test event listeners
        const testClick = (e) => {
            eventData.clickFired = true;
            if (e.defaultPrevented) eventData.eventsPrevented.push('click');
        };
        
        const testTouchStart = (e) => {
            eventData.touchStartFired = true;
            if (e.defaultPrevented) eventData.eventsPrevented.push('touchstart');
        };
        
        const testTouchEnd = (e) => {
            eventData.touchEndFired = true;
            if (e.defaultPrevented) eventData.eventsPrevented.push('touchend');
        };
        
        const testMouseDown = (e) => {
            eventData.mouseDownFired = true;
            if (e.defaultPrevented) eventData.eventsPrevented.push('mousedown');
        };
        
        const testMouseUp = (e) => {
            eventData.mouseUpFired = true;
            if (e.defaultPrevented) eventData.eventsPrevented.push('mouseup');
        };

        // Add temporary listeners
        uploadArea.addEventListener('click', testClick);
        uploadArea.addEventListener('touchstart', testTouchStart);
        uploadArea.addEventListener('touchend', testTouchEnd);
        uploadArea.addEventListener('mousedown', testMouseDown);
        uploadArea.addEventListener('mouseup', testMouseUp);

        // Simulate events
        setTimeout(() => {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            uploadArea.dispatchEvent(clickEvent);

            if ('ontouchstart' in window) {
                const touchEvent = new TouchEvent('touchstart', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                uploadArea.dispatchEvent(touchEvent);
            }

            // Remove listeners
            setTimeout(() => {
                uploadArea.removeEventListener('click', testClick);
                uploadArea.removeEventListener('touchstart', testTouchStart);
                uploadArea.removeEventListener('touchend', testTouchEnd);
                uploadArea.removeEventListener('mousedown', testMouseDown);
                uploadArea.removeEventListener('mouseup', testMouseUp);

                this.results.push({
                    category: 'Event Propagation',
                    status: eventData.clickFired ? 'PASS' : 'FAIL',
                    details: eventData,
                    recommendations: eventData.clickFired 
                        ? ['Event propagation working correctly']
                        : ['Event propagation blocked - check for preventDefault() calls']
                });

                console.log('✅ Event propagation test complete', eventData);
            }, 100);
        }, 100);
    }

    testFileInputMethods() {
        console.log('📁 Testing file input methods...');
        
        const fileInput = document.getElementById('fileInput');
        if (!fileInput) {
            this.results.push({
                category: 'File Input Methods',
                status: 'FAIL',
                details: 'File input not found',
                recommendations: ['Cannot test file input methods without file input element']
            });
            return;
        }

        const methods = {
            directClick: false,
            syntheticClick: false,
            labelClick: false,
            temporaryShow: false,
            focusSpace: false
        };

        // Method 1: Direct click
        try {
            fileInput.click();
            methods.directClick = true;
        } catch (e) {
            console.warn('Direct click failed:', e);
        }

        // Method 2: Synthetic click
        try {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            methods.syntheticClick = fileInput.dispatchEvent(clickEvent);
        } catch (e) {
            console.warn('Synthetic click failed:', e);
        }

        // Method 3: Label click
        try {
            const label = document.createElement('label');
            label.htmlFor = 'fileInput';
            label.style.cssText = 'position: absolute; opacity: 0; pointer-events: none;';
            document.body.appendChild(label);
            label.click();
            document.body.removeChild(label);
            methods.labelClick = true;
        } catch (e) {
            console.warn('Label click failed:', e);
        }

        // Method 4: Temporary show
        try {
            const originalStyle = fileInput.style.cssText;
            fileInput.style.cssText = 'position: fixed; opacity: 0; z-index: -1;';
            fileInput.hidden = false;
            fileInput.click();
            fileInput.style.cssText = originalStyle;
            fileInput.hidden = true;
            methods.temporaryShow = true;
        } catch (e) {
            console.warn('Temporary show failed:', e);
        }

        // Method 5: Focus and space
        try {
            fileInput.focus();
            const spaceEvent = new KeyboardEvent('keydown', {
                key: ' ',
                code: 'Space',
                keyCode: 32
            });
            methods.focusSpace = fileInput.dispatchEvent(spaceEvent);
        } catch (e) {
            console.warn('Focus space failed:', e);
        }

        const successCount = Object.values(methods).filter(Boolean).length;
        
        this.results.push({
            category: 'File Input Methods',
            status: successCount > 0 ? 'PASS' : 'FAIL',
            details: methods,
            recommendations: [
                `${successCount}/5 methods successful`,
                successCount > 0 ? 'Use working methods as fallbacks' : 'All methods failed - check browser security settings'
            ]
        });

        console.log('✅ File input methods test complete', methods);
    }

    testMobileSpecific() {
        console.log('📱 Testing mobile-specific features...');
        
        const mobile = {
            touchSupport: 'ontouchstart' in window,
            orientationSupport: 'orientation' in window,
            deviceMotion: 'DeviceMotionEvent' in window,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio || 1
            },
            userAgent: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
                isAndroid: /Android/.test(navigator.userAgent)
            }
        };

        const fileInput = document.getElementById('fileInput');
        if (fileInput && mobile.userAgent.isMobile) {
            // Test mobile-specific attributes
            mobile.capture = fileInput.getAttribute('capture');
            mobile.accept = fileInput.getAttribute('accept');
        }

        this.results.push({
            category: 'Mobile Specific',
            status: 'INFO',
            details: mobile,
            recommendations: mobile.userAgent.isMobile 
                ? [
                    'Mobile device detected',
                    mobile.touchSupport ? 'Touch events supported' : 'Touch events not supported',
                    'Ensure file input has capture="environment" for camera access'
                ]
                : ['Desktop device - mobile tests not applicable']
        });

        console.log('✅ Mobile-specific test complete', mobile);
    }

    generateReport() {
        console.log('📊 Generating diagnostic report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.length,
                passed: this.results.filter(r => r.status === 'PASS').length,
                failed: this.results.filter(r => r.status === 'FAIL').length,
                warnings: this.results.filter(r => r.status === 'WARN').length,
                info: this.results.filter(r => r.status === 'INFO').length
            },
            results: this.results,
            overallStatus: this.results.some(r => r.status === 'FAIL') ? 'FAIL' : 
                         this.results.some(r => r.status === 'WARN') ? 'WARN' : 'PASS'
        };

        // Log detailed report
        console.group('🔍 UPLOAD DIAGNOSTICS REPORT');
        console.log('📅 Generated:', report.timestamp);
        console.log('📊 Summary:', report.summary);
        console.log('🎯 Overall Status:', report.overallStatus);
        
        this.results.forEach((result, index) => {
            console.group(`${index + 1}. ${result.category} - ${result.status}`);
            console.log('Details:', result.details);
            console.log('Recommendations:', result.recommendations);
            console.groupEnd();
        });
        
        console.groupEnd();

        // Store report globally for external access
        window.uploadDiagnosticsReport = report;

        // Generate user-friendly summary
        this.generateUserSummary(report);
    }

    generateUserSummary(report) {
        const summary = [];
        
        if (report.overallStatus === 'PASS') {
            summary.push('✅ All tests passed - file upload should work correctly');
        } else if (report.overallStatus === 'WARN') {
            summary.push('⚠️ Some issues detected but file upload should still work');
        } else {
            summary.push('❌ Critical issues detected - file upload may not work');
        }

        // Add specific recommendations
        const allRecommendations = report.results
            .map(r => r.recommendations)
            .flat()
            .filter(r => !r.startsWith('All') && !r.includes('look good'));

        if (allRecommendations.length > 0) {
            summary.push('\n🔧 Recommended fixes:');
            allRecommendations.forEach((rec, index) => {
                summary.push(`${index + 1}. ${rec}`);
            });
        }

        const userSummary = summary.join('\n');
        console.log('\n' + '='.repeat(50));
        console.log('📋 USER SUMMARY');
        console.log('='.repeat(50));
        console.log(userSummary);
        console.log('='.repeat(50));

        // Store user summary
        window.uploadDiagnosticsSummary = userSummary;
    }
}

// Initialize diagnostics
if (typeof window !== 'undefined') {
    window.uploadDiagnostics = new UploadDiagnostics();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UploadDiagnostics;
}