---
name: Forms & Validation Pattern
category: Implementation
applies_to: [forms, validation, schemas]
updated: 2026-01-14
documented_in: CLAUDE.md
---

# Forms & Validation Pattern

This document defines conventions for building forms using React Hook Form + Zod validation.

## Overview

All forms in the application use **React Hook Form** with **Zod** for type-safe validation. This pattern provides:

- Type inference from schemas
- Client-side validation
- Server-side error mapping
- Auto-save capabilities
- Keyboard shortcuts

**Stack:**

- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers/zod` - Integration layer
- Custom hooks - Enhanced UX (auto-save, keyboard shortcuts, focus management)

---

## Schema Organization

### Where to Put Schemas

**Rule:** Reusable schemas go in `/lib/schema/`, inline only for single-use

```
lib/schema/
  auth.schema.ts           ✅ Reusable auth schemas
  tasks.schema.ts          ✅ Task/ticket schemas
  file.schema.ts           ✅ File upload schemas

components/tasks/
  ticket-form-dialog.tsx   ❌ Inline schema (should be in /lib/schema/)
  focus-form-dialog.tsx    ✅ OK if truly single-use
```

### Schema File Structure

```typescript
// ✅ CORRECT: /lib/schema/tasks.schema.ts
import { z } from "zod";

// Export schema
export const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["backlog", "todo", "in-progress", "complete"]),
  projectId: z.string().optional(),
  subTasks: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().min(1, "Sub-task cannot be empty"),
        completed: z.boolean(),
      }),
    )
    .optional(),
});

// Export inferred types
export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketOutput = z.output<typeof ticketSchema>;

// Export sub-types if needed
export type SubTask = z.infer<typeof ticketSchema>["subTasks"][number];
```

### Schema Naming Convention

**Pattern:** `{feature}Schema`

```typescript
✅ CORRECT:
ticketSchema
signInSchema
resetPasswordSchema
fileUploadSchema

❌ WRONG:
TicketSchema          (use camelCase)
ticket_schema         (no snake_case)
validateTicket        (not a function)
```

### Type Export Convention

```typescript
// ✅ CORRECT: Export both Input and Output types
export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketOutput = z.output<typeof ticketSchema>;

// Use Input for form data, Output for transformed data
```

---

## Form Pattern Template

### Complete Form Example

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema, type TicketInput } from "@/lib/schema/tasks.schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TicketFormProps {
  ticket?: TicketInput; // For edit mode
  onSubmit: (data: TicketInput) => Promise<void>;
}

export function TicketForm({ ticket, onSubmit }: TicketFormProps) {
  // 1. Create form with zodResolver
  const form = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket || {
      title: "",
      description: "",
      status: "todo",
      projectId: undefined,
      subTasks: [],
    },
  });

  // 2. Handle submission
  const handleSubmit = async (data: TicketInput) => {
    try {
      await onSubmit(data);
      form.reset(); // Reset on success
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // 3. Render with Form components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter task title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Dialog Forms Pattern

### Dialog + Form Integration

```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function TicketFormDialog({ open, onOpenChange }: Props) {
  const form = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: { /* ... */ },
  });

  const onSubmit = async (data: TicketInput) => {
    // Handle submission
    onOpenChange(false); // Close dialog on success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new task
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form
              id="ticket-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Form fields */}
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="ticket-form">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Key points:**

- Form `id` attribute links to button `form` attribute
- Submit button can be outside `<form>` tag
- Dialog closes automatically on successful submit
- Cancel button closes without submitting

---

## Auto-Save Pattern

### Using useDialogAutoSave

```typescript
import { useDialogAutoSave } from "@/hooks/use-dialog-auto-save";

export function TicketFormDialog({ open, onOpenChange }: Props) {
  const form = useForm({ /* ... */ });

  const onSubmit = async (data: TicketInput) => {
    // Save logic
  };

  // Auto-save when dialog closes (if form is valid)
  const { handleOpenChange, cancelAction } = useDialogAutoSave({
    enabled: true,
    onSubmit: form.handleSubmit(onSubmit),
    isValid: !!form.watch("title"), // Only auto-save if title exists
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Dialog content */}
      <DialogFooter>
        <Button onClick={cancelAction}>Cancel</Button>
        <Button type="submit" form="form-id">Save</Button>
      </DialogFooter>
    </Dialog>
  );
}
```

**Behavior:**

- ✅ Auto-saves valid data when dialog closes normally
- ✅ Skips auto-save when "Cancel" is clicked
- ✅ Only saves if `isValid` condition is met (e.g., title not empty)

**When to use:**

- Dialog-based forms where user might close without clicking "Save"
- Create/Edit forms where preserving valid data is helpful
- NOT for multi-step forms or wizards

---

## Keyboard Shortcuts

### Cmd/Ctrl+Enter to Submit

```typescript
import { useKeyboardSubmit } from "@/hooks/use-keyboard-submit";

export function TicketFormDialog({ open, onOpenChange }: Props) {
  const form = useForm({ /* ... */ });

  // Enable Cmd/Ctrl+Enter to submit
  useKeyboardSubmit({
    enabled: open, // Only when dialog is open
    onSubmit: () => form.handleSubmit(onSubmit)(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Form */}
    </Dialog>
  );
}
```

### Enter Navigation Between Fields

```typescript
import { useFocusManagement } from "@/hooks/use-focus-management";

export function TicketFormDialog({ open }: Props) {
  const form = useForm({ /* ... */ });
  const { handleAutoFocus, setRefs } = useFocusManagement();

  return (
    <DialogContent onOpenAutoFocus={handleAutoFocus}>
      <FormField
        name="title"
        render={({ field }) => (
          <Input
            {...field}
            ref={(el) => setRefs(el, field.ref)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                // Focus moves to description
              }
            }}
          />
        )}
      />
    </DialogContent>
  );
}
```

**Features:**

- Auto-focus first field when dialog opens
- Enter key moves focus to next field
- Cursor positioned at end of text

---

## Error Handling

### Client-Side Errors (Zod Validation)

```typescript
const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(500, "Description too long"),
});

// FormMessage component automatically displays errors
<FormField
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Shows "Title is required" */}
    </FormItem>
  )}
/>
```

### Server-Side Errors (ActionResponse)

```typescript
const onSubmit = async (data: TicketInput) => {
  const result = await createTicketAction(data);

  if (!result.success) {
    // Map field-level errors from server
    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        form.setError(field as keyof TicketInput, {
          message: messages[0], // Use first error message
        });
      });
    }

    // Show global error via toast
    if (result.message) {
      toast.error(result.message);
    }
  } else {
    toast.success("Task created successfully!");
    onOpenChange(false);
  }
};
```

### ActionResponse Type

```typescript
// Defined in server actions
type ActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; errors?: Record<string, string[]>; message?: string };
```

---

## Custom Hooks for Forms

### useTicketForm

```typescript
import { useTicketForm } from "@/hooks/use-ticket-form";

export function TicketFormDialog({ ticket }: Props) {
  const { form, handleSubmit, ticketSchema } = useTicketForm({
    ticket,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

**Provides:**

- Form instance with schema validation
- Reset logic on dialog open/close
- Submit handler with success/error callbacks

### useFocusManagement

**See "Keyboard Shortcuts" section above**

### useKeyboardSubmit

**See "Keyboard Shortcuts" section above**

### usePersistedSubTasks

```typescript
import { usePersistedSubTasks } from "@/hooks/use-persisted-sub-tasks";

export function TicketFormDialog({ ticket, open }: Props) {
  const form = useForm({ /* ... */ });

  // Persist sub-task drafts in CREATE mode
  const { clearSubTasks } = usePersistedSubTasks({
    ticketId: ticket?.id, // undefined = CREATE mode
    form,
    dialogOpen: open,
  });

  const onSubmit = async (data) => {
    await saveTicket(data);
    clearSubTasks(); // Clear draft on success
  };

  return (/* Form */);
}
```

**Behavior:**

- CREATE mode: Loads persisted draft, saves changes to localStorage
- EDIT mode: No-op, uses ticket's data
- Call `clearSubTasks()` after successful submit

---

## Testing Requirements

### Schema Validation Tests

```typescript
import { ticketSchema } from "@/lib/schema/tasks.schema";

describe("ticketSchema", () => {
  it("should validate valid ticket data", () => {
    const data = {
      title: "Valid Title",
      description: "Valid description",
      status: "todo",
    };

    const result = ticketSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const data = { title: "", status: "todo" };

    const result = ticketSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title is required");
  });

  it("should accept optional description", () => {
    const data = { title: "Title", status: "todo" };

    const result = ticketSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
```

### Form Integration Tests

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TicketForm } from "./ticket-form";

describe("TicketForm", () => {
  it("should submit valid form data", async () => {
    const onSubmit = jest.fn();
    render(<TicketForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Task" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "New Task",
        description: "",
        status: "todo",
        projectId: undefined,
        subTasks: [],
      });
    });
  });

  it("should display validation errors", async () => {
    render(<TicketForm onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
    });
  });
});
```

---

## AI Agent Checklist

### Creating a New Form

- [ ] **Schema:**

  - [ ] Create schema in `/lib/schema/{feature}.schema.ts`
  - [ ] Export schema: `export const {feature}Schema = z.object({ ... })`
  - [ ] Export types: `export type {Feature}Input = z.infer<typeof {feature}Schema>`
  - [ ] Add validation messages for all required fields

- [ ] **Form Component:**

  - [ ] Import schema from `/lib/schema/`
  - [ ] Use `useForm` with `zodResolver(schema)`
  - [ ] Set `defaultValues` for all fields
  - [ ] Render with `Form` + `FormField` components

- [ ] **Dialog Integration (if applicable):**

  - [ ] Use `Dialog` + `DialogContent` components
  - [ ] Add `DialogHeader`, `DialogBody`, `DialogFooter`
  - [ ] Link form to submit button via `id` and `form` attributes
  - [ ] Close dialog on successful submit

- [ ] **Enhanced UX:**

  - [ ] Add `useKeyboardSubmit` for Cmd/Ctrl+Enter
  - [ ] Add `useFocusManagement` for Enter navigation
  - [ ] Add `useDialogAutoSave` if appropriate

- [ ] **Error Handling:**

  - [ ] Map server errors to form fields via `form.setError()`
  - [ ] Show global errors via toast
  - [ ] Display field errors via `FormMessage`

- [ ] **Testing:**
  - [ ] Test schema validation (valid/invalid cases)
  - [ ] Test form submission (success case)
  - [ ] Test error display (client + server)

---

## ESLint / TypeScript Rules

### Type Safety with z.infer

```typescript
// ✅ CORRECT: Use z.infer for type inference
export type TicketInput = z.infer<typeof ticketSchema>;

const onSubmit = async (data: TicketInput) => {
  // data is fully typed
};
```

### No any Types

```typescript
// ❌ WRONG
const form = useForm<any>({ ... });

// ✅ CORRECT
const form = useForm<TicketInput>({ ... });
```

### Strict Field Names

```typescript
// ✅ CORRECT: Type-safe field names
form.setError("title", { message: "Error" }); // ✅ TypeScript checks field exists

form.setError("invalidField", { message: "Error" }); // ❌ TypeScript error
```

---

## Anti-Patterns

### ❌ DON'T: Inline Schemas for Reusable Forms

```typescript
// ❌ WRONG: Schema inline in component
export function TicketForm() {
  const ticketSchema = z.object({
    title: z.string().min(1),
    // ...
  });

  const form = useForm({ resolver: zodResolver(ticketSchema) });
}

// ✅ CORRECT: Schema in /lib/schema/
import { ticketSchema } from "@/lib/schema/tasks.schema";

export function TicketForm() {
  const form = useForm({ resolver: zodResolver(ticketSchema) });
}
```

### ❌ DON'T: Skip Type Exports

```typescript
// ❌ WRONG: No type export
export const ticketSchema = z.object({ ... });

// ✅ CORRECT: Export inferred type
export const ticketSchema = z.object({ ... });
export type TicketInput = z.infer<typeof ticketSchema>;
```

### ❌ DON'T: Use Controlled Components for All Form Fields

```typescript
// ❌ WRONG: Manual state for every field
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");

<Input value={title} onChange={(e) => setTitle(e.target.value)} />

// ✅ CORRECT: Let React Hook Form manage state
<FormField
  name="title"
  render={({ field }) => <Input {...field} />}
/>
```

### ❌ DON'T: Ignore Server Errors

```typescript
// ❌ WRONG: Only show toast
const onSubmit = async (data) => {
  const result = await action(data);
  if (!result.success) {
    toast.error("Something went wrong");
  }
};

// ✅ CORRECT: Map field errors + toast for global
const onSubmit = async (data) => {
  const result = await action(data);
  if (!result.success) {
    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        form.setError(field, { message: messages[0] });
      });
    }
    if (result.message) {
      toast.error(result.message);
    }
  }
};
```

### ❌ DON'T: Use React Hook Form Without Zod

```typescript
// ❌ WRONG: No validation schema
const form = useForm();

// ✅ CORRECT: Always use Zod schema
const form = useForm({
  resolver: zodResolver(ticketSchema),
});
```

---

## Reference Examples

### Schema Files

- `/lib/schema/auth.schema.ts` - Email, password, sign-in, sign-up, reset password
- `/lib/schema/file.schema.ts` - File upload with custom validation utilities

### Form Components

- `/components/tasks/ticket-form-dialog.tsx` - Complex form with sub-tasks, auto-save, keyboard shortcuts
- `/components/tasks/focus-form-dialog.tsx` - Simple single-field form
- `/components/auth/password-form.tsx` - Multi-mode form (sign-in/sign-up)
- `/components/auth/magic-link-form.tsx` - Simple email form with server action

### Custom Hooks

- `/hooks/use-ticket-form.ts` - Form state management with reset logic
- `/hooks/use-dialog-auto-save.ts` - Auto-save on dialog close
- `/hooks/use-focus-management.ts` - Auto-focus and Enter navigation
- `/hooks/use-keyboard-submit.ts` - Cmd/Ctrl+Enter to submit
- `/hooks/use-persisted-sub-tasks.ts` - Sub-task draft persistence

---

## Summary

**Key Takeaways:**

1. ✅ **Schemas in `/lib/schema/`** - Reusable, type-safe validation
2. ✅ **React Hook Form + Zod** - Always use together
3. ✅ **Export types** - `type {Feature}Input = z.infer<typeof schema>`
4. ✅ **Form components** - Use `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
5. ✅ **Dialog forms** - Link form via `id` and `form` attributes
6. ✅ **Auto-save** - Use `useDialogAutoSave` for dialog forms
7. ✅ **Keyboard shortcuts** - Cmd/Ctrl+Enter to submit, Enter to navigate
8. ✅ **Error handling** - Map server errors to fields, toast for global
9. ✅ **Testing** - Test schema validation and form integration

**This convention ensures:**

- Type-safe forms with client and server validation
- Consistent error handling across the application
- Enhanced UX with keyboard shortcuts and auto-save
- Reusable schemas and form patterns
- Testable validation logic
