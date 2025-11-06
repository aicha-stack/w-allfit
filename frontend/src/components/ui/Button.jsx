export default function Button({ children, variant = 'primary', ...props }) {
  const className = `btn ${variant === 'secondary' ? 'btn-secondary' : ''}`
  return <button className={className} {...props}>{children}</button>
}


