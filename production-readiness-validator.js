/**
 * RateMyLooks.ai - Production Readiness Validator
 * Comprehensive testing suite for deployment validation
 * 
 * Usage: Run in browser console on live site
 * Purpose: Validate infinite loop fixes and overall upload functionality
 */

class ProductionReadinessValidator {
    constructor() {
        this.results = {
            overall: 'TESTING',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            tests: {},
            performance: {},
            security: {},
            compatibility: {},
            criticalIssues: [],
            warnings: [],
            recommendations: []
        };

        this.startTime = performance.now();
        this.consoleHistory = [];
        
        // Monitor console for issues
        this.setupConsoleMonitoring();
    }

    setupConsoleMonitoring() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.consoleHistory.push({
                type: 'log',
                message: args.join(' '),
                timestamp: Date.now()
            });
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.consoleHistory.push({
                type: 'error', 
                message: args.join(' '),
                timestamp: Date.now()
            });
            this.results.criticalIssues.push(`Console Error: ${args.join(' ')}`);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.consoleHistory.push({
                type: 'warn',
                message: args.join(' '),
                timestamp: Date.now()
            });
            this.results.warnings.push(`Console Warning: ${args.join(' ')}`);
            originalWarn.apply(console, args);
        };
    }

    // Test 1: Infrastructure Health Check
    testInfrastructure() {
        const test = 'infrastructure';
        this.results.tests[test] = { status: 'RUNNING', details: {} };

        try {
            // DOM readiness
            const domReady = document.readyState === 'complete';
            
            // Critical elements presence
            const criticalElements = {
                uploadArea: !!document.getElementById('uploadArea'),
                fileInput: !!document.getElementById('fileInput'), 
                uploadBtn: !!document.getElementById('uploadBtn'),
                resultsSection: !!document.getElementById('results'),
                toast: !!document.getElementById('toast')
            };

            // App instance availability
            const appInstance = !!window.rateMyLooksApp;
            const appMethods = appInstance ? {
                triggerFileInput: typeof window.rateMyLooksApp.triggerFileInput === 'function',
                analyzeImage: typeof window.rateMyLooksApp.analyzeImage === 'function',
                handleFileSelect: typeof window.rateMyLooksApp.handleFileSelect === 'function'
            } : {};

            // Style loading
            const cssLoaded = document.stylesheets.length > 0;
            
            // JavaScript libraries
            const dompurifyLoaded = typeof DOMPurify !== 'undefined';

            const allElementsPresent = Object.values(criticalElements).every(Boolean);
            const allMethodsPresent = Object.values(appMethods).every(Boolean);

            this.results.tests[test] = {
                status: (domReady && allElementsPresent && appInstance && allMethodsPresent) ? 'PASS' : 'FAIL',
                details: {
                    domReady,
                    criticalElements,
                    appInstance,
                    appMethods,
                    cssLoaded,
                    dompurifyLoaded
                }
            };

            if (!allElementsPresent) {
                this.results.criticalIssues.push('Missing critical DOM elements');
            }
            if (!appInstance || !allMethodsPresent) {
                this.results.criticalIssues.push('App instance or critical methods missing');
            }

        } catch (error) {
            this.results.tests[test] = {
                status: 'ERROR',
                error: error.message
            };
            this.results.criticalIssues.push(`Infrastructure test error: ${error.message}`);
        }
    }

    // Test 2: Infinite Loop Prevention (CRITICAL)
    async testInfiniteLoopPrevention() {
        const test = 'infiniteLoopPrevention';
        this.results.tests[test] = { status: 'RUNNING', details: {} };

        try {
            const uploadArea = document.getElementById('uploadArea');
            if (!uploadArea) {
                throw new Error('Upload area not found');
            }

            // Track console messages for loop detection
            const initialLogCount = this.consoleHistory.length;
            
            // Simulate rapid clicking (most common infinite loop trigger)
            const rapidClicks = 8;
            const clickInterval = 30; // 30ms between clicks

            console.log(`🧪 Testing infinite loop prevention with ${rapidClicks} rapid clicks...`);

            for (let i = 0; i < rapidClicks; i++) {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    composed: true
                });
                
                uploadArea.dispatchEvent(clickEvent);
                
                // Small delay between clicks
                await new Promise(resolve => setTimeout(resolve, clickInterval));
            }

            // Wait for any delayed processing
            await new Promise(resolve => setTimeout(resolve, 500));

            // Analyze console output
            const newLogs = this.consoleHistory.slice(initialLogCount);
            
            // Count file input trigger attempts
            const triggerAttempts = newLogs.filter(log => 
                log.message.includes('triggering file input') || 
                log.message.includes('Triggering file input')
            ).length;

            // Count cooldown messages
            const cooldownMessages = newLogs.filter(log =>
                log.message.includes('cooldown') ||
                log.message.includes('ignored') ||
                log.message.includes('in progress')
            ).length;

            // Check for repeated patterns (infinite loop indicator)
            const repeatedPatterns = this.detectInfiniteLoopPatterns(newLogs);
            
            // Performance check
            const memoryBefore = performance.memory?.usedJSHeapSize || 0;
            await new Promise(resolve => setTimeout(resolve, 100));
            const memoryAfter = performance.memory?.usedJSHeapSize || 0;
            const memoryIncrease = memoryAfter - memoryBefore;

            const passConditions = {
                singleTrigger: triggerAttempts <= 1,
                cooldownActive: cooldownMessages >= (rapidClicks - 1) * 0.5, // Allow some tolerance
                noInfiniteLoops: repeatedPatterns.length === 0,
                memoryStable: memoryIncrease < 1024 * 1024 // < 1MB increase
            };

            const testPassed = Object.values(passConditions).every(Boolean);

            this.results.tests[test] = {
                status: testPassed ? 'PASS' : 'FAIL',
                details: {
                    rapidClicks,
                    triggerAttempts,
                    cooldownMessages,
                    repeatedPatterns: repeatedPatterns.length,
                    memoryIncrease: `${(memoryIncrease / 1024).toFixed(2)}KB`,
                    passConditions
                }
            };

            if (!testPassed) {
                if (triggerAttempts > 1) {
                    this.results.criticalIssues.push(`Multiple file input triggers detected: ${triggerAttempts}`);
                }
                if (repeatedPatterns.length > 0) {
                    this.results.criticalIssues.push(`Infinite loop patterns detected: ${repeatedPatterns.length}`);
                }
                if (memoryIncrease > 1024 * 1024) {
                    this.results.criticalIssues.push(`Excessive memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
                }
            }

        } catch (error) {
            this.results.tests[test] = {
                status: 'ERROR',
                error: error.message
            };
            this.results.criticalIssues.push(`Infinite loop prevention test error: ${error.message}`);
        }
    }

    // Helper: Detect infinite loop patterns in console logs
    detectInfiniteLoopPatterns(logs) {
        const messageGroups = {};
        const threshold = 3; // 3+ identical messages in short time = potential loop

        logs.forEach(log => {
            const key = log.message.substring(0, 50); // First 50 chars for grouping
            if (!messageGroups[key]) {
                messageGroups[key] = [];
            }
            messageGroups[key].push(log.timestamp);
        });

        const patterns = [];
        Object.entries(messageGroups).forEach(([message, timestamps]) => {
            if (timestamps.length >= threshold) {
                // Check if messages occurred in rapid succession
                const timeDiffs = timestamps.slice(1).map((time, i) => time - timestamps[i]);
                const averageGap = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
                
                if (averageGap < 100) { // Less than 100ms average between messages
                    patterns.push({
                        message,
                        count: timestamps.length,
                        averageGap: averageGap.toFixed(2)
                    });
                }
            }
        });

        return patterns;
    }

    // Test 3: Upload Flow Validation
    async testUploadFlow() {
        const test = 'uploadFlow';
        this.results.tests[test] = { status: 'RUNNING', details: {} };

        try {
            const uploadArea = document.getElementById('uploadArea');
            const uploadBtn = document.getElementById('uploadBtn');
            const fileInput = document.getElementById('fileInput');

            // Initial state validation
            const initialButtonDisabled = uploadBtn.disabled;
            const initialCurrentImage = window.rateMyLooksApp?.currentImage;

            // Simulate successful file upload
            const mockFile = new File(['mock content'], 'test.jpg', { type: 'image/jpeg', lastModified: Date.now() });
            
            // Mock file input change
            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
                configurable: true
            });

            const changeEvent = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(changeEvent);

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 300));

            // Validate state changes
            const finalButtonDisabled = uploadBtn.disabled;
            const finalCurrentImage = window.rateMyLooksApp?.currentImage;
            const buttonHasEnabledClass = uploadBtn.classList.contains('enabled');

            // Test button click behavior
            let analyzeImageCalled = false;
            const originalAnalyze = window.rateMyLooksApp?.analyzeImage;
            if (window.rateMyLooksApp) {
                window.rateMyLooksApp.analyzeImage = function() {
                    analyzeImageCalled = true;
                    return Promise.resolve();
                };
            }

            const buttonClickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            uploadBtn.dispatchEvent(buttonClickEvent);

            // Restore original method
            if (originalAnalyze && window.rateMyLooksApp) {
                window.rateMyLooksApp.analyzeImage = originalAnalyze;
            }

            const flowValidations = {
                initialButtonDisabled,
                fileProcessed: finalCurrentImage === mockFile,
                buttonEnabled: !finalButtonDisabled,
                buttonHasEnabledClass,
                analyzeImageCalled
            };

            const flowPassed = Object.values(flowValidations).every(Boolean);

            this.results.tests[test] = {
                status: flowPassed ? 'PASS' : 'FAIL',
                details: flowValidations
            };

            if (!flowPassed) {
                const failures = Object.entries(flowValidations)
                    .filter(([key, value]) => !value)
                    .map(([key]) => key);
                this.results.criticalIssues.push(`Upload flow failures: ${failures.join(', ')}`);
            }

        } catch (error) {
            this.results.tests[test] = {
                status: 'ERROR',
                error: error.message
            };
            this.results.criticalIssues.push(`Upload flow test error: ${error.message}`);
        }
    }

    // Test 4: Performance Validation
    async testPerformance() {
        const test = 'performance';
        this.results.tests[test] = { status: 'RUNNING', details: {} };

        try {
            const uploadArea = document.getElementById('uploadArea');
            
            // Response time test
            const responseTests = [];
            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
                uploadArea.dispatchEvent(clickEvent);
                const end = performance.now();
                responseTests.push(end - start);
                
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            const averageResponseTime = responseTests.reduce((a, b) => a + b) / responseTests.length;
            const maxResponseTime = Math.max(...responseTests);

            // Memory usage check
            const memoryInfo = performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null;

            // DOM complexity
            const domComplexity = {
                totalElements: document.getElementsByTagName('*').length,
                listeners: window.rateMyLooksApp ? 'Active' : 'Missing'
            };

            const performanceMetrics = {
                averageResponseTime: Number(averageResponseTime.toFixed(2)),
                maxResponseTime: Number(maxResponseTime.toFixed(2)),
                memoryInfo,
                domComplexity
            };

            const performancePassed = 
                averageResponseTime < 50 && 
                maxResponseTime < 100 && 
                (!memoryInfo || memoryInfo.used < 100);

            this.results.tests[test] = {
                status: performancePassed ? 'PASS' : 'WARN',
                details: performanceMetrics
            };

            this.results.performance = performanceMetrics;

            if (!performancePassed) {
                if (averageResponseTime >= 50) {
                    this.results.warnings.push(`Slow average response time: ${averageResponseTime.toFixed(2)}ms`);
                }
                if (maxResponseTime >= 100) {
                    this.results.warnings.push(`Slow max response time: ${maxResponseTime.toFixed(2)}ms`);
                }
                if (memoryInfo && memoryInfo.used >= 100) {
                    this.results.warnings.push(`High memory usage: ${memoryInfo.used}MB`);
                }
            }

        } catch (error) {
            this.results.tests[test] = {
                status: 'ERROR',
                error: error.message
            };
            this.results.warnings.push(`Performance test error: ${error.message}`);
        }
    }

    // Test 5: Security Validation
    testSecurity() {
        const test = 'security';
        this.results.tests[test] = { status: 'RUNNING', details: {} };

        try {
            const securityChecks = {
                httpsProtocol: window.location.protocol === 'https:',
                cspHeader: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
                noInlineScripts: !document.body.innerHTML.includes('<script>'),
                dompurifyAvailable: typeof DOMPurify !== 'undefined',
                fileInputHidden: (() => {
                    const fileInput = document.getElementById('fileInput');
                    if (!fileInput) return false;
                    const style = window.getComputedStyle(fileInput);
                    return style.zIndex === '-9999' && style.visibility === 'hidden';
                })()
            };

            const securityPassed = Object.values(securityChecks).every(Boolean);

            this.results.tests[test] = {
                status: securityPassed ? 'PASS' : 'WARN',
                details: securityChecks
            };

            this.results.security = securityChecks;

            const securityIssues = Object.entries(securityChecks)
                .filter(([key, value]) => !value)
                .map(([key]) => key);

            if (securityIssues.length > 0) {
                this.results.warnings.push(`Security concerns: ${securityIssues.join(', ')}`);
            }

        } catch (error) {
            this.results.tests[test] = {
                status: 'ERROR', 
                error: error.message
            };
            this.results.warnings.push(`Security test error: ${error.message}`);
        }
    }

    // Generate comprehensive report
    generateReport() {
        const totalTests = Object.keys(this.results.tests).length;
        const passedTests = Object.values(this.results.tests).filter(t => t.status === 'PASS').length;
        const failedTests = Object.values(this.results.tests).filter(t => t.status === 'FAIL').length;
        const errorTests = Object.values(this.results.tests).filter(t => t.status === 'ERROR').length;
        
        const overallStatus = failedTests > 0 || errorTests > 0 ? 'FAIL' : 
                            this.results.criticalIssues.length > 0 ? 'CRITICAL' : 'PASS';

        this.results.overall = overallStatus;
        this.results.summary = {
            totalTests,
            passedTests,
            failedTests,
            errorTests,
            criticalIssues: this.results.criticalIssues.length,
            warnings: this.results.warnings.length,
            executionTime: `${(performance.now() - this.startTime).toFixed(2)}ms`
        };

        // Add recommendations based on results
        if (overallStatus === 'PASS') {
            this.results.recommendations.push('✅ Upload functionality is production-ready');
            this.results.recommendations.push('✅ Infinite loop protection is working correctly');
            this.results.recommendations.push('✅ All critical tests passed');
        } else {
            this.results.recommendations.push('⚠️ Review failed tests before deployment');
            if (this.results.criticalIssues.length > 0) {
                this.results.recommendations.push('🚨 Address critical issues immediately');
            }
        }

        this.displayReport();
        return this.results;
    }

    displayReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 RATEMYLOOKS.AI - PRODUCTION READINESS REPORT');
        console.log('='.repeat(60));

        const status = this.results.overall;
        const statusIcon = {
            'PASS': '✅',
            'WARN': '⚠️', 
            'FAIL': '❌',
            'CRITICAL': '🚨'
        }[status] || '❓';

        console.log(`\n${statusIcon} OVERALL STATUS: ${status}`);
        console.log(`📊 Test Summary: ${this.results.summary.passedTests}/${this.results.summary.totalTests} passed`);
        console.log(`⏱️ Execution Time: ${this.results.summary.executionTime}`);
        console.log(`🌐 URL: ${this.results.url}`);
        console.log(`📅 Timestamp: ${this.results.timestamp}`);

        console.log('\n📋 TEST RESULTS:');
        Object.entries(this.results.tests).forEach(([testName, result]) => {
            const icon = {
                'PASS': '✅',
                'FAIL': '❌', 
                'ERROR': '🚨',
                'WARN': '⚠️'
            }[result.status] || '❓';
            
            console.log(`   ${icon} ${testName}: ${result.status}`);
            
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        });

        if (this.results.criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES:');
            this.results.criticalIssues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        }

        if (this.results.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            this.results.warnings.forEach((warning, i) => {
                console.log(`   ${i + 1}. ${warning}`);
            });
        }

        console.log('\n💡 RECOMMENDATIONS:');
        this.results.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });

        if (this.results.performance.averageResponseTime) {
            console.log('\n⚡ PERFORMANCE METRICS:');
            console.log(`   Average Response: ${this.results.performance.averageResponseTime}ms`);
            console.log(`   Max Response: ${this.results.performance.maxResponseTime}ms`);
            if (this.results.performance.memoryInfo) {
                console.log(`   Memory Usage: ${this.results.performance.memoryInfo.used}MB`);
            }
        }

        console.log('\n' + '='.repeat(60));
        
        if (status === 'PASS') {
            console.log('🎉 DEPLOYMENT APPROVED - Upload functionality is ready for production!');
        } else {
            console.log('⛔ DEPLOYMENT BLOCKED - Address issues before deploying to production');
        }
        
        console.log('='.repeat(60));
    }

    // Main execution method
    async runAllValidations() {
        console.log('🚀 Starting Production Readiness Validation...\n');

        try {
            // Run all tests in sequence
            this.testInfrastructure();
            await this.testInfiniteLoopPrevention();
            await this.testUploadFlow();
            await this.testPerformance();
            this.testSecurity();

            // Generate final report
            return this.generateReport();

        } catch (error) {
            console.error('❌ Validation failed with critical error:', error);
            this.results.overall = 'CRITICAL';
            this.results.criticalIssues.push(`Validation execution error: ${error.message}`);
            return this.generateReport();
        }
    }
}

// Auto-load and provide instructions
console.log('🎯 Production Readiness Validator Loaded');
console.log('📋 Usage: new ProductionReadinessValidator().runAllValidations()');
console.log('⚡ For quick start, run the validator now...\n');

// Export for manual use
window.ProductionReadinessValidator = ProductionReadinessValidator;

// Uncomment for immediate execution:
// new ProductionReadinessValidator().runAllValidations();