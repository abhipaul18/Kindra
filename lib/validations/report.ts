import { z } from 'zod';

export const reportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Please provide at least 10 characters describing the issue'),
  category_id: z.string().min(1, 'Please select an issue category'),
  location_name: z.string().min(3, 'Please enter a location or address'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;
