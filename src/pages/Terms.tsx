import { LegalLayout } from '../components/LegalLayout'
import { TERMS_SECTIONS } from '../content/legal'

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="These terms set out the agreement between you and Vuka Ride when you use the app and website. The sections below are an outline until the final legal text is added."
      sections={TERMS_SECTIONS}
    />
  )
}
