# Security Audit Report: Codebase Reorganization

**Date**: 2026-01-13
**Auditor**: Application Security Specialist
**Scope**: Next.js 15 App Router restructuring security implications
**Project**: AI Document Creation & Task Management Application

---

## Executive Summary

**Overall Risk Level**: ⚠️ **MEDIUM**

The proposed codebase reorganization introduces several security considerations that must be addressed to maintain proper server/client boundary enforcement. While the current implementation shows good security practices (proper RLS, auth middleware, server-only imports), the planned restructuring could introduce vulnerabilities if not executed carefully.

### Key Findings
- 🔴 **3 Critical Issues** - Require immediate attention
- 🟡 **5 High-Priority Issues** - Should be addressed during reorganization
- 🟢 **4 Medium-Priority Issues** - Best practices to implement

---

## 1. Critical Security Issues

### 🔴 CRITICAL-001: Server Code Exposure Risk in New Structure

**Risk Level**: Critical
**Exploitability**: High
**Impact**: Server-only code could be bundled into client-side JavaScript

**Description**:
The proposed move to route-level `_lib/server/` directories creates risk of accidentally importing server-only utilities into client components. Next.js 15 requires explicit `"use server"` or `"use client"` directives, and the new structure increases surface area for mistakes.

**Current State** ✅:
- Server actions properly marked with `"use server"` directive
- `/app/_actions/auth-actions.ts` (Line 1): `"use server"`
- `/app/_actions/file-actions.ts` (Line 1): `"use server"`
- `/utils/enhance-actions.ts` (Line 1): `import "server-only"`

**Vulnerable Scenarios in New Structure**:
```typescript
// ❌ DANGEROUS: _lib/server/queries.ts moved to route level
// Developer accidentally imports in client component
"use client"
import { getSecretData } from "./_lib/server/queries" // NO ERROR until runtime!
```

**Proof of Concept**:
```typescript
// app/dashboard/_lib/server/sensitive-operations.ts
export async function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY; // SECRET!
}

// app/dashboard/_components/dashboard-view.tsx
"use client"
import { getServiceRoleKey } from "../_lib/server/sensitive-operations"
// ^ This WILL bundle the secret into client JavaScript!
```

**Remediation**:
1. **MANDATORY**: All files in `_lib/server/` MUST include `import "server-only"` at the top
2. **MANDATORY**: Implement ESLint rule to enforce server-only imports:
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["**/app/**/_lib/server/*"],
        "importNames": ["*"],
        "message": "Server-only code must not be imported in client components. Use server actions instead."
      }]
    }]
  }
}
```

3. Create a pre-commit hook to scan for violations:
```bash
#!/bin/bash
# Check for server code imports in client components
find app -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "^\"use client\"" "$file"; then
    if grep -q "from.*_lib/server" "$file"; then
      echo "❌ SECURITY: Client component importing server code: $file"
      exit 1
    fi
  fi
done
```

---

### 🔴 CRITICAL-002: Environment Variable Exposure in New Route Structure

**Risk Level**: Critical
**Exploitability**: Medium
**Impact**: Sensitive credentials could be exposed to client bundles

**Description**:
Environment variables without `NEXT_PUBLIC_` prefix are server-only. The reorganization may cause developers to reference them incorrectly in new locations.

**Current Vulnerabilities Found**:
- `/Users/disquiet/Desktop/feel-good/greyboard/.env.local` (Lines 13-17):
  ```bash
  SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ EXPOSED IN GIT
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="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"  # ⚠️ EXPOSED
  ```

**Immediate Actions Required**:
1. **CRITICAL**: Rotate all exposed secrets immediately:
   - Service role key
   - Google OAuth secret
   - FLAGS_SECRET

2. Add `.env.local` to `.gitignore` if not already present

3. Move secrets to environment-specific configuration:
```bash
# .env.local (NOT in git)
SUPABASE_SERVICE_ROLE_KEY=<secret>

# .env.example (IN git)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Enforcement Strategy**:
```typescript
// lib/env.ts - Server-only environment validation
import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: z.string().min(1),
});

export const serverEnv = serverEnvSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET,
});
```

---

### 🔴 CRITICAL-003: Missing Authorization Checks in Server Actions

**Risk Level**: Critical
**Exploitability**: High
**Impact**: Privilege escalation and unauthorized data access

**Description**:
While `enhanceAction` wrapper provides authentication, some actions lack proper authorization checks beyond user ID comparison.

**Vulnerable Code** - `/app/_actions/file-actions.ts` (Lines 240-264):
```typescript
export const getFileAction = enhanceAction(
  async (data: { fileId: string }, user) => {
    const supabase = await getSupabaseServerClient();
    const service = new FileService(supabase);

    // ✅ Has user.id check
    const file = await service.getFile(data.fileId, user.id);
    return { success: true, data: file };
  },
  { schema: z.object({ fileId: z.string().uuid() }), auth: true }
);
```

**Analysis**: Current implementation is SECURE ✅
- All file operations include `user.id` checks
- RLS policies enforce database-level authorization
- However, new server actions in reorganized structure may miss this pattern

**Prevention for New Structure**:
1. Create authorization middleware template:
```typescript
// app/dashboard/_lib/server/with-authorization.ts
import "server-only";

export async function withResourceAuthorization<T>(
  resourceId: string,
  userId: string,
  resourceType: "file" | "task" | "agent",
  action: () => Promise<T>
): Promise<T> {
  // Verify ownership before executing action
  const hasAccess = await checkResourceOwnership(resourceId, userId, resourceType);

  if (!hasAccess) {
    throw new Error("Unauthorized access to resource");
  }

  return action();
}
```

2. Use in all new server actions:
```typescript
// app/dashboard/tasks/_actions/task-actions.ts
"use server";
import { withResourceAuthorization } from "../_lib/server/with-authorization";

export const updateTaskAction = enhanceAction(
  async (data: { taskId: string, updates: any }, user) => {
    return withResourceAuthorization(data.taskId, user.id, "task", async () => {
      // Safe to proceed - authorization verified
      return updateTask(data.taskId, data.updates);
    });
  },
  { auth: true }
);
```

---

## 2. High-Priority Security Issues

### 🟡 HIGH-001: Inconsistent "use server" / "use client" Directive Placement

**Risk Level**: High
**Exploitability**: Medium
**Impact**: Server code may execute on client or vice versa

**Current State**:
- ✅ Server actions properly marked: `/app/_actions/*.ts` (Line 1 in both files)
- ✅ Client hooks properly marked: `/hooks/*.ts` (12 files with `"use client"`)
- ⚠️ No directives in service files: `/lib/services/*.ts` (relies on import context)

**Issue**:
Service files (`file.service.ts`, `auth.service.ts`) lack explicit directives. They are currently safe because they're only imported by server actions, but the new structure may break this assumption.

**Remediation**:
1. Add explicit directives to all service files:
```typescript
// lib/services/file.service.ts
// Add at top of file:
import "server-only";

export class FileService {
  // ... existing code
}
```

2. Create a detection script:
```typescript
// scripts/check-directives.ts
import fs from 'fs';
import path from 'path';

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check if first non-empty line has directive
  const firstLine = lines.find(l => l.trim());
  const hasDirective = firstLine?.includes('"use') ||
                       content.includes('import "server-only"');

  if (!hasDirective && filePath.includes('/lib/') || filePath.includes('/_lib/')) {
    console.warn(`⚠️  Missing directive: ${filePath}`);
  }
}
```

---

### 🟡 HIGH-002: Path Traversal Risk in File Operations

**Risk Level**: High
**Exploitability**: Low (mitigated by RLS)
**Impact**: Access to other users' files

**Analysis** - `/lib/services/file.service.ts` (Lines 14-30):
```typescript
async uploadFile(file: File, userId: string): Promise<FileRow> {
  const fileExt = file.name.split(".").pop();  // ⚠️ RISK: No sanitization
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const fileName = `${userId}/${timestamp}-${randomId}.${fileExt}`;  // ⚠️ Path injection?
```

**Vulnerability Assessment**:
- **Current Risk**: LOW ✅ - RLS policies prevent cross-user access
- **Future Risk**: MEDIUM ⚠️ - If file path construction moves to new locations

**Attack Vector**:
```javascript
// Malicious filename
const file = new File([], "../../admin/secret.txt");
// Results in: userId/timestamp-random/../../../admin/secret.txt
```

**Remediation**:
```typescript
// lib/services/file.service.ts
async uploadFile(file: File, userId: string): Promise<FileRow> {
  // ✅ Sanitize filename
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Remove dangerous chars
    .replace(/^\.+/, '')                 // Remove leading dots
    .slice(0, 255);                      // Limit length

  const fileExt = sanitizedName.split(".").pop() || 'bin';
  const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

  // ✅ Validate path doesn't escape user directory
  if (fileName.includes('..') || !fileName.startsWith(userId)) {
    throw new Error('Invalid file path');
  }

  // ... rest of upload logic
}
```

---

### 🟡 HIGH-003: Missing CSRF Protection Verification

**Risk Level**: High
**Exploitability**: Medium
**Impact**: State-changing operations could be triggered via malicious sites

**Current State**:
- Next.js 15 provides automatic CSRF protection for server actions
- No custom API routes found (checked `/app/api/**/*.ts` - 0 files)
- Middleware handles session management

**Issue**:
Reorganization may introduce new API routes that bypass built-in protection.

**Verification Needed**:
```typescript
// ❌ VULNERABLE: If someone adds this
// app/dashboard/api/files/delete/route.ts
export async function DELETE(request: Request) {
  // No CSRF token check!
  const { fileId } = await request.json();
  await deleteFile(fileId);
}

// ✅ SAFE: Use server actions instead
// app/dashboard/files/_actions/file-actions.ts
"use server"
export async function deleteFileAction(fileId: string) {
  // Built-in CSRF protection from Next.js
}
```

**Enforcement**:
1. Document in CLAUDE.md:
```markdown
## API Routes Security

**CRITICAL**: Do NOT create API routes for state-changing operations.
Always use Server Actions for mutations (create, update, delete).

API routes should only be used for:
- Webhooks from external services
- File downloads with temporary tokens
- Public read-only data

If you must create an API route, implement CSRF token validation:
- Use double-submit cookie pattern
- Verify Origin/Referer headers
- Require authentication token in header
```

---

### 🟡 HIGH-004: Input Validation Gaps in New Structure

**Risk Level**: High
**Exploitability**: Medium
**Impact**: SQL injection, XSS, business logic bypass

**Current State** ✅:
- Strong validation with Zod schemas: `/lib/schema/file.schema.ts`
- `enhanceAction` wrapper enforces schema validation
- File type and size constraints properly implemented

**Risk in New Structure**:
Developers may bypass validation when creating route-specific actions.

**Example Secure Pattern** - `/app/_actions/file-actions.ts` (Lines 22-59):
```typescript
export const uploadFileAction = enhanceAction(
  async (data: FileUploadInput, user) => {
    // ✅ Schema validation via enhanceAction
    // ✅ Additional service-level validation
    const validation = service.validateFile(data.file);
    if (!validation.valid) {
      return { success: false, message: validation.error };
    }
    // ... secure upload
  },
  { schema: fileUploadSchema, auth: true }  // ✅ Schema enforced
);
```

**Template for New Structure**:
```typescript
// app/dashboard/tasks/_actions/task-actions.ts
"use server";
import { z } from "zod";
import { enhanceAction } from "@/utils/enhance-actions";

// ✅ ALWAYS define schema first
const updateTaskSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'complete']),
});

// ✅ ALWAYS use enhanceAction wrapper
export const updateTaskAction = enhanceAction(
  async (data, user) => {
    // Data is pre-validated by schema
    // User is pre-authenticated
    // Safe to proceed
  },
  { schema: updateTaskSchema, auth: true }
);
```

---

### 🟡 HIGH-005: Unsafe File Type Validation

**Risk Level**: High
**Exploitability**: Medium
**Impact**: Malicious file upload, XSS via SVG

**Current Implementation** - `/lib/schema/file.schema.ts` (Lines 6-15):
```typescript
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'  // ✅ Good: SVG not allowed (prevents XSS)
] as const;
```

**Vulnerability**: Client-provided MIME type is not trustworthy.

**Attack Vector**:
```javascript
// Attacker uploads malicious file
const blob = new Blob(['<?php system($_GET["cmd"]); ?>'], {
  type: 'image/png'  // Lies about type!
});
const file = new File([blob], 'shell.php.png', { type: 'image/png' });
```

**Current Mitigation** ✅:
- File extension validation in place
- Files stored with server-generated names
- Private bucket (not publicly executable)

**Recommended Enhancement**:
```typescript
// lib/services/file.service.ts
import { fileTypeFromBuffer } from 'file-type';

async uploadFile(file: File, userId: string): Promise<FileRow> {
  // ✅ Verify actual file content, not just MIME type
  const buffer = await file.arrayBuffer();
  const detectedType = await fileTypeFromBuffer(new Uint8Array(buffer));

  if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
    throw new Error(`File type not allowed: ${detectedType?.mime || 'unknown'}`);
  }

  // ✅ Use detected type instead of user-provided
  const actualMimeType = detectedType.mime;

  // ... rest of upload
}
```

---

## 3. Medium-Priority Issues (Best Practices)

### 🟢 MEDIUM-001: Middleware Scope Too Broad

**Risk**: Performance impact, unnecessary auth checks
**Location**: `/middleware.ts` (Lines 11-23)

**Current Configuration**:
```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Recommendation**:
```typescript
// More specific matcher for protected routes only
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/auth/callback',
  ],
};
```

---

### 🟢 MEDIUM-002: Missing Security Headers

**Risk**: XSS, clickjacking, MIME sniffing attacks
**Impact**: Defense-in-depth layer missing

**Recommendation**:
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

### 🟢 MEDIUM-003: Insufficient Error Sanitization

**Risk**: Information disclosure via error messages
**Current State**: Some errors leak internal details

**Example** - `/app/_actions/file-actions.ts` (Lines 48-53):
```typescript
} catch (error) {
  console.error('File upload error:', error);  // ⚠️ Full error in logs
  return {
    success: false,
    message: error instanceof Error ? error.message : 'Failed to upload file'
    // ⚠️ May expose internal details
  };
}
```

**Recommendation**:
```typescript
// utils/error-handler.ts
import "server-only";

export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  // Production: Generic messages only
  if (error instanceof ValidationError) return error.userMessage;
  if (error instanceof AuthError) return 'Authentication failed';
  if (error instanceof PermissionError) return 'Permission denied';

  // Never expose internal errors in production
  return 'An unexpected error occurred';
}
```

---

### 🟢 MEDIUM-004: Rate Limiting Not Implemented

**Risk**: Brute force attacks, API abuse, DoS
**Current State**: No rate limiting on server actions

**Recommendation**:
```typescript
// lib/rate-limiter.ts
import "server-only";
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60000, // 1 minute
});

export function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 10
): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const requests = rateLimitCache.get(key) || [];

  // Remove requests older than 1 minute
  const recentRequests = requests.filter(t => now - t < 60000);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimitCache.set(key, recentRequests);
  return true;
}

// Usage in server actions
export const uploadFileAction = enhanceAction(
  async (data, user) => {
    if (!checkRateLimit(user.id, 'file-upload', 5)) {
      return { success: false, message: 'Rate limit exceeded. Try again later.' };
    }
    // ... rest of upload
  },
  { schema: fileUploadSchema, auth: true }
);
```

---

## 4. Reorganization Security Checklist

When implementing the new structure, verify each item:

### Server/Client Boundary Enforcement

- [ ] All files in `_lib/server/` include `import "server-only"` at the top
- [ ] All server actions have `"use server"` directive on line 1
- [ ] All client components have `"use client"` directive on line 1
- [ ] No client components import from `_lib/server/` directories
- [ ] ESLint rule prevents server imports in client code
- [ ] Pre-commit hook validates directives

### Access Control

- [ ] All server actions use `enhanceAction` wrapper
- [ ] All server actions have `auth: true` unless explicitly public
- [ ] Resource ownership verified before mutations
- [ ] User ID comparison uses strict equality (`===`)
- [ ] RLS policies prevent cross-user data access
- [ ] Service role key never exposed to client

### Input Validation

- [ ] Every server action has Zod schema
- [ ] File uploads validate actual content, not just MIME type
- [ ] Path parameters sanitized (no `..` or absolute paths)
- [ ] String lengths limited (prevent DoS)
- [ ] UUIDs validated with `.uuid()` method
- [ ] Enums used for status fields

### Environment Variables

- [ ] All secrets use server-only env vars (no `NEXT_PUBLIC_`)
- [ ] `.env.local` in `.gitignore`
- [ ] All secrets rotated after exposure
- [ ] Env validation with Zod on server startup
- [ ] Client-side code never references server env vars

### API Security

- [ ] No API routes for state-changing operations
- [ ] Use server actions for mutations
- [ ] CSRF protection via Next.js built-in
- [ ] Rate limiting implemented for sensitive actions
- [ ] Security headers configured in `next.config.ts`

---

## 5. Secure Implementation Guide for New Structure

### Template: Server-Only Utility

```typescript
// app/dashboard/tasks/_lib/server/task-queries.ts
import "server-only";  // ✅ MANDATORY: First import
import { getSupabaseServerClient } from "@/utils/supabase/client/supabase-server";

export async function getTasksByUser(userId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);  // ✅ Always filter by user_id

  if (error) throw new Error('Failed to fetch tasks');
  return data;
}
```

### Template: Server Action

```typescript
// app/dashboard/tasks/_actions/task-actions.ts
"use server";  // ✅ MANDATORY: First line

import { z } from "zod";
import { enhanceAction } from "@/utils/enhance-actions";
import { getTasksByUser } from "../_lib/server/task-queries";

// ✅ Define schema first
const getTasksSchema = z.object({
  status: z.enum(['backlog', 'todo', 'in_progress', 'complete']).optional(),
  limit: z.number().min(1).max(100).default(50),
});

// ✅ Use enhanceAction wrapper
export const getTasksAction = enhanceAction(
  async (data, user) => {
    // ✅ User is authenticated by wrapper
    const tasks = await getTasksByUser(user.id);

    // ✅ Filter by status if provided
    const filtered = data.status
      ? tasks.filter(t => t.status === data.status)
      : tasks;

    // ✅ Apply limit
    return {
      success: true,
      data: filtered.slice(0, data.limit),
    };
  },
  { schema: getTasksSchema, auth: true }  // ✅ Require auth
);
```

### Template: Client Component

```typescript
// app/dashboard/tasks/_components/task-list.tsx
"use client";  // ✅ MANDATORY: First line

import { useEffect, useState } from "react";
import { getTasksAction } from "../_actions/task-actions";  // ✅ Import action, not server code

export function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasksAction({ limit: 50 }).then(result => {
      if (result.success) {
        setTasks(result.data);
      }
    });
  }, []);

  return <div>{/* Render tasks */}</div>;
}
```

---

## 6. Post-Reorganization Verification

Run these checks after restructuring:

### 1. Server-Only Import Check
```bash
# Check for client components importing server code
grep -r "use client" app --include="*.tsx" -l | while read file; do
  if grep -q "_lib/server" "$file"; then
    echo "❌ VIOLATION: $file"
  fi
done
```

### 2. Directive Presence Check
```bash
# Check for missing directives in lib/server directories
find app -path "*/_lib/server/*.ts" | while read file; do
  if ! grep -q "server-only" "$file"; then
    echo "⚠️  Missing server-only: $file"
  fi
done
```

### 3. Environment Variable Audit
```bash
# Check for server env vars in client code
grep -r "process.env" app --include="*.tsx" | grep -v "NEXT_PUBLIC_" | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  if grep -q "use client" "$file"; then
    echo "❌ SECURITY: $line"
  fi
done
```

### 4. Build-Time Validation
```bash
# Verify no server code in client bundles
pnpm build 2>&1 | grep -i "server-only" && echo "❌ Build failed: Server code in client bundle"
```

---

## 7. Additional Recommendations

### Security Documentation

Create `/docs/SECURITY.md`:
```markdown
# Security Guidelines

## File Organization Rules

1. **Server-Only Code**: All files in `_lib/server/` must start with `import "server-only"`
2. **Client Components**: Must have `"use client"` directive on line 1
3. **Server Actions**: Must have `"use server"` directive on line 1

## Forbidden Patterns

- ❌ Importing `_lib/server/*` in client components
- ❌ Using `process.env.<SECRET>` without `NEXT_PUBLIC_` prefix
- ❌ Creating API routes for mutations (use server actions)
- ❌ Bypassing `enhanceAction` wrapper for server actions

## Security Testing

Run security checks: `pnpm security:check`
```

### CI/CD Integration

Add to `.github/workflows/security-check.yml`:
```yaml
name: Security Check
on: [push, pull_request]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check server-only imports
        run: |
          ./scripts/check-server-client-boundary.sh

      - name: Check environment variables
        run: |
          ./scripts/check-env-vars.sh

      - name: Verify RLS policies
        run: |
          ./scripts/verify-rls.sh
```

---

## Conclusion

The proposed reorganization can be implemented securely with proper safeguards. The current codebase demonstrates good security practices, but the new structure increases risk surface area.

### Priority Actions Before Reorganization:

1. **IMMEDIATE**: Rotate all exposed secrets in `.env.local`
2. **IMMEDIATE**: Add server-only enforcement rules
3. **BEFORE MOVE**: Create security templates and documentation
4. **BEFORE MOVE**: Implement automated checks
5. **AFTER MOVE**: Run full security verification suite

### Risk Mitigation Summary:

- **Critical risks**: Addressable with proper tooling and processes
- **High risks**: Mitigated by templates and guidelines
- **Medium risks**: Acceptable with documented best practices

The reorganization can proceed with **MEDIUM overall risk** if all critical and high-priority issues are addressed first.

---

## Appendix: Security Testing Commands

```bash
# Run full security audit
pnpm security:audit

# Check server/client boundaries
pnpm security:boundaries

# Verify RLS policies
pnpm security:rls

# Check environment variables
pnpm security:env

# Validate input schemas
pnpm security:schemas
```

---

**Report End**

*For questions or clarifications, refer to the security specialist who conducted this audit.*
