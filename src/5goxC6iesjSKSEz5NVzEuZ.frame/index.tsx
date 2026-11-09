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

export default function TermsOfService(props: Props) {
  const { lastUpdated, onNavigate } = { ...args, ...props }
  return (
    <LegalLayout
      current="terms"
      onNavigate={onNavigate}
      title="Terms of Service"
      lastUpdated={lastUpdated}
      intro="These terms set out the agreement between you and Vuka Ride when you use the app and website. The sections below are placeholders for the final legal text."
      sections={[
        { id: 'acceptance', title: 'Accepting these terms', placeholder: '[Insert Terms of Service text]' },
        { id: 'the-service', title: 'The Vuka Ride service', placeholder: '[Insert Terms of Service text]' },
        { id: 'accounts', title: 'Your account', placeholder: '[Insert Terms of Service text]' },
        { id: 'fares-payments', title: 'Fares and payments', placeholder: '[Insert Terms of Service text: fares, cancellations, refunds]' },
        { id: 'conduct', title: 'Rider and driver conduct', placeholder: '[Insert Terms of Service text]' },
        { id: 'liability', title: 'Liability', placeholder: '[Insert Terms of Service text]' },
        { id: 'termination', title: 'Suspension and termination', placeholder: '[Insert Terms of Service text]' },
        { id: 'governing-law', title: 'Governing law', placeholder: '[Insert Terms of Service text]' },
        { id: 'changes', title: 'Changes to these terms', placeholder: '[Insert Terms of Service text]' },
      ]}
    />
  )
}
