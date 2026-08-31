'use client'
import Navbar from '../../components/Navbar'
import NeonButton from '../../components/NeonButton'
import { useState, useEffect } from 'react'

export default function Pricing() {
  const [currency, setCurrency] = useState('PKR')
  const [rate, setRate] = useState(1)
  const [symbol, setSymbol] = useState('Rs.')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrencyRate()
  }, [])

  const fetchCurrencyRate = async () => {
    try {
      // Try to get user's country from IP
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      const countryCode = data.currency || 'PKR'
      
      // Fetch live exchange rates
      const rateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/PKR')
      const rateData = await rateResponse.json()
      
      setCurrency(countryCode)
      setRate(rateData.rates[countryCode] || 1)
      setSymbol(getCurrencySymbol(countryCode))
      setLoading(false)
    } catch (error) {
      console.log('Using default PKR')
      setLoading(false)
    }
  }

  const getCurrencySymbol = (code) => {
    const symbols = {
      PKR: 'Rs.',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED ',
      SAR: 'SAR ',
      INR: '₹',
      BDT: '৳',
      MYR: 'RM ',
      IDR: 'Rp ',
      NGN: '₦',
      EGP: 'EGP ',
      TRY: '₺',
      BRL: 'R$',
      PHP: '₱',
      THB: '฿',
      VND: '₫',
      KRW: '₩',
      JPY: '¥',
      CNY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      NZD: 'NZ$',
      SGD: 'S$',
      HKD: 'HK$',
      ZAR: 'R ',
      KES: 'KSh ',
      GHS: 'GH₵ ',
      UGX: 'USh ',
      TZS: 'TSh ',
      ETB: 'Br ',
      LKR: 'Rs. ',
      NPR: 'Rs. ',
      MMK: 'K ',
      KHR: '៛ ',
      LAK: '₭ ',
      MNT: '₮ ',
      UZS: 'soʻm ',
      KZT: '₸ ',
      AZN: '₼ ',
      GEL: '₾ ',
      UAH: '₴ ',
      RON: 'lei ',
      PLN: 'zł ',
      CZK: 'Kč ',
      HUF: 'Ft ',
      SEK: 'kr ',
      NOK: 'kr ',
      DKK: 'kr ',
      ISK: 'kr ',
      CHF: 'Fr ',
      MXN: 'MX$ ',
      COP: 'COL$ ',
      PEN: 'S/ ',
      CLP: 'CLP$ ',
      ARS: 'AR$ ',
      QAR: 'QR ',
      KWD: 'KD ',
      BHD: 'BD ',
      OMR: 'OMR ',
      JOD: 'JD ',
      LBP: 'L£ ',
      IQD: 'IQD ',
      AFN: '؋ ',
      IRR: '﷼ '
    }
    return symbols[code] || code + ' '
  }

  const convertPrice = (pkrAmount) => {
    if (currency === 'PKR') return `Rs. ${pkrAmount.toLocaleString()}`
    const converted = (pkrAmount * rate)
    return `${symbol}${converted.toFixed(2)}`
  }

  return (
    <>
      <div className="animated-grid"></div>
      <Navbar />
      <main className="container">
        <h1 className="hero-title" style={{ textAlign: 'center', marginTop: '60px' }}>
          Choose Your <span className="glow-text">License</span>
        </h1>
        
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8' }}>
            Loading pricing in your currency...
          </p>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>
            Showing prices in {currency}
          </p>
        )}

        <div className="grid" style={{ marginTop: '60px', maxWidth: '800px', margin: '60px auto' }}>
          {/* Trial Plan */}
          <div className="card">
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Trial</h2>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>
              Free
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>One time use</p>
            <ul style={{ listStyle: 'none', marginBottom: '30px' }}>
              <li style={{ padding: '8px 0', color: '#94a3b8' }}>
                ✓ All features available
              </li>
            </ul>
            <NeonButton 
              text="Start Trial" 
              href="https://wa.me/923275452698?text=I want a free trial license for Alpha Optimizer" 
            />
          </div>

          {/* Lifetime Plan */}
          <div className="card" style={{ 
            border: '2px solid var(--cyber-orange)',
            position: 'relative',
            boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)',
            paddingTop: '35px'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'var(--cyber-orange)',
              padding: '5px 15px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '14px',
              color: 'white',
              boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
              zIndex: '1',
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}>
              BEST VALUE
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Lifetime</h2>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>
              {loading ? 'Loading...' : convertPrice(2000)}
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Forever</p>
            <ul style={{ listStyle: 'none', marginBottom: '30px' }}>
              <li style={{ padding: '8px 0', color: '#94a3b8' }}>✓ Everything in Pro</li>
              <li style={{ padding: '8px 0', color: '#94a3b8' }}>✓ Lifetime updates</li>
              <li style={{ padding: '8px 0', color: '#94a3b8' }}>✓ All future features</li>
              <li style={{ padding: '8px 0', color: '#94a3b8' }}>✓ VIP support</li>
            </ul>
            <NeonButton 
              text="Buy Now" 
              href="https://wa.me/923275452698?text=I want to buy the Lifetime license for Alpha Optimizer" 
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <a 
            href="https://www.instagram.com/Alphawolf24k" 
            target="_blank" 
            rel="noopener noreferrer"
            className="instagram-button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Follow on Instagram for Updates
          </a>
        </div>
      </main>
    </>
  )
}