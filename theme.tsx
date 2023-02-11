import type { NextraThemeLayoutProps } from 'nextra'
 
export default function Layout({ children }: NextraThemeLayoutProps) {
  return (
    <div className={`body`}>
      <h1>My Theme</h1>
      <div style={{ border: '1px solid' }}>
        {children}
      </div>
    </div>
  )
}