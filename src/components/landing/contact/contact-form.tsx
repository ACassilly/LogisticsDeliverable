"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contactFormSchema, type ContactFormData } from "@/validations/contact.validation"
import { US_STATES } from "@/constants/service-areas"
import { useToast } from "@/hooks"
import { submitContactForm } from "@/services/contact.service"

const COUNTRIES = ["United States", "Canada", "Mexico"]

const SERVICES = [
  "Dedicated Contract Services",
  "Managed Logistics",
  "Final Mile Services",
  "Specialized Services",
  "Intermodal",
  "Temperature Controlled",
  "International",
  "Truckload/500lbs",
  "Less Than Truckload",
  "Other/I'm not sure",
]

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactPreference, setContactPreference] = useState<"phone" | "email">("phone")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      contactPreference: "phone",
      services: [],
    },
  })

  const toggleService = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service]
    
    setSelectedServices(newServices)
    setValue("services", newServices, { shouldValidate: true })
  }

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const response = await submitContactForm(data)
      if (response.success) {
        toast({
          title: "Inquiry Submitted!",
          description: response.message || "Our team will be in touch shortly.",
        })
        reset()
        setSelectedServices([])
        setContactPreference("phone")
      } else {
        toast({
          title: "Submission Failed",
          description: response.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your inquiry. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full py-20 lg:py-30 bg-white">
      <div className="w-full max-w-[70rem] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mt-6 mb-8 lg:mb-12">
          <h1 
            className="font-syne text-[40px] font-semibold text-black leading-[130%] mb-4"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignSelf: 'stretch',
              textAlign: 'center',
            }}
          >
            Connect With Our Logistics Team
          </h1>
          <p className="text-[#00000085] text-base sm:text-lg mb-4">
            Reach out for instant freight quotes, pricing, and tailored solutions for your business
          </p>
          <div className="flex items-center justify-center gap-2 text-base sm:text-lg">
            <span className="text-[--text-gray]">Need a quote FAST</span>
            <span className="text-[--text-gray]">→</span>
            <Link
              href="/quote"
              className=" text-[#008C2F] font-medium underline hover:underline"
            >
              Get an instant quote
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className=" space-y-6  ">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full ">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="First Name"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Phone Number, Ext, State, Zip Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <div className="sm:col-span-2 lg:col-span-1 space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number<span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                placeholder="Phone Number"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ext">Ext</Label>
              <Input
                id="ext"
                placeholder="Ext"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("ext")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">
                State<span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value: string) => setValue("state", value, { shouldValidate: true })}>
                <SelectTrigger 
                  id="state" 
                  className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] text-[--text-gray-light] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                >
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">
                Zip Code<span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                placeholder="Zip Code"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("zipCode")}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-500">{errors.zipCode.message}</p>
              )}
            </div>
          </div>

          {/* Contact Preference */}
          <div className="space-y-3">
            <Label>
              How would you like to be contacted?<span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setContactPreference("phone")
                  setValue("contactPreference", "phone", { shouldValidate: true })
                }}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  contactPreference === "phone"
                    ? "bg-[#0B0B0B] text-white"
                    : "bg-white text-[--text-primary] border border-[--border-contact]"
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactPreference("email")
                  setValue("contactPreference", "email", { shouldValidate: true })
                }}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  contactPreference === "email"
                    ? "bg-[#0B0B0B] text-white"
                    : "bg-white text-[--text-primary] border border-[--border-contact]"
                }`}
              >
                Email
              </button>
            </div>
            {errors.contactPreference && (
              <p className="text-sm text-red-500">{errors.contactPreference.message}</p>
            )}
          </div>

          {/* Company Name & Business Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Company Name"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("companyName")}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessEmail">
                Business Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessEmail"
                type="email"
                placeholder="Business Email"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("businessEmail")}
              />
              {errors.businessEmail && (
                <p className="text-sm text-red-500">{errors.businessEmail.message}</p>
              )}
            </div>
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="country">
                Country<span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value: string) => setValue("country", value, { shouldValidate: true })}>
                <SelectTrigger 
                  id="country" 
                  className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] text-[--text-gray-light] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                >
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City<span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="City"
                className="h-[50px] rounded-xl border-[--border-contact] bg-[--bg-contact-input] focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]"
                {...register("city")}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label>
              Select Services Below<span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedServices.includes(service)
                      ? "bg-[#0B0B0B] text-white"
                      : "bg-white text-[--text-primary] border border-[#CECECE]"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
            {errors.services && (
              <p className="text-sm text-red-500">{errors.services.message}</p>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <textarea
              id="comments"
              placeholder="Enter your comments here..."
              className="w-full min-h-[120px] p-4 rounded-xl border border-[--border-contact] bg-[--bg-contact-input] text-base text-[--text-primary] placeholder:text-[--text-gray-light] focus:outline-none focus:ring-2 focus:ring-[--brand-primary] focus:border-[--brand-primary] resize-none transition-all"
              {...register("comments")}
            />
            {errors.comments && (
              <p className="text-sm text-red-500">{errors.comments.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[50px] w-[17rem] rounded-[35px] bg-gradient-to-r from-[#32925B] via-[#3BAB6B] to-[#32925B] text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(270deg, #32925B 0%, #3BAB6B 51.44%, #32925B 100%)",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit form"}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
