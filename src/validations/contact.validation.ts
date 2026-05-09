import { z } from "zod"

export const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  phoneNumber: z.string().min(10, "Please enter a valid phone number").max(15),
  ext: z.string().max(10).optional(),
  state: z.string().min(1, "Please select a state"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters").max(10),
  contactPreference: z.enum(["phone", "email"], {
    message: "Please select a contact preference",
  }),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  businessEmail: z.string().min(1, "Business email is required").email("Please enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  comments: z.string().max(500).optional(),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
