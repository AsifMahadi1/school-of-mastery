import { z } from "zod";

/**
 * Enrollment form — the single source of truth for the field rules.
 *
 * The SAME schema is used by the client (components/EnrollForm.tsx, for inline
 * errors) and by the API route (app/api/enroll/route.ts), so the two can never
 * drift apart.
 *
 * Phone: the client's own numbers are Bangladeshi mobile numbers, in either
 * international (+8801XXXXXXXXX) or local (01XXXXXXXXX) form.
 */

const phoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

/** Strip the spaces/dashes people paste into phone inputs before validating. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s\-()]/g, "");
}

export const PAYMENT_METHODS = ["bKash", "Nagad"] as const;

export const enrollmentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "That name is too long."),
  // Optional fields arrive as "" and are stored as "" (never undefined), so the
  // Mongo document always has the same shape.
  profession: z.string().trim().max(80, "That is too long."),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((v) => phoneRegex.test(v), {
      message: "Enter a valid Bangladeshi number, e.g. 01342622626 or +8801342622626.",
    }),
  address: z.string().trim().max(120, "That address is too long."),
  paymentMethod: z.enum(PAYMENT_METHODS, { error: "Choose bKash or Nagad." }),
  transactionId: z
    .string()
    .trim()
    .min(4, "Enter the transaction ID or account number.")
    .max(40, "That ID is too long."),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

/** What we store in the `enrollments` collection. */
export type EnrollmentDoc = EnrollmentInput & {
  screenshotUrl: string;
  status: "pending";
  createdAt: Date;
};

/** Client-side field list, so the labels/placeholders live in one place. */
export const enrollFields = {
  fullName: { label: "Full Name", required: true, placeholder: "Abdur Rahman" },
  profession: { label: "Profession", required: false, placeholder: "Teacher" },
  phone: { label: "Phone", required: true, placeholder: "+8801342 622626" },
  address: { label: "Present Address", required: false, placeholder: "Uttara, Dhaka" },
  paymentMethod: { label: "Payment Method", required: true, placeholder: "" },
  transactionId: { label: "Transaction ID/Acc", required: true, placeholder: "DJ55FHRQSZ" },
  screenshot: { label: "Attach Screenshot", required: false, placeholder: "" },
} as const;

export type EnrollFieldName = keyof typeof enrollFields;
