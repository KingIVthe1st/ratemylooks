/**
 * Debug script to test backend response structure
 * This will help identify where the analysis text is actually stored
 */

const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testBackendResponse() {
    try {
        // Create a larger test image that meets Grok AI minimum requirements (512+ pixels)
        // This is a 32x32 white square PNG (1024 pixels total)
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVFiFtZc9SwNBEIafRQsrwcJCG1sLG1sLbSy0sdDGQhsLbSy0sdDGQhsLbSy0sdDGQhsLbSy0sdDGQhsLbSy0sdDGQhsLbSy0sVDbfBZm4WZ3dmf2nXcGZmYXkiRJkiRJkiRJkiRJ+k+SJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJP0nfQAzE4VVzhcQCgAAAABJRU5ErkJggg==';
        
        console.log('🧪 Testing backend response structure...');
        
        // Test with base64 endpoint for simplicity
        const response = await fetch('http://localhost:3000/api/analyze/base64', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: testImageBase64,
                options: {}
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Backend response received');
            console.log('📊 Response structure:');
            console.log('- data keys:', Object.keys(data.data));
            console.log('- data.analysis keys:', Object.keys(data.data.analysis || {}));
            console.log('- data.analysis.overall:', data.data.analysis?.overall ? 'EXISTS' : 'MISSING');
            console.log('- data.rawResponse:', data.data.rawResponse ? 'EXISTS' : 'MISSING');
            
            // Log the actual analysis text location
            if (data.data.analysis?.overall) {
                console.log('🎯 Found analysis text at data.analysis.overall:');
                console.log(data.data.analysis.overall.substring(0, 200) + '...');
            }
            
            if (data.data.rawResponse) {
                console.log('🎯 Found rawResponse at data.rawResponse:');
                console.log(data.data.rawResponse.substring(0, 200) + '...');
            }
            
            // Full structure for debugging
            console.log('\n📋 Full response structure:');
            console.log(JSON.stringify(data, null, 2));
            
        } else {
            console.error('❌ Backend request failed:', data);
        }
        
    } catch (error) {
        console.error('🔥 Test failed:', error.message);
    }
    
    process.exit(0);
}

// Check if node-fetch is available, if not provide instructions
try {
    require.resolve('node-fetch');
    require.resolve('form-data');
    testBackendResponse();
} catch (error) {
    console.log('📦 Installing required dependencies...');
    const { exec } = require('child_process');
    
    exec('npm install node-fetch@2 form-data', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error('Failed to install dependencies:', error);
            process.exit(1);
        }
        console.log('✅ Dependencies installed, running test...');
        testBackendResponse();
    });
}