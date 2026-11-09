import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { Link, Route } from '../nav'

/** Fade and rise as a section scrolls into view. Off under reduced motion. */
export function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = 'light',
  align = 'center',
  id,
}: {
  eyebrow?: string
  title: React.ReactNode
  intro?: React.ReactNode
  tone?: 'light' | 'dark'
  align?: 'center' | 'left'
  id?: string
}) {
  const dark = tone === 'dark'
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      {eyebrow && <p className={`eyebrow ${dark ? 'text-sun' : 'text-green-600'}`}>{eyebrow}</p>}
      <h2 id={id} className={`h2-display mt-3 ${dark ? 'text-white' : 'text-deep'}`}>
        {title}
      </h2>
      {intro && <p className={`mt-4 text-base leading-[1.7] sm:text-lg ${dark ? 'text-leaf' : 'text-slate'}`}>{intro}</p>}
    </div>
  )
}

type ButtonVariant = 'sun' | 'green' | 'deep' | 'outline-light'

const VARIANTS: Record<ButtonVariant, string> = {
  sun: 'bg-sun text-ink',
  green: 'bg-green-600 text-white',
  deep: 'bg-deep text-white',
  'outline-light': 'border border-white/40 text-white hover:bg-white/10',
}

const BASE =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold whitespace-nowrap transition-[filter,transform,background-color] duration-150 ease-out hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70'

export function ButtonLink({ to, variant = 'sun', children, className = '' }: { to: Route; variant?: ButtonVariant; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Button({
  variant = 'green',
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest} />
}

/** Icon in a deep-green rounded square, title and copy. */
export function FeatureCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-mist p-7 sm:p-8">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-deep text-white">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-6 text-xl font-semibold text-deep sm:text-[22px]">{title}</h3>
      <p className="mt-2 leading-[1.7] text-slate">{children}</p>
    </div>
  )
}

/** White bordered card with a gold step number. */
export function StepCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex h-full flex-col rounded-3xl border border-green-100 bg-white p-7 sm:p-8">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-sun text-lg font-bold text-ink" aria-hidden="true">
        {n}
      </span>
      <h3 className="mt-6 text-xl font-semibold text-deep sm:text-[22px]">
        <span className="sr-only">Step {n}: </span>
        {title}
      </h3>
      <p className="mt-2 leading-[1.7] text-slate">{children}</p>
    </li>
  )
}

/** Visible placeholder for content the team still has to supply. */
export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-sun/20 px-1 font-medium text-inherit">{children}</span>
}
