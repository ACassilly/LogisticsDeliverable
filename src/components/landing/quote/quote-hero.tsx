import { QuoteForm } from "./quote-form"

export function QuoteHero() {
  return (
    <section className="w-full min-h-[calc(100vh-100px)] py-12 lg:py-20 bg-[url('/images/hero/pattern-bg.svg')] bg-center bg-no-repeat bg-cover flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-white pointer-events-none" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="w-full bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100/50">
            <QuoteForm />
          </div>
        </div>
      </div>
    </section>
  )
}
