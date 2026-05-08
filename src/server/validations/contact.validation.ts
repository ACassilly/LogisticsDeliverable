import { z } from 'zod';

export const contactApiSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  phoneNumber: z.string().trim().min(10).max(15),
  ext: z.string().trim().max(10).optional().or(z.literal('')),
  state: z.string().trim().min(1, 'Please select a state'),
  zipCode: z.string().trim().min(5).max(10),
  contactPreference: z.enum(['phone', 'email'], { message: 'Please select a contact preference' }),
  companyName: z.string().trim().min(2).max(100),
  businessEmail: z.string().trim().min(1).email('Please enter a valid email address'),
  country: z.string().trim().min(1, 'Please select a country'),
  city: z.string().trim().min(2).max(100),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  comments: z.string().trim().max(500).optional().or(z.literal('')),
});

export type ContactApiInput = z.infer<typeof contactApiSchema>;
