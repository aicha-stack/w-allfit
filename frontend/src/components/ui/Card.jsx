export default function Card({ children, as: Tag = 'div', ...props }) {
  return <Tag className="card" {...props}>{children}</Tag>
}


