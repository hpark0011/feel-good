---
name: Server Actions Pattern
category: Implementation
applies_to: [server-actions, api, validation]
updated: 2026-01-14
documented_in: CLAUDE.md
---

# Server Actions Pattern

This document defines conventions for creating type-safe server actions with validation and error handling.

## Overview

Server actions are Next.js server-side functions that handle data mutations and API calls. All server actions use the **enhanceAction** wrapper for:
- Type-safe parameter validation (Zod schemas)
- Authentication checks
- Consistent error handling
- Type inference

**Stack:**
- Next.js Server Actions
- `enhanceAction` wrapper (`/utils/enhance-actions.ts`)
- Zod schemas for validation
- `ActionResponse<T>` return type

---

## Action Template

### Complete Server Action Example

```typescript
// app/_actions/create-ticket.ts
"use server";

import { enhanceAction } from "@/utils/enhance-actions";
import { ticketSchema, type TicketInput } from "@/lib/schema/tasks.schema";
import { createClient } from "@/utils/supabase/client/supabase-server";

interface CreateTicketResult {
  ticketId: string;
  message: string;
}

export const createTicketAction = enhanceAction(
  async (data): Promise<ActionResponse<CreateTicketResult>> => {
    // data is type-safe (inferred from schema)
    // data: TicketInput

    try {
      // Business logic here
      const supabase = await createClient();
      const { data: ticket, error } = await supabase
        .from("tickets")
        .insert({
          title: data.title,
          description: data.description,
          status: data.status,
          project_id: data.projectId,
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: "Failed to create ticket",
          errors: { _form: [error.message] },
        };
      }

      return {
        success: true,
        data: {
          ticketId: ticket.id,
          message: "Ticket created successfully",
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  },
  {
    schema: ticketSchema,  // Validates input with Zod
    auth: true,            // Requires authenticated user
  }
);
```

### File Organization

```
app/
  _actions/
    create-ticket.ts     ✅ Mutation action
    update-ticket.ts     ✅ Mutation action
    delete-ticket.ts     ✅ Mutation action
  (protected)/
    dashboard/
      tasks/
        _actions/
          task-actions.ts  ✅ Feature-specific actions (if many)
```

**Naming convention:** `{verb}-{resource}.ts` or `{resource}-actions.ts`

---

## enhanceAction Wrapper

### Purpose

`enhanceAction` provides:
1. **Zod validation** - Automatic input validation
2. **Auth checks** - Optional authentication requirement
3. **Type inference** - Parameters inferred from schema
4. **Error handling** - Consistent error format

### Signature

```typescript
function enhanceAction<TInput, TOutput>(
  action: (data: TInput) => Promise<ActionResponse<TOutput>>,
  options?: {
    schema?: ZodSchema<TInput>;  // Optional Zod schema
    auth?: boolean;              // Default: false
  }
): (data: unknown) => Promise<ActionResponse<TOutput>>;
```

### Usage Patterns

#### Pattern 1: With Schema + Auth

```typescript
export const createTicketAction = enhanceAction(
  async (data): Promise<ActionResponse<{ id: string }>> => {
    // data is validated and typed as TicketInput
    // user is authenticated
    // ...
  },
  {
    schema: ticketSchema,  // Validates input
    auth: true,            // Requires auth
  }
);
```

#### Pattern 2: With Schema, No Auth

```typescript
export const signInAction = enhanceAction(
  async (data): Promise<ActionResponse> => {
    // data is validated and typed as SignInInput
    // user may not be authenticated (public endpoint)
    // ...
  },
  {
    schema: signInSchema,  // Validates input
    auth: false,           // No auth required
  }
);
```

#### Pattern 3: No Schema, With Auth

```typescript
export const getUserDataAction = enhanceAction(
  async (): Promise<ActionResponse<User>> => {
    // No input validation needed
    // User must be authenticated
    // ...
  },
  {
    auth: true,  // Requires auth
  }
);
```

---

## ActionResponse Type

### Response Structure

```typescript
type ActionResponse<T = void> =
  | {
      success: true;
      data?: T;  // Optional response data
    }
  | {
      success: false;
      message?: string;              // Human-readable error
      errors?: Record<string, string[]>; // Field-level errors
    };
```

### Success Response

```typescript
// With data
return {
  success: true,
  data: {
    ticketId: "ticket-123",
    message: "Ticket created",
  },
};

// Without data (void)
return { success: true };
```

### Error Response

```typescript
// Field-level errors (form validation)
return {
  success: false,
  errors: {
    title: ["Title is required"],
    email: ["Invalid email format", "Email already exists"],
  },
};

// Global error message
return {
  success: false,
  message: "Failed to create ticket",
};

// Both field errors + global message
return {
  success: false,
  message: "Validation failed",
  errors: {
    title: ["Title is required"],
  },
};
```

---

## Schema Validation

### Validation with Zod

**enhanceAction** automatically validates input using the provided schema:

```typescript
export const updateTicketAction = enhanceAction(
  async (data) => {
    // data is already validated by enhanceAction
    // TypeScript knows data is UpdateTicketInput
    // ...
  },
  {
    schema: updateTicketSchema,
  }
);
```

### Validation Error Mapping

**enhanceAction** uses `zodParseFactory` to transform Zod errors:

```typescript
// Input: { title: "" }
// Zod error: title must be at least 1 character

// Automatic transformation:
{
  success: false,
  errors: {
    title: ["Title must be at least 1 characters"]
  }
}
```

### Custom Validation Logic

```typescript
export const createTicketAction = enhanceAction(
  async (data): Promise<ActionResponse> => {
    // data passed Zod validation

    // Additional custom validation
    if (data.projectId) {
      const projectExists = await checkProjectExists(data.projectId);
      if (!projectExists) {
        return {
          success: false,
          errors: {
            projectId: ["Project not found"],
          },
        };
      }
    }

    // Continue with business logic
  },
  {
    schema: ticketSchema,
    auth: true,
  }
);
```

---

## Error Handling

### Client-Side Error Mapping

```typescript
// Form submission in component
const onSubmit = async (data: TicketInput) => {
  const result = await createTicketAction(data);

  if (!result.success) {
    // Map field-level errors to form
    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        form.setError(field as keyof TicketInput, {
          message: messages[0], // Show first error
        });
      });
    }

    // Show global error via toast
    if (result.message) {
      toast.error(result.message);
    }
  } else {
    toast.success("Ticket created!");
    // Handle success...
  }
};
```

### Server-Side Error Handling

```typescript
export const createTicketAction = enhanceAction(
  async (data): Promise<ActionResponse<{ id: string }>> => {
    try {
      // Business logic that may throw
      const result = await database.insert(data);

      return {
        success: true,
        data: { id: result.id },
      };
    } catch (error) {
      // Log error for debugging
      console.error("Create ticket error:", error);

      // Return user-friendly error
      if (error instanceof DatabaseError) {
        return {
          success: false,
          message: "Database error occurred",
        };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  },
  {
    schema: ticketSchema,
    auth: true,
  }
);
```

---

## Authentication

### Auth Requirement

```typescript
// ✅ CORRECT: Require auth for protected actions
export const createTicketAction = enhanceAction(
  async (data) => {
    // User is authenticated
    // Access user via: const user = await getCurrentServerUser();
  },
  {
    schema: ticketSchema,
    auth: true,  // Enforces authentication
  }
);
```

### Public Actions (No Auth)

```typescript
// ✅ CORRECT: Public endpoint
export const signInAction = enhanceAction(
  async (data) => {
    // User may not be authenticated
    // This is a public sign-in endpoint
  },
  {
    schema: signInSchema,
    auth: false,  // No auth required
  }
);
```

### Accessing Current User

```typescript
import { getCurrentServerUser } from "@/utils/supabase/get-current-server-user";

export const createTicketAction = enhanceAction(
  async (data): Promise<ActionResponse> => {
    // Get current authenticated user
    const user = await getCurrentServerUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // Use user.id for ownership checks
    // ...
  },
  {
    schema: ticketSchema,
    auth: true,
  }
);
```

---

## Type Safety

### Inferred Types from Schema

```typescript
// Schema in /lib/schema/tasks.schema.ts
export const ticketSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["backlog", "todo", "in-progress", "complete"]),
  projectId: z.string().optional(),
});

export type TicketInput = z.infer<typeof ticketSchema>;

// Action with type inference
export const createTicketAction = enhanceAction(
  async (data) => {
    // TypeScript knows:
    // data.title: string
    // data.description: string | undefined
    // data.status: "backlog" | "todo" | "in-progress" | "complete"
    // data.projectId: string | undefined
  },
  {
    schema: ticketSchema,
  }
);
```

### Generic Return Types

```typescript
// ✅ CORRECT: Specify return data type
export const createTicketAction = enhanceAction(
  async (data): Promise<ActionResponse<{ ticketId: string }>> => {
    // ...
    return {
      success: true,
      data: { ticketId: "ticket-123" },
    };
  },
  {
    schema: ticketSchema,
    auth: true,
  }
);

// Consumer gets typed data
const result = await createTicketAction(data);
if (result.success) {
  console.log(result.data.ticketId); // TypeScript knows this exists
}
```

---

## Testing Requirements

### Action Validation Tests

```typescript
import { createTicketAction } from "./create-ticket";

describe("createTicketAction", () => {
  it("should validate required fields", async () => {
    const result = await createTicketAction({
      title: "", // Invalid: empty title
      status: "todo",
    });

    expect(result.success).toBe(false);
    expect(result.errors?.title).toBeDefined();
  });

  it("should accept valid data", async () => {
    const result = await createTicketAction({
      title: "Valid Title",
      description: "Description",
      status: "todo",
    });

    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```typescript
import { createTicketAction } from "./create-ticket";
import { createClient } from "@/utils/supabase/client/supabase-server";

describe("createTicketAction integration", () => {
  it("should create ticket in database", async () => {
    const data = {
      title: "Test Ticket",
      description: "Test description",
      status: "todo",
    };

    const result = await createTicketAction(data);

    expect(result.success).toBe(true);
    expect(result.data?.ticketId).toBeDefined();

    // Verify in database
    const supabase = await createClient();
    const { data: ticket } = await supabase
      .from("tickets")
      .select()
      .eq("id", result.data.ticketId)
      .single();

    expect(ticket?.title).toBe("Test Ticket");
  });

  it("should require authentication", async () => {
    // Mock unauthenticated user
    // ...

    const result = await createTicketAction({
      title: "Test",
      status: "todo",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Unauthorized");
  });
});
```

---

## AI Agent Checklist

### Creating a New Server Action

- [ ] **File Setup:**
  - [ ] Create file in `app/_actions/` or feature `_actions/` folder
  - [ ] Use `"use server"` directive at top
  - [ ] Name file: `{verb}-{resource}.ts` (e.g., `create-ticket.ts`)

- [ ] **Schema:**
  - [ ] Import schema from `/lib/schema/` (if validating input)
  - [ ] Ensure schema exports type: `export type Input = z.infer<typeof schema>`

- [ ] **Action Function:**
  - [ ] Wrap with `enhanceAction`
  - [ ] Define return type: `Promise<ActionResponse<T>>`
  - [ ] Add schema to options (if validating input)
  - [ ] Set `auth: true/false` based on requirement

- [ ] **Business Logic:**
  - [ ] Use try/catch for error handling
  - [ ] Get current user if auth required: `await getCurrentServerUser()`
  - [ ] Return `{ success: true, data: ... }` on success
  - [ ] Return `{ success: false, errors/message: ... }` on error

- [ ] **Error Handling:**
  - [ ] Map database errors to field errors if applicable
  - [ ] Return user-friendly error messages
  - [ ] Log errors for debugging

- [ ] **Testing:**
  - [ ] Test validation (invalid input)
  - [ ] Test success case
  - [ ] Test authentication (if required)
  - [ ] Test database integration

---

## ESLint / TypeScript Rules

### No any Types

```typescript
// ❌ WRONG
export const createAction = enhanceAction(
  async (data: any) => { ... }
);

// ✅ CORRECT: Types inferred from schema
export const createAction = enhanceAction(
  async (data) => { // data type inferred
    // ...
  },
  {
    schema: ticketSchema,
  }
);
```

### Explicit Return Types

```typescript
// ✅ CORRECT: Specify ActionResponse generic
export const createAction = enhanceAction(
  async (data): Promise<ActionResponse<{ id: string }>> => {
    // ...
  },
  {
    schema: ticketSchema,
  }
);
```

### Import Type Correctly

```typescript
// ✅ CORRECT: Use type import for ActionResponse
import type { ActionResponse } from "@/utils/enhance-actions";

// Or import both value and type
import { enhanceAction, type ActionResponse } from "@/utils/enhance-actions";
```

---

## Anti-Patterns

### ❌ DON'T: Skip enhanceAction Wrapper

```typescript
// ❌ WRONG: Manual validation and auth
export async function createTicket(data: unknown) {
  const user = await getCurrentServerUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = ticketSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: /* map errors */ };
  }

  // ...
}

// ✅ CORRECT: Use enhanceAction
export const createTicket = enhanceAction(
  async (data) => { /* logic */ },
  {
    schema: ticketSchema,
    auth: true,
  }
);
```

### ❌ DON'T: Throw Errors from Actions

```typescript
// ❌ WRONG: Throwing errors
export const createAction = enhanceAction(
  async (data) => {
    if (error) {
      throw new Error("Something went wrong"); // BAD
    }
  }
);

// ✅ CORRECT: Return error response
export const createAction = enhanceAction(
  async (data): Promise<ActionResponse> => {
    if (error) {
      return {
        success: false,
        message: "Something went wrong",
      };
    }
    return { success: true };
  }
);
```

### ❌ DON'T: Inline Validation Logic

```typescript
// ❌ WRONG: Manual validation
export const createAction = enhanceAction(
  async (data) => {
    if (!data.title || data.title.length < 1) {
      return {
        success: false,
        errors: { title: ["Required"] },
      };
    }
    // ...
  }
);

// ✅ CORRECT: Use Zod schema
const schema = z.object({
  title: z.string().min(1, "Required"),
});

export const createAction = enhanceAction(
  async (data) => { /* business logic */ },
  {
    schema,
  }
);
```

### ❌ DON'T: Return Inconsistent Response Shapes

```typescript
// ❌ WRONG: Inconsistent responses
export const createAction = enhanceAction(
  async (data) => {
    if (success) {
      return { ticketId: "123" }; // Missing success field
    } else {
      return { error: "Failed" }; // Wrong error shape
    }
  }
);

// ✅ CORRECT: Always use ActionResponse
export const createAction = enhanceAction(
  async (data): Promise<ActionResponse<{ ticketId: string }>> => {
    if (success) {
      return { success: true, data: { ticketId: "123" } };
    } else {
      return { success: false, message: "Failed" };
    }
  }
);
```

---

## Reference Examples

### Action Wrapper
- `/utils/enhance-actions.ts` - enhanceAction implementation
- `/utils/zod-parse-factory.ts` - Zod error mapping

### Server Actions
- `app/_actions/auth-actions.ts` - Sign-in, sign-up, reset password actions
- Feature-specific actions in `app/(protected)/dashboard/*/` directories

### Integration
- `/components/auth/password-form.tsx` - Using auth actions from form
- `/components/tasks/ticket-form-dialog.tsx` - Using ticket actions from form

---

## Summary

**Key Takeaways:**
1. ✅ **Always use enhanceAction** - Automatic validation, auth, type safety
2. ✅ **ActionResponse type** - Consistent response shape
3. ✅ **Zod schemas** - Defined in `/lib/schema/`, reused in actions
4. ✅ **Auth option** - `auth: true` for protected, `auth: false` for public
5. ✅ **Error handling** - Return `{ success: false, errors/message }`, never throw
6. ✅ **Type safety** - Infer types from schemas, specify ActionResponse<T>
7. ✅ **Field-level errors** - Map to `errors: Record<string, string[]>`
8. ✅ **Testing** - Test validation, success, auth, database integration

**This convention ensures:**
- Type-safe server actions with automatic validation
- Consistent error handling across API endpoints
- Authentication enforcement where needed
- Integration with React Hook Form for field-level errors
- Testable business logic
