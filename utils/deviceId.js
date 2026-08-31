export function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem('deviceId')
  
  if (!deviceId) {
    // Create a unique device ID that's very hard to change
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown',
      new Date().getTimezoneOffset(),
      !!navigator.webdriver,
      navigator.maxTouchPoints || 0
    ]
    
    // Generate a hash-like ID
    deviceId = 'AO-' + btoa(components.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
    
    // Add random component to make it unique per browser
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    deviceId = deviceId + '-' + randomPart
    
    localStorage.setItem('deviceId', deviceId)
  }
  
  return deviceId
}