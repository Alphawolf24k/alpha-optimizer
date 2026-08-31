export default function NeonButton({ text, onClick, href }) {
  if (href) {
    return (
      <a href={href} className="neon-button">
        {text}
      </a>
    )
  }
  
  return (
    <button className="neon-button" onClick={onClick}>
      {text}
    </button>
  )
}