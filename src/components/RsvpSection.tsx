import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "motion/react";
import { Send, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { submitRsvp } from "@/lib/rsvp.functions";
import { useLanguage } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const MAX_GUESTS = 20;

export function RsvpSection() {
  const { t, lang } = useLanguage();
  const submit = useServerFn(submitRsvp);
  const [submitted, setSubmitted] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, lang === "ar" ? "الاسم مطلوب" : "Name is required"),
    attendance: z.enum(["yes", "no", "maybe"]),
    guestCount: z.coerce
      .number()
      .int()
      .min(1, lang === "ar" ? "يجب أن يكون 1 على الأقل" : "Must be at least 1")
      .max(MAX_GUESTS, lang === "ar" ? `بحد أقصى ${MAX_GUESTS}` : `Maximum ${MAX_GUESTS}`),
    dietary: z.string().optional(),
    message: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      attendance: "yes",
      guestCount: 1,
      dietary: "",
      message: "",
    },
  });

  const isAttending = form.watch("attendance") !== "no";

  async function onSubmit(values: FormValues) {
    try {
      await submit({ data: values });
      setSubmitted(true);
      toast.success(t("rsvpSuccess"));
      form.reset();
    } catch (err) {
      toast.error(t("rsvpError"));
      console.error("RSVP submission failed:", err);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      className="rounded-lg border border-sage/30 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm md:p-12"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage/30">
        <Send className="h-7 w-7 text-sage-dark" />
      </div>
      <h2 className="font-display mb-2 text-2xl text-sage-dark">{t("rsvpTitle")}</h2>
      <p className="font-body mb-6 text-sm text-sage-dark/80">{t("rsvpSubtitle")}</p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center justify-center gap-3 py-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/30">
              <Check className="h-7 w-7 text-sage-dark" />
            </div>
            <p className="font-body text-lg text-sage-dark">{t("rsvpSuccess")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitted(false)}
              className="mt-2 border-sage-dark/40 text-sage-dark hover:bg-sage-dark hover:text-white"
            >
              {lang === "ar" ? "إرسال رد آخر" : "Send another response"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 text-left"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sage-dark">{t("rsvpName")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-sage/40 bg-white/70 text-sage-dark placeholder:text-sage/60 focus-visible:ring-sage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sage-dark">{t("rsvpAttendance")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-sage/40 bg-white/70 text-sage-dark focus:ring-sage">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">{t("rsvpYes")}</SelectItem>
                          <SelectItem value="no">{t("rsvpNo")}</SelectItem>
                          <SelectItem value="maybe">{t("rsvpMaybe")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isAttending && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <FormField
                      control={form.control}
                      name="guestCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sage-dark">{t("rsvpGuests")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              max={MAX_GUESTS}
                              className="border-sage/40 bg-white/70 text-sage-dark placeholder:text-sage/60 focus-visible:ring-sage"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                <FormField
                  control={form.control}
                  name="dietary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sage-dark">{t("rsvpDietary")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-sage/40 bg-white/70 text-sage-dark placeholder:text-sage/60 focus-visible:ring-sage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sage-dark">{t("rsvpMessage")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          className="border-sage/40 bg-white/70 text-sage-dark placeholder:text-sage/60 focus-visible:ring-sage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-sage-dark text-white hover:bg-sage-dark/90 focus-visible:ring-sage"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("rsvpSubmit")}
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
