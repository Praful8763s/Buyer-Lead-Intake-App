import { z } from 'zod'

export const buyerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address').max(100),
  phone: z.string().min(1, 'Phone is required').max(15),
  city: z.enum(['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad']),
  property_type: z.enum(['apartment', 'villa', 'plot', 'commercial']),
  bhk: z.enum(['1bhk', '2bhk', '3bhk', '4bhk', '5bhk']).optional(),
  purpose: z.enum(['buy', 'rent', 'investment']),
  budget_min: z.number().min(0, 'Budget must be positive'),
  budget_max: z.number().min(0, 'Budget must be positive'),
  timeline: z.enum(['immediate', '1month', '3months', '6months', '1year']),
  source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'walk_in']),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => {
  // BHK required for apartments and villas
  if (['apartment', 'villa'].includes(data.property_type) && !data.bhk) {
    return false
  }
  return true
}, {
  message: 'BHK is required for apartments and villas',
  path: ['bhk']
}).refine((data) => {
  // Budget max >= budget min
  return data.budget_max >= data.budget_min
}, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budget_max']
})

export type BuyerFormData = z.infer<typeof buyerSchema>

export const searchSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.string().optional(),
  status: z.string().optional(),
  timeline: z.string().optional(),
  page: z.number().optional(),
  ordering: z.string().optional(),
})

export type SearchParams = z.infer<typeof searchSchema>