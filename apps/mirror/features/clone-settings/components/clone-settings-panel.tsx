"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@feel-good/convex/convex/_generated/api";
import { type TonePreset } from "@feel-good/convex/chat/tonePresets";
import { Button } from "@feel-good/ui/primitives/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@feel-good/ui/primitives/form";
import {
  cloneSettingsSchema,
  type CloneSettingsFormValues,
} from "../lib/schemas/clone-settings.schema";
import { TonePresetSelect } from "./tone-preset-select";
import { CharCounterTextarea } from "./char-counter-textarea";
import { ClearAllDialog } from "./clear-all-dialog";

export function CloneSettingsPanel() {
  const currentProfile = useQuery(api.users.queries.getCurrentProfile);
  const updatePersonaSettings = useMutation(
    api.users.mutations.updatePersonaSettings,
  );

  const form = useForm<CloneSettingsFormValues>({
    resolver: zodResolver(cloneSettingsSchema),
    defaultValues: {
      personaPrompt: null,
      topicsToAvoid: null,
      tonePreset: null,
    },
    values: currentProfile
      ? {
          personaPrompt: currentProfile.personaPrompt ?? null,
          topicsToAvoid: currentProfile.topicsToAvoid ?? null,
          tonePreset: (currentProfile.tonePreset as TonePreset | null | undefined) ?? null,
        }
      : undefined,
  });

  const { formState } = form;
  const isPending = formState.isSubmitting;

  async function onSubmit(data: CloneSettingsFormValues) {
    await updatePersonaSettings({
      personaPrompt: data.personaPrompt,
      tonePreset: data.tonePreset,
      topicsToAvoid: data.topicsToAvoid,
    });
    form.reset(data);
  }

  const handleClearAll = useCallback(async () => {
    const cleared: CloneSettingsFormValues = {
      personaPrompt: null,
      tonePreset: null,
      topicsToAvoid: null,
    };
    await updatePersonaSettings({
      personaPrompt: null,
      tonePreset: null,
      topicsToAvoid: null,
    });
    form.reset(cleared);
  }, [updatePersonaSettings, form]);

  return (
    <div data-testid="clone-settings-panel" className="px-4 py-6 max-w-xl">
      <h2 className="text-lg font-semibold mb-1">Clone settings</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Customize how your AI clone speaks.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="tonePreset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone preset</FormLabel>
                <FormControl>
                  <TonePresetSelect
                    value={field.value as TonePreset | null}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personaPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Core persona</FormLabel>
                <FormControl>
                  <CharCounterTextarea
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={4000}
                    placeholder="Describe how your clone should present itself..."
                    rows={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topicsToAvoid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topics to avoid</FormLabel>
                <FormControl>
                  <CharCounterTextarea
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={500}
                    placeholder="List topics your clone should not discuss..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <ClearAllDialog onConfirm={handleClearAll} />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
