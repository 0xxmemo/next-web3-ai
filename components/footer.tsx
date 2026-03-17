'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Footer, type FooterLink } from 'liquidcn'

const footerLinks: FooterLink[] = [
  {
    name: 'Documentation',
    href: 'https://nextjs.org/docs',
    icon: FileText,
    showLabel: true,
  },
]

export function AppFooter() {
  return (
    <Footer
      links={footerLinks}
      linkComponent={Link}
    />
  )
}
