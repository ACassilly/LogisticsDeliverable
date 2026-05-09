"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { US_CITIES, US_STATES, splitIntoChunks } from "@/constants/service-areas"

export function ServiceAreasSection() {
  const [activeTab, setActiveTab] = useState<"cities" | "states">("cities")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter data based on search query
  const filteredCities = US_CITIES.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredStates = US_STATES.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Split into 3 rows for carousel
  const cityRows = splitIntoChunks(filteredCities, 3)
  const stateRows = splitIntoChunks(filteredStates, 3)

  const displayData = activeTab === "cities" ? cityRows : stateRows

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-[--text-primary] mb-4">
            Service Areas
          </h2>
          <p className="text-[--text-gray] text-base sm:text-lg max-w-3xl mx-auto">
            Providing reliable freight and logistics solutions across major cities
            and states nationwide.
          </p>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* Search Input */}
          <div className="relative w-full sm:w-[570px]">
            <Search className="absolute left-[22px] top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Check if your City/State is available"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[50px] pl-[50px] pr-[22px] py-2.5 rounded-[26px] border border-[--border-gray] bg-[--bg-off-white] flex items-center justify-between"
            />
          </div>

          {/* Cities/States Toggle */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "cities" | "states")}>
            <TabsList className="bg-transparent p-0 gap-2 h-auto">
              <TabsTrigger
                value="cities"
                className="w-[93px] h-[49px] flex justify-center items-center gap-2.5 rounded-[35px] bg-[--bg-light-gray-2] text-black data-[state=active]:bg-[--bg-dark] data-[state=active]:text-white transition-all"
              >
                Cities
              </TabsTrigger>
              <TabsTrigger
                value="states"
                className="w-[93px] h-[49px] flex justify-center items-center gap-2.5 rounded-[35px] bg-[--bg-light-gray-2] text-black data-[state=active]:bg-[--bg-dark] data-[state=active]:text-white transition-all"
              >
                States
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Carousel Rows */}
        <div className="space-y-6">
          {displayData.map((row, rowIndex) => (
            <div key={rowIndex} className="relative w-full overflow-hidden">
              {/* Gradient Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              <div className="flex overflow-hidden">
                {/* First set */}
                <div
                  className="flex items-center shrink-0 gap-3 pr-3"
                  style={{
                    animation: `scroll-${rowIndex % 2 === 0 ? "left" : "right"} 50s linear infinite`,
                  }}
                >
                  {row.map((location, idx) => (
                    <span
                      key={`first-${idx}`}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-[#E8F5ED] text-[#3BAB6B] text-sm font-medium whitespace-nowrap hover:bg-[#3BAB6B] hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {location}
                    </span>
                  ))}
                </div>

                {/* Second set for seamless loop */}
                <div
                  className="flex items-center shrink-0 gap-3 pr-3"
                  style={{
                    animation: `scroll-${rowIndex % 2 === 0 ? "left" : "right"} 50s linear infinite`,
                  }}
                >
                  {row.map((location, idx) => (
                    <span
                      key={`second-${idx}`}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-[#E8F5ED] text-[#3BAB6B] text-sm font-medium whitespace-nowrap hover:bg-[#3BAB6B] hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  )
}
