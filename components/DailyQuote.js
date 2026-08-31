'use client'
import { useState, useEffect } from 'react'

const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    field: "Entrepreneur"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    field: "Statesman"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    field: "Diplomat"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    field: "Philosopher"
  },
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt",
    field: "President"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    field: "Physicist"
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    field: "Management Guru"
  },
  {
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    field: "Philosopher"
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    field: "Philosopher"
  },
  {
    text: "What you do today can improve all your tomorrows.",
    author: "Ralph Marston",
    field: "Author"
  },
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    field: "Spiritual Leader"
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
    field: "Philosopher"
  },
  {
    text: "Quality is not an act, it is a habit.",
    author: "Aristotle",
    field: "Philosopher"
  },
  {
    text: "Knowledge speaks, but wisdom listens.",
    author: "Jimi Hendrix",
    field: "Musician"
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    field: "Philosopher"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    field: "President"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    field: "Statesman"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    field: "Spiritual Leader"
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    field: "Entrepreneur"
  },
  {
    text: "The best revenge is massive success.",
    author: "Frank Sinatra",
    field: "Musician"
  },
  {
    text: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
    field: "Industrialist"
  },
  {
    text: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt",
    field: "President"
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
    field: "Inventor"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    field: "Author"
  },
  {
    text: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington",
    field: "Educator"
  },
  {
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    field: "Spiritual Leader"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    field: "Musician"
  },
  {
    text: "Get busy living or get busy dying.",
    author: "Stephen King",
    field: "Author"
  },
  {
    text: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
    field: "Actress"
  },
  {
    text: "Many of life's failures are people who did not realize how close they were to success when they gave up.",
    author: "Thomas Edison",
    field: "Inventor"
  },
  {
    text: "The two most important days in your life are the day you are born and the day you find out why.",
    author: "Mark Twain",
    field: "Author"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    field: "Statesman"
  },
  {
    text: "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
    author: "James Cameron",
    field: "Filmmaker"
  },
  {
    text: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius",
    field: "Philosopher"
  },
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates",
    field: "Philosopher"
  },
  {
    text: "Happiness depends upon ourselves.",
    author: "Aristotle",
    field: "Philosopher"
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    field: "Philosopher"
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    field: "Philosopher"
  },
  {
    text: "I think, therefore I am.",
    author: "René Descartes",
    field: "Philosopher"
  },
  {
    text: "One cannot step twice in the same river.",
    author: "Heraclitus",
    field: "Philosopher"
  },
  {
    text: "The more I read, the more I acquire, the more certain I am that I know nothing.",
    author: "Voltaire",
    field: "Philosopher"
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    field: "Philosopher"
  },
  {
    text: "The greatest wealth is to live content with little.",
    author: "Plato",
    field: "Philosopher"
  },
  {
    text: "It is not that I'm so smart. But I stay with the questions much longer.",
    author: "Albert Einstein",
    field: "Physicist"
  },
  {
    text: "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
    author: "Albert Einstein",
    field: "Physicist"
  },
  {
    text: "Imagination is more important than knowledge.",
    author: "Albert Einstein",
    field: "Physicist"
  },
  {
    text: "Everything should be made as simple as possible, but not simpler.",
    author: "Albert Einstein",
    field: "Physicist"
  },
  {
    text: "The true sign of intelligence is not knowledge but imagination.",
    author: "Albert Einstein",
    field: "Physicist"
  },
  {
    text: "Education is what remains after one has forgotten what one has learned in school.",
    author: "Albert Einstein",
    field: "Physicist"
  },
  {
    text: "Try not to become a man of success. Rather become a man of value.",
    author: "Albert Einstein",
    field: "Physicist"
  }
]

export default function DailyQuote() {
  const [quote, setQuote] = useState(null)
  const [themeIndex, setThemeIndex] = useState(0)

  const themes = [
    { 
      border: '#FF6B6B', 
      glow: '#FF6B6B', 
      bg: 'linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 50%, #1a0a0a 100%)',
      accent: '#FF6B6B',
      shadow: 'rgba(255, 107, 107, 0.3)'
    },
    { 
      border: '#FFA07A', 
      glow: '#FFA07A', 
      bg: 'linear-gradient(135deg, #1a100a 0%, #2d1a0a 50%, #1a100a 100%)',
      accent: '#FFA07A',
      shadow: 'rgba(255, 160, 122, 0.3)'
    },
    { 
      border: '#50C878', 
      glow: '#50C878', 
      bg: 'linear-gradient(135deg, #0a1a10 0%, #0a2d1a 50%, #0a1a10 100%)',
      accent: '#50C878',
      shadow: 'rgba(80, 200, 120, 0.3)'
    },
    { 
      border: '#87CEEB', 
      glow: '#87CEEB', 
      bg: 'linear-gradient(135deg, #0a0a1a 0%, #0a1a2d 50%, #0a0a1a 100%)',
      accent: '#87CEEB',
      shadow: 'rgba(135, 206, 235, 0.3)'
    }
  ]

  useEffect(() => {
    // Get today's date as a number (1-365)
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now - start
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)
    
    // Use day of year to get a consistent quote for the day
    const quoteIndex = dayOfYear % quotes.length
    setQuote(quotes[quoteIndex])
    setThemeIndex(dayOfYear % themes.length)
  }, [])

  if (!quote) return null

  const theme = themes[themeIndex]

  return (
    <div style={{
      maxWidth: '800px',
      margin: '60px auto',
      padding: '0 20px'
    }}>
      <style jsx>{`
        @keyframes quoteBoxPulse {
          0%, 100% { 
            box-shadow: 0 0 40px ${theme.shadow}, 0 0 80px ${theme.shadow}33, inset 0 0 40px ${theme.shadow}22;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 60px ${theme.shadow}, 0 0 100px ${theme.shadow}55, inset 0 0 60px ${theme.shadow}44;
            transform: scale(1.02);
          }
        }
        
        @keyframes borderRotate {
          0% { border-color: ${theme.border}; }
          25% { border-color: ${theme.glow}; }
          50% { border-color: ${theme.accent}; }
          75% { border-color: ${theme.glow}; }
          100% { border-color: ${theme.border}; }
        }
        
        @keyframes quoteFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .quote-box {
          background: ${theme.bg};
          border: 3px solid ${theme.border};
          border-radius: 25px;
          padding: 50px 40px 40px 40px;
          position: relative;
          overflow: hidden;
          animation: quoteBoxPulse 3s ease-in-out infinite, borderRotate 6s linear infinite;
        }
        
        .quote-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${theme.shadow}44, transparent);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .quote-text {
          animation: quoteFadeIn 1s ease-out;
        }
        
        .quote-mark {
          position: absolute;
          top: 10px;
          left: 20px;
          font-size: 150px;
          color: ${theme.border};
          opacity: 0.15;
          font-family: Georgia, serif;
          line-height: 1;
          animation: quoteFadeIn 1.5s ease-out;
        }
        
        .daily-badge {
          animation: quoteFadeIn 2s ease-out;
        }
      `}</style>

      <div className="quote-box">
        {/* Decorative Quote Mark */}
        <div className="quote-mark">"</div>

        {/* Shine Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, transparent 40%, ${theme.shadow}22 50%, transparent 60%)`,
          pointerEvents: 'none'
        }} />

        {/* Quote Text */}
        <p className="quote-text" style={{
          fontSize: '22px',
          color: '#FFFFFF',
          fontStyle: 'italic',
          lineHeight: '1.6',
          marginBottom: '25px',
          position: 'relative',
          zIndex: '1',
          textShadow: `0 0 10px ${theme.glow}44`
        }}>
          {quote.text}
        </p>

        {/* Author */}
        <div className="quote-text" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          position: 'relative',
          zIndex: '1',
          animationDelay: '0.3s'
        }}>
          <div style={{
            width: '50px',
            height: '3px',
            background: theme.border,
            boxShadow: `0 0 15px ${theme.glow}`,
            borderRadius: '2px'
          }} />
          <div>
            <p style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: theme.glow,
              textShadow: `0 0 15px ${theme.glow}66`
            }}>
              {quote.author}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#CCCCCC',
              letterSpacing: '1px'
            }}>
              {quote.field}
            </p>
          </div>
        </div>

        {/* Daily Badge */}
        <div className="daily-badge" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: `linear-gradient(135deg, ${theme.border}, ${theme.glow})`,
          color: 'white',
          padding: '8px 20px',
          borderRadius: '25px',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          boxShadow: `0 0 25px ${theme.glow}66`,
          zIndex: '2',
          border: `1px solid ${theme.glow}`
        }}>
          ✦ DAILY QUOTE ✦
        </div>

        {/* Decorative Corner Lines */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          width: '30px',
          height: '30px',
          borderTop: `2px solid ${theme.glow}`,
          borderLeft: `2px solid ${theme.glow}`,
          borderRadius: '5px 0 0 0'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          width: '30px',
          height: '30px',
          borderBottom: `2px solid ${theme.glow}`,
          borderRight: `2px solid ${theme.glow}`,
          borderRadius: '0 0 5px 0'
        }} />
      </div>
    </div>
  )
}