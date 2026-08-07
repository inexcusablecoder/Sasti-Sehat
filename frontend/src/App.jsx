import React, { useState, useEffect } from 'react';
import { api } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('comparator'); // comparator | analyzer | estimator | procedures
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login | register

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');

  // Comparator State
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bill Analyzer State
  const [uploadFile, setUploadFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [billReport, setBillReport] = useState(null);

  // Out of Pocket Estimator State
  const [estCode, setEstCode] = useState('ANGIO-01');
  const [estCity, setEstCity] = useState('Mumbai');
  const [estInsurance, setEstInsurance] = useState(80);
  const [estCopay, setEstCopay] = useState(5000);
  const [estResult, setEstResult] = useState(null);

  // Check Backend Health & Fetch Initial Data
  useEffect(() => {
    checkHealth();
    fetchHospitals();
    fetchTreatments();
    checkAuthUser();
  }, []);

  // Filter effect
  useEffect(() => {
    fetchHospitals();
    fetchTreatments();
  }, [cityFilter, searchQuery]);

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      setBackendStatus(`Live (${res.database})`);
    } catch (e) {
      setBackendStatus('Offline / Reconnecting');
    }
  };

  const checkAuthUser = async () => {
    const token = localStorage.getItem('sasti_sehat_token');
    if (token) {
      try {
        const res = await api.getMe();
        if (res.data) setUser(res.data);
      } catch (e) {
        localStorage.removeItem('sasti_sehat_token');
      }
    }
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.getHospitals({ city: cityFilter, query: searchQuery });
      setHospitals(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatments = async () => {
    try {
      const res = await api.getTreatments({ query: searchQuery });
      setTreatments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const res = await api.login({ email: authEmail, password: authPassword });
        localStorage.setItem('sasti_sehat_token', res.data.token);
        setUser(res.data);
      } else {
        const res = await api.register({ fullName: authName, email: authEmail, password: authPassword });
        localStorage.setItem('sasti_sehat_token', res.data.token);
        setUser(res.data);
      }
      setShowAuthModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sasti_sehat_token');
    setUser(null);
  };

  const handleBillUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : uploadFile;
    if (!file) return;

    setAnalyzing(true);
    try {
      const res = await api.uploadBill(file);
      setBillReport(res.data);
    } catch (err) {
      alert(`Bill analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRunEstimator = async (e) => {
    e.preventDefault();
    try {
      const res = await api.estimateCost({
        treatmentCode: estCode,
        city: estCity,
        insuranceCoveragePct: Number(estInsurance),
        copayAmount: Number(estCopay)
      });
      setEstResult(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header & Navigation */}
      <nav className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">🏥</span> Sasti-Sehat
        </a>
        <div className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'comparator' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparator')}
          >
            <span>🏥</span> Cost Comparator
          </button>
          <button 
            className={`nav-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            <span>📄</span> AI Bill Analyzer
          </button>
          <button 
            className={`nav-btn ${activeTab === 'estimator' ? 'active' : ''}`}
            onClick={() => setActiveTab('estimator')}
          >
            <span>💡</span> Expense Estimator
          </button>
          <button 
            className={`nav-btn ${activeTab === 'procedures' ? 'active' : ''}`}
            onClick={() => setActiveTab('procedures')}
          >
            <span>🔬</span> Procedure Benchmarks
          </button>
        </div>

        <div className="header-actions">
          <div className="status-badge">
            <span className="status-dot"></span> Backend {backendStatus}
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>👤 {user.fullName}</span>
              <button className="btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setShowAuthModal(true)}>
              Login / Sign Up
            </button>
          )}
        </div>
      </nav>

      <div className="container">
        {/* Hero Banner */}
        <div className="hero">
          <h1>Healthcare Price Transparency Powered by AI</h1>
          <p>
            Compare treatment costs across accredited hospitals, upload medical bills for AI overcharge detection, and estimate your out-of-pocket medical expenses before admission.
          </p>
          <div className="search-box">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search procedure (e.g. Angioplasty, Cataract, MRI) or hospital name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="select-input"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
            <button className="btn-primary" onClick={fetchHospitals}>
              <span>🔍</span> Search
            </button>
          </div>
        </div>

        {/* TAB 1: HOSPITAL & COST COMPARATOR */}
        {activeTab === 'comparator' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>🏥 Hospital Tariffs & Transparency Ratings ({hospitals.length})</h2>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Showing verified pricing packages in {cityFilter || 'India'}
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Loading hospital price records from MongoDB backend...
              </div>
            ) : (
              <div className="grid-cards">
                {hospitals.map((h) => (
                  <div key={h._id} className="card">
                    <div>
                      <div className="card-header">
                        <span className="card-title">{h.name}</span>
                        <span className="badge badge-teal">⭐ {h.rating}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        📍 {h.address}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span className="badge badge-amber">{h.accreditation || 'NABH Verified'}</span>
                        <span className="badge badge-teal">{h.city}</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Popular Package Standard:</div>
                      <div className="price-tag">₹35,000 - ₹1,85,000</div>
                      <button 
                        className="btn-secondary" 
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        onClick={() => alert(`Fetching direct tariff card from Express API for ${h.name}`)}
                      >
                        View Tariff Breakdown
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: AI MEDICAL BILL ANALYZER */}
        {activeTab === 'analyzer' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2>📄 AI Medical Bill & Quote Anomaly Detector</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Upload your hospital quote or medical bill (PNG, JPG, PDF) to automatically scan line items against national fair price benchmarks.
              </p>
            </div>

            <div className="upload-zone" onClick={() => document.getElementById('bill-file-input').click()}>
              <div className="upload-icon">📤</div>
              <h3>{uploadFile ? uploadFile.name : 'Drag & Drop medical bill or Click to Browse'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Supports Hospital Discharge Summaries, Quotations, and Pharmacy Receipts (Max 10MB)
              </p>
              <input 
                id="bill-file-input" 
                type="file" 
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleBillUpload}
              />
            </div>

            {analyzing && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-teal-bright)', fontWeight: '700' }}>
                ⚡ Processing OCR & Scanning line items against MongoDB price benchmarks...
              </div>
            )}

            {billReport && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Claimed Amount</div>
                    <div className="price-tag" style={{ color: 'var(--accent-rose)' }}>
                      ₹{billReport.totalClaimedAmount?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Fair Market Estimate</div>
                    <div className="price-tag" style={{ color: 'var(--accent-green)' }}>
                      ₹{billReport.aiEstimatedFairAmount?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Potential Negotiable Savings</div>
                    <div className="price-tag" style={{ color: 'var(--accent-amber)' }}>
                      ₹{billReport.potentialSavings?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(20, 184, 166, 0.05)' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>🤖 AI Summary & Recommendation</h3>
                  <p>{billReport.summary}</p>
                </div>

                <h3>Itemized Charge Breakdown</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Line Item Description</th>
                        <th>Category</th>
                        <th>Billed Amount</th>
                        <th>Fair Benchmark</th>
                        <th>Status</th>
                        <th>Recommendation / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billReport.itemBreakdown?.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{item.itemDescription}</td>
                          <td>{item.category}</td>
                          <td>₹{item.chargedAmount?.toLocaleString('en-IN')}</td>
                          <td>₹{item.benchmarkAmount?.toLocaleString('en-IN')}</td>
                          <td>
                            {item.isOverpriced ? (
                              <span className="badge badge-rose">Overpriced (+{item.overchargePercentage}%)</span>
                            ) : (
                              <span className="badge badge-teal">Fair Price</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: var('var(--text-muted)') }}>{item.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: OUT-OF-POCKET EXPENSE ESTIMATOR */}
        {activeTab === 'estimator' && (
          <section style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2>💡 Out-of-Pocket Expense Predictor</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Calculate net hospital expenses based on city cost variance factors and insurance policy coverage.
              </p>
            </div>

            <div className="card">
              <form onSubmit={handleRunEstimator}>
                <div className="form-group">
                  <label>Medical Procedure</label>
                  <select 
                    className="select-input" 
                    style={{ width: '100%' }}
                    value={estCode}
                    onChange={(e) => setEstCode(e.target.value)}
                  >
                    <option value="ANGIO-01">Coronary Angioplasty (1 Stent)</option>
                    <option value="CAT-01">Cataract Surgery with Monofocal IOL</option>
                    <option value="KNEE-01">Total Knee Replacement</option>
                    <option value="MRI-BR">MRI Scan Brain with Contrast</option>
                    <option value="APP-01">Laparoscopic Appendectomy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target City</label>
                  <select 
                    className="select-input" 
                    style={{ width: '100%' }}
                    value={estCity}
                    onChange={(e) => setEstCity(e.target.value)}
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Insurance Coverage (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={estInsurance} 
                      onChange={(e) => setEstInsurance(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Policy Deductible / Copay (₹)</label>
                    <input 
                      type="number" 
                      value={estCopay} 
                      onChange={(e) => setEstCopay(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Calculate Net Out-of-Pocket Cost
                </button>
              </form>

              {estResult && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <h3 style={{ color: 'var(--accent-teal-bright)', marginBottom: '1rem' }}>Estimation Calculation Results</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Hospital Package</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{estResult.estimatedHospitalCost?.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Covered by Insurance</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                        ₹{estResult.coveredByInsurance?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ background: 'rgba(244, 63, 94, 0.08)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Predicted Patient Net Out-of-Pocket Expense</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                      ₹{estResult.netEstimatedOutofPocket?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 4: PROCEDURE BENCHMARKS */}
        {activeTab === 'procedures' && (
          <section>
            <h2>🔬 National Procedure Pricing Benchmarks ({treatments.length})</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Standardized cost baselines aggregated across accredited healthcare providers.
            </p>

            <div className="grid-cards">
              {treatments.map((t) => (
                <div key={t._id} className="card">
                  <div>
                    <div className="card-header">
                      <span className="card-title">{t.title}</span>
                      <span className="badge badge-teal">{t.code}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      {t.description}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>National Average Benchmark</div>
                    <div className="price-tag">₹{t.avgCostNational?.toLocaleString('en-IN')}</div>
                    <div className="price-range">Fair Range: ₹{t.fairCostMin?.toLocaleString('en-IN')} - ₹{t.fairCostMax?.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              {authMode === 'login' ? '🔑 Welcome Back' : '✨ Join Sasti-Sehat'}
            </h2>

            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Rahul Sharma"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="patient@sastisehat.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {authMode === 'login' ? (
                <>Don't have an account? <a href="#" style={{ color: 'var(--accent-teal-bright)' }} onClick={() => setAuthMode('register')}>Register</a></>
              ) : (
                <>Already have an account? <a href="#" style={{ color: 'var(--accent-teal-bright)' }} onClick={() => setAuthMode('login')}>Login</a></>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
