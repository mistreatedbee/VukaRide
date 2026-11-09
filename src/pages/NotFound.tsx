import { PatternBackground } from '../components/brand/PatternBackground'
import { ButtonLink } from '../components/ui'

export default function NotFound() {
  return (
    <section className="bg-brand relative -mt-[72px] overflow-hidden pt-[72px]">
      <PatternBackground pattern="road" tone="dark" />
      <div className="container-vuka relative flex flex-col items-center py-20 text-center lg:py-28">
        <img
          src="/images/404-road.svg"
          width={420}
          height={252}
          alt="A road that ends under a rising sun"
          className="h-auto w-full max-w-[420px] rounded-[28px]"
        />
        <p className="eyebrow mt-10 text-sun">Error 404</p>
        <h1 className="mt-4 max-w-2xl text-[36px] leading-[1.08] font-bold tracking-[-0.02em] text-white sm:text-[52px]">
          This road does not lead anywhere.
        </h1>
        <p className="mt-5 max-w-md text-base leading-[1.7] text-leaf sm:text-lg">
          The page you are looking for has moved or does not exist.
        </p>
        <ButtonLink to="/" variant="sun" className="mt-10">
          Back to home
        </ButtonLink>
      </div>
    </section>
  )
}
