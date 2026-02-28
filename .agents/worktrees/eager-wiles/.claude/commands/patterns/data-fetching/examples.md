---
name: Data Fetching Examples
category: Architecture
applies_to: [examples, patterns, checklists]
updated: 2026-01-14
documented_in: CLAUDE.md
parent: data-fetching.md
---

# Data Fetching Examples & Best Practices

Real-world examples, anti-patterns to avoid, and implementation checklists.

## Navigation

- **[← Back to Overview](./overview.md)**
- **[Server-Side Patterns](./server-side.md)**
- **[Client-Side Patterns](./client-side.md)**
- **[Performance](./performance.md)**

---

## Examples from Codebase

### Example 1: Tasks Module (localStorage)

**Location**: `app/(protected)/dashboard/tasks/`

**Pattern**: Client-side localStorage with hooks

```typescript
// _lib/tasks.hooks.ts
export function useTasks(options?: { filter?: string[] }) {
  const [rawData, setRawData] = useLocalStorage<string>(
    STORAGE_KEYS.TASKS.BOARD_STATE,
    serializeData(getInitialData())
  );

  const data = useMemo(() => deserializeData(rawData), [rawData]);
  const filteredData = useMemo(() => {
    if (!options?.filter?.length) return data;
    return data.filter(task => options.filter.includes(task.projectId));
  }, [data, options?.filter]);

  const addTask = useCallback((newTask: Omit<Task, "id" | "createdAt">) => {
    setRawData(prev => {
      const currentData = deserializeData(prev);
      const task: Task = {
        ...newTask,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
      };
      return serializeData([...currentData, task]);
    });
  }, [setRawData]);

  return { data: filteredData, addTask, updateTask, deleteTask };
}

// page.tsx (minimal)
export default function TasksPage() {
  return <TasksView />;
}

// _view/tasks-view.tsx
"use client";

export function TasksView() {
  const { data, addTask } = useTasks();
  
  return (
    <div>
      {data.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
```

**Key Points**:
- ✅ All CRUD logic in hook
- ✅ Component delegates to hook methods
- ✅ localStorage persistence with serialization
- ✅ No server persistence (client-only state)

---

### Example 2: Files Module (Server-Side)

**Location**: `app/(protected)/dashboard/files/`

**Pattern**: Server-side loader with Supabase

```typescript
// _lib/server/files.loader.ts
export async function loadFiles() {
  const user = await getCurrentServerUser();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// page.tsx (Server Component)
export default async function FilesPage() {
  const files = await loadFiles();
  return <FilesView initialFiles={files} />;
}

// _view/files-view.tsx (Client Component)
"use client";

export function FilesView({ initialFiles }: { initialFiles: File[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [isPending, startTransition] = useTransition();

  const handleUpload = async (file: File) => {
    // Optimistic update
    const tempFile = { id: 'temp', name: file.name };
    setFiles(prev => [...prev, tempFile]);

    // Server mutation
    startTransition(async () => {
      const result = await uploadFileAction(file);
      if (result.success) {
        setFiles(result.files);
      }
    });
  };

  return (
    <div>
      {files.map(file => <FileCard key={file.id} file={file} />)}
    </div>
  );
}
```

**Key Points**:
- ✅ Server-side initial load (SEO, fast first paint)
- ✅ Client-side state management with optimistic updates
- ✅ Server actions for mutations
- ✅ Supabase persistence

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Mixing localStorage with Server Data

```typescript
// DON'T: Syncing localStorage with Supabase creates conflicts
export function useFiles() {
  const [localFiles, setLocalFiles] = useLocalStorage('files', []);
  const { data: serverFiles } = useQuery('files', fetchFiles);

  // Which is the source of truth? 🤔
  const files = serverFiles || localFiles; // WRONG!
}
```

**Problem**: Conflicting sources of truth, sync issues, data loss

**Solution**: Choose ONE source of truth:
- Server-only (Supabase) for persistent data
- Client-only (localStorage) for UI-only state

### ❌ Anti-Pattern 2: Business Logic in Components

```typescript
// DON'T: Component has CRUD logic
export function TasksView() {
  const [tasks, setTasks] = useLocalStorage('tasks', []);

  const addTask = (title: string) => {
    const task = {
      id: `task-${Date.now()}`,
      title,
      createdAt: new Date(),
    };
    setTasks([...tasks, task]); // Business logic in component!
  };

  return <button onClick={() => addTask('New Task')}>Add</button>;
}
```

**Problem**: Non-reusable logic, harder to test, violates SoC

**Solution**: Move CRUD to hook:

```typescript
// DO: Hook encapsulates logic
export function useTasks() {
  const [tasks, setTasks] = useLocalStorage('tasks', []);

  const addTask = useCallback((title: string) => {
    const task = { id: `task-${Date.now()}`, title, createdAt: new Date() };
    setTasks(prev => [...prev, task]);
  }, [setTasks]);

  return { tasks, addTask };
}

// Component just delegates
export function TasksView() {
  const { tasks, addTask } = useTasks();
  return <button onClick={() => addTask('New Task')}>Add</button>;
}
```

### ❌ Anti-Pattern 3: Not Using Loaders for Server Data

```typescript
// DON'T: Fetching in component (client-side)
export default function FilesPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch('/api/files').then(res => setFiles(res.json()));
  }, []);

  return <FilesView files={files} />;
}
```

**Problem**: Slower first paint, no SSR/SEO, flash of loading state

**Solution**: Use server-side loader:

```typescript
// DO: Fetch in Server Component
export default async function FilesPage() {
  const files = await loadFiles(); // Server-side
  return <FilesView initialFiles={files} />;
}
```

### ❌ Anti-Pattern 4: Sequential Fetching (Waterfalls)

```typescript
// DON'T: Sequential fetching
export default async function Page() {
  const user = await getUser();     // Waits
  const posts = await getPosts();   // Waits for user
  const tags = await getTags();     // Waits for posts
  // Total time: user + posts + tags
}
```

**Problem**: Slow page load, unnecessary waiting

**Solution**: Parallel fetching:

```typescript
// DO: Parallel fetching
export default async function Page() {
  const [user, posts, tags] = await Promise.all([
    getUser(),
    getPosts(),
    getTags()
  ]);
  // Total time: max(user, posts, tags)
}
```

---

## Implementation Checklists

### Server-Side Data Fetching Checklist

When implementing server-side data fetching:

- [ ] **Create loader function** in `_lib/server/{feature}.loader.ts`
  ```typescript
  export async function loadFeatureData() {
    const user = await getCurrentServerUser();
    const supabase = await getSupabaseServerClient();
    return service.getData(user.id);
  }
  ```

- [ ] **Call loader in page.tsx** (Server Component)
  ```typescript
  export default async function Page() {
    const data = await loadFeatureData();
    return <FeatureView data={data} />;
  }
  ```

- [ ] **Pass data to view via props** (not by fetching in client)

- [ ] **Use Suspense for streaming** if data can load progressively

- [ ] **Add error.tsx** for segment-level error handling

- [ ] **Choose caching strategy** (use `'use cache'`, fetch options, or unstable_cache)

- [ ] **Paginate early** for lists (20-50 items per page)

- [ ] **Select only required fields** (don't fetch `*`)

- [ ] **Log slow queries** (>100ms threshold)

---

### Client-Side (localStorage) Checklist

When implementing client-side localStorage patterns:

- [ ] **Define storage key** in `lib/storage-keys.ts`
  ```typescript
  FEATURE: {
    DATA: "docgen.v1.feature.data",
  }
  ```

- [ ] **Create hook** in `_lib/{feature}.hooks.ts`
  ```typescript
  export function useFeatureData() {
    const [data, setData] = useLocalStorage(STORAGE_KEYS.FEATURE.DATA, initial);
    // ... CRUD operations
    return { data, addItem, updateItem, deleteItem };
  }
  ```

- [ ] **Encapsulate ALL CRUD in hook** (no business logic in components)

- [ ] **Use serialization** for complex data (dates, nested objects)
  ```typescript
  export function serializeData(data: FeatureData): string {
    return JSON.stringify(data);
  }
  ```

- [ ] **Delegate to hook methods in component**
  ```typescript
  const { data, addItem } = useFeatureData();
  return <button onClick={() => addItem({...})}>Add</button>;
  ```

- [ ] **Add JSDoc to hook** explaining purpose, params, return value, example

- [ ] **Handle SSR safely** (useLocalStorage hook already does this)

- [ ] **Test hook independently** if logic is complex

- [ ] **Add export/import** if data needs to be portable

- [ ] **Consider versioning** for breaking changes to data structure

---

## Summary: Core Principles

### 1. Choose ONE Source of Truth

- **Server (Supabase)**: Auth-required, cross-device sync, persistent data
- **Client (localStorage)**: UI-only state, offline-first, no auth needed
- **Never mix**: Don't sync localStorage with server

### 2. Keep Components Simple

- Components render UI and handle user events
- Hooks/loaders handle data fetching and business logic
- Server actions handle mutations

### 3. Optimize for Performance

- Fetch in parallel when possible
- Paginate early
- Select only required fields
- Cache appropriately
- Monitor slow queries

### 4. Use the Right Pattern

| Data Type | Pattern | Example |
|-----------|---------|---------|
| User data (persistent) | Server-side loader | Files, user profile |
| UI preferences | Client-side localStorage | Theme, layout, filters |
| Real-time updates | Hybrid (server + optimistic) | Comments, likes |
| Forms | Server actions | Create, update, delete |

### 5. Document and Test

- Add JSDoc to custom hooks
- Write tests for complex hooks
- Maintain this documentation

---

## Key Rules to Remember

### DO

✅ Fetch data server-side when SEO/auth matters  
✅ Use localStorage for client-only UI state  
✅ Encapsulate logic in hooks/loaders  
✅ Use optimistic updates for better UX  
✅ Cache expensive operations  
✅ Paginate early  
✅ Monitor performance  

### DON'T

❌ Mix localStorage with server data  
❌ Put business logic in components  
❌ Fetch client-side when server-side is better  
❌ Skip pagination on large datasets  
❌ Ignore slow query warnings  
❌ Fetch sequentially when parallel is possible  

---

## Related Patterns

- **[Overview](./overview.md)** - Quick start and decision tree
- **[Server-Side Patterns](./server-side.md)** - Detailed server patterns
- **[Client-Side Patterns](./client-side.md)** - Detailed client patterns
- **[Hybrid Patterns](./hybrid.md)** - Server + client combined
- **[Performance](./performance.md)** - Performance best practices
- **[Server Actions vs Routes](./server-actions-vs-routes.md)** - Mutation patterns

---

## External Resources

- [Next.js Data Fetching Docs](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [TanStack Query](https://tanstack.com/query/latest) (if using client-side fetching)
