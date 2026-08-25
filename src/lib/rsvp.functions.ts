import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const rsvpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  attendance: z.enum(["yes", "no", "maybe"]),
  guestCount: z.number().int().min(1).max(20),
  dietary: z.string().optional(),
  message: z.string().optional(),
});

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((data) => rsvpSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) {
      throw new Error("Backend not configured");
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.from("rsvp_responses").insert({
      name: data.name,
      attendance: data.attendance,
      guest_count: data.guestCount,
      dietary: data.dietary || null,
      message: data.message || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });
