import { Wallet } from 'lucide-react'

import { Card, PageTitle } from '../ui'

export default function Earnings() {
  return (
    <>
      <PageTitle title="Earnings" intro="Your trips, weekly statements and payouts will appear here." />
      <Card className="mt-8 max-w-2xl">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-deep text-white">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-deep">Nothing to show yet</h2>
            <p className="mt-2 leading-[1.7] text-slate">
              Earnings start to show once you are approved and have completed trips in the Vuka Ride driver app. [Weekly statements and
              payouts: connect to the app’s trip data when it is added to this project.]
            </p>
          </div>
        </div>
      </Card>
    </>
  )
}
