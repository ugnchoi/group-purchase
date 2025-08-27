import { z } from "zod";
import { parsePhoneNumber } from "libphonenumber-js";

// Phone number validation with libphonenumber-js
const phoneSchema = z.string().refine((value) => {
  try {
    const phoneNumber = parsePhoneNumber(value);
    return phoneNumber && phoneNumber.isValid();
  } catch {
    return false;
  }
}, "Invalid phone number format");

export const OrderInput = z.object({
  name: z.string().min(1, "Name is required"),
  phone: phoneSchema,
  campaignId: z.string().min(1, "Campaign ID is required"),
  unit: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, "Consent is required"),
});

export const NotifyInput = z.object({
  name: z.string().optional(),
  phone: phoneSchema,
  building: z.string().optional(),
});

export type OrderInputType = z.infer<typeof OrderInput>;
export type NotifyInputType = z.infer<typeof NotifyInput>;
