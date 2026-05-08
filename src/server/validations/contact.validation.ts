import { z } from 'zod';

export const contactApiSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50, 'Last name cannot exceed 50 characters'),
  phoneNumber: z.string().trim().min(10, 'Please enter a valid phone number').max(15),
  ext: z.string().trim().max(10).optional().or(z.literal('')),
  state: z.string().trim().min(1, 'Please select a state'),
  zipCode: z.string().trim().min(5, 'Zip code must be at least 5 characters').max(10),
  contactPreference: z.enum(['phone', 'email'], { message: 'Please select a contact preference' }),
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(100),
  businessEmail: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  country: z.string().trim().min(1, 'Please select a country'),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  comments: z.string().trim().max(500).optional().or(z.literal('')),
});

export type ContactApiInput = z.infer<typeof contactApiSchema>;
