const http = require('http');
const app = require('../app');

const testBackend = async () => {
  console.log('--- Starting Backend Verification Tests ---');
  let passed = 0;
  let failed = 0;

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`[Test Server] Listening on temporary port ${port}`);

    // Helper for HTTP requests
    const makeRequest = (method, path, body = null, headers = {}) => {
      return new Promise((resolve, reject) => {
        const url = new URL(baseUrl + path);
        const options = {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve({ statusCode: res.statusCode, data: json });
            } catch (e) {
              resolve({ statusCode: res.statusCode, data });
            }
          });
        });

        req.on('error', (err) => reject(err));

        if (body) {
          req.write(JSON.stringify(body));
        }
        req.end();
      });
    };

    try {
      // Test 1: Health check
      console.log('\n[Test 1] GET /api/v1/health');
      const res1 = await makeRequest('GET', '/api/v1/health');
      if (res1.statusCode === 200 && res1.data.status === 'OK') {
        console.log('✅ Health check passed!');
        passed++;
      } else {
        console.error('❌ Health check failed:', res1);
        failed++;
      }

      // Test 2: AI Cost Estimator API
      console.log('\n[Test 2] POST /api/v1/ai/estimate-cost');
      const res2 = await makeRequest('POST', '/api/v1/ai/estimate-cost', {
        treatmentCode: 'ANGIO-01',
        city: 'Mumbai',
        insuranceCoveragePct: 80,
        copayAmount: 5000
      });
      if (res2.statusCode === 200 && res2.data.success && res2.data.data.netEstimatedOutofPocket > 0) {
        console.log('✅ AI Expense Estimator API passed!');
        console.log(`   Estimated Hospital Cost: ₹${res2.data.data.estimatedHospitalCost}`);
        console.log(`   Out of Pocket Cost: ₹${res2.data.data.netEstimatedOutofPocket}`);
        passed++;
      } else {
        console.error('❌ AI Expense Estimator API failed:', res2);
        failed++;
      }

      // Test 3: Treatments listing route
      console.log('\n[Test 3] GET /api/v1/treatments');
      const res3 = await makeRequest('GET', '/api/v1/treatments');
      if (res3.statusCode === 200 && res3.data.success) {
        console.log('✅ Treatments listing API route passed!');
        passed++;
      } else {
        console.error('❌ Treatments listing API route failed:', res3);
        failed++;
      }

      // Test 4: Hospitals listing route
      console.log('\n[Test 4] GET /api/v1/hospitals?city=Mumbai');
      const res4 = await makeRequest('GET', '/api/v1/hospitals?city=Mumbai');
      if (res4.statusCode === 200 && res4.data.success) {
        console.log('✅ Hospitals listing API route passed!');
        passed++;
      } else {
        console.error('❌ Hospitals listing API route failed:', res4);
        failed++;
      }

      // Test 5: 404 Route handling
      console.log('\n[Test 5] GET /api/v1/invalid-route');
      const res5 = await makeRequest('GET', '/api/v1/invalid-route');
      if (res5.statusCode === 404 && res5.data.success === false) {
        console.log('✅ 404 Error handler passed!');
        passed++;
      } else {
        console.error('❌ 404 Error handler failed:', res5);
        failed++;
      }

      // Test 6: AI Bill Analysis Service (direct service call)
      console.log('\n[Test 6] AIService.analyzeMedicalBill');
      const AIService = require('../services/aiService');
      const billAnalysis = await AIService.analyzeMedicalBill(null);
      if (billAnalysis && billAnalysis.totalClaimedAmount > 0 && billAnalysis.itemBreakdown.length > 0) {
        console.log('✅ AI Bill Analysis Service passed!');
        console.log(`   Claimed: ₹${billAnalysis.totalClaimedAmount}`);
        console.log(`   Fair Amount: ₹${billAnalysis.aiEstimatedFairAmount}`);
        console.log(`   Potential Savings: ₹${billAnalysis.potentialSavings}`);
        passed++;
      } else {
        console.error('❌ AI Bill Analysis Service failed:', billAnalysis);
        failed++;
      }

    } catch (err) {
      console.error('❌ Verification test execution error:', err);
      failed++;
    } finally {
      server.close();
      console.log(`\n===================================`);
      console.log(` Verification Summary: ${passed} passed, ${failed} failed.`);
      console.log(`===================================`);
      process.exit(failed > 0 ? 1 : 0);
    }
  });
};

testBackend();
