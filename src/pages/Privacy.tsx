import { LegalLayout } from '../components/LegalLayout'
import { PRIVACY_SECTIONS } from '../content/legal'

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="This policy explains what information Vuka Ride collects, why, who sees it, and the choices you have. The sections below are an outline until the final legal text is added."
      sections={PRIVACY_SECTIONS}
    />
  )
}
