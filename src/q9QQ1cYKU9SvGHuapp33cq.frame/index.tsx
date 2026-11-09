import React from 'react'

import { Route } from '../shared/nav'
import { LegalLayout } from '../shared/components/LegalLayout'

export const args = {
  lastUpdated: '[date]',
}

export const argTypes = {
  lastUpdated: { control: 'text' },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

export default function PrivacyPolicy(props: Props) {
  const { lastUpdated, onNavigate } = { ...args, ...props }
  return (
    <LegalLayout
      current="privacy"
      onNavigate={onNavigate}
      title="Privacy Policy"
      lastUpdated={lastUpdated}
      intro="This policy explains what information Vuka Ride collects, why, and the choices you have. The sections below are placeholders for the final legal text."
      sections={[
        { id: 'who-we-are', title: 'Who we are', placeholder: '[Insert Privacy Policy text: company name, registration and contact details]' },
        { id: 'information-we-collect', title: 'Information we collect', placeholder: '[Insert Privacy Policy text: account, location, trip, payment and device information]' },
        { id: 'how-we-use-it', title: 'How we use your information', placeholder: '[Insert Privacy Policy text]' },
        { id: 'sharing', title: 'Sharing your information', placeholder: '[Insert Privacy Policy text: drivers, riders, service providers, authorities]' },
        { id: 'retention', title: 'How long we keep it', placeholder: '[Insert Privacy Policy text: retention periods]' },
        { id: 'your-rights', title: 'Your rights and choices', placeholder: '[Insert Privacy Policy text: access, correction, deletion, objection]' },
        { id: 'security', title: 'Security', placeholder: '[Insert Privacy Policy text]' },
        { id: 'contact-us', title: 'Contact us', placeholder: '[Insert Privacy Policy text: information officer and contact details]' },
      ]}
    />
  )
}
