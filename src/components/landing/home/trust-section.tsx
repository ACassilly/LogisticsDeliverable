import { Award, CircleCheckBig, Lock, Shield } from "lucide-react";

export function TrustSection() {
  const stats = [
    { value: "60s", label: "Quote Time" },
    { value: "18%", label: "Avg Savings" },
    { value: "98.5%", label: "On-Time" }
  ];

  const credentials = [
    {
      title: "Licensed & Bonded",
      subtitle: "FMCSA MC Authority",
      icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#008C2F]"/>
    },
    {
      title: "Top Rated 3PL",
      subtitle: "5-Star Customer Rating",
      icon: <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#008C2F]"/>
    },
    {
      title: "Verified Carriers",
      subtitle: "100% Background Checked",
      icon: <CircleCheckBig className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#008C2F]"/>
    },
    {
      title: "Cargo Insurance",
      subtitle: "Full Coverage Protection",
      icon: <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#008C2F]"/>
    }
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-375 mx-auto  trust-section-bg border-b-2 border-b-(--primary-dark)/60 border-l-(--primary-dark)/60 border-r-(--primary-dark)/60 p-6 sm:p-8 md:p-10 lg:p-12 ">
        <div className=" mx-auto text-center">
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-semibold text-(--text-primary) mb-8 sm:mb-10 md:mb-12 lg:mb-16 leading-[130%]">
            Delivering Smarter Freight  
            <span className="text-gradient-impact block ml-1.5 ">
              and Measurable Impact
            </span>
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 mb-8 sm:mb-12 md:mb-16 border-b-2 border-b-(--primary-dark)/60 max-w-[60rem] mx-auto pb-8 sm:pb-12 md:pb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-gradient-stats">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {credentials.map((cred, index) => (
              <div key={index} className="text-center ">
                <div className="mx-auto flex items-center  justify-center w-20.25 h-30 sm:h-35 md:h-39.5 rounded-tr-[50px] rounded-tl-[50px] credential-icon-bg mb-3 sm:mb-4">
                  {cred.icon}
                </div>
                <h4 className="font-semibold text-sm sm:text-base text-(--text-primary) mb-1">
                  {cred.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {cred.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
