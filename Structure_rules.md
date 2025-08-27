# Next.js App Router + Convex Performance & Structure Rules

## <¯ Core Architecture Principles

### 1. Server/Client Component Boundaries

####  ALWAYS Keep Pages as Server Components
```typescript
// app/(protected)/dashboard/page.tsx - SERVER COMPONENT
export default function DashboardPage() {
  // NO "use client" directive
  // NO useState, useEffect, or Convex hooks here
  return <DashboardClient />;
}

// components/dashboard/DashboardClient.tsx - CLIENT COMPONENT
"use client";
export default function DashboardClient() {
  const data = useQuery(api.dashboard.getData);
  return <div>{/* UI logic */}</div>;
}
```

#### L NEVER Use Convex Hooks in Server Components
```typescript
// BAD: Server component with Convex hook
export default function Page() {
  const data = useQuery(api.data.get); // L ERROR
}

// GOOD: Extract to client component
export default function Page() {
  return <ClientDataFetcher />;
}
```

## =€ Convex Query Optimization Patterns

### 2. Single Query Per Route Pattern

####  Consolidate Related Queries
```typescript
// BAD: Multiple subscriptions cause multiple re-renders
function Dashboard() {
  const user = useQuery(api.users.getCurrentUser);
  const org = useQuery(api.organizations.get);
  const stats = useQuery(api.stats.getDashboard);
  const notifications = useQuery(api.notifications.list);
  // Each query = separate subscription = potential re-render
}

// GOOD: Single consolidated query
function Dashboard() {
  const dashboardData = useQuery(api.dashboard.getCompleteData);
  // Returns: { user, organization, stats, notifications }
  // One subscription = coordinated updates
}
```

### 3. Data Denormalization in Convex

####  Join Data Server-Side
```typescript
// convex/dashboard.ts
export const getCompleteData = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = await ctx.db.get(userId);
    
    if (!user?.organizationId) return null;
    
    // Denormalize in single query
    const [organization, stats, notifications] = await Promise.all([
      ctx.db.get(user.organizationId),
      ctx.db.query("stats")
        .withIndex("byUserId", q => q.eq("userId", userId))
        .first(),
      ctx.db.query("notifications")
        .withIndex("byUserId", q => q.eq("userId", userId))
        .take(10)
    ]);
    
    return { user, organization, stats, notifications };
  }
});
```

## > Hook Architecture Rules

### 4. Custom Hook Encapsulation Pattern

####  One Hook Per Feature Domain
```typescript
// hooks/useOnboarding.ts
export function useOnboardingFlow() {
  // Single source of truth for onboarding
  const status = useQuery(api.onboarding.getStatus);
  const updateStep = useMutation(api.onboarding.updateStep);
  const completeOnboarding = useMutation(api.onboarding.complete);
  
  const canProceed = useMemo(() => {
    return status?.currentStep && !status.isProcessing;
  }, [status]);
  
  return {
    status,
    canProceed,
    actions: { updateStep, completeOnboarding }
  };
}
```

### 5. Prevent Duplicate Subscriptions

####  Use React Context for Shared Data
```typescript
// contexts/UserContext.tsx
const UserContext = createContext<ReturnType<typeof useQuery>>();

export function UserProvider({ children }) {
  const user = useQuery(api.users.getCurrentUser);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// Use throughout component tree without duplicate subscriptions
export const useUser = () => useContext(UserContext);
```

## ¡ Performance Optimization Rules

### 6. Memoization Requirements

####  ALWAYS Memoize Computed Values
```typescript
function Component({ items }) {
  // BAD: Recalculates every render
  const expensiveResult = items.filter(i => i.active).sort((a, b) => b.date - a.date);
  
  // GOOD: Memoized computation
  const expensiveResult = useMemo(() => {
    return items.filter(i => i.active).sort((a, b) => b.date - a.date);
  }, [items]);
}
```

####  Stable Event Handlers
```typescript
// BAD: New function reference every render
<ChildComponent onSubmit={(data) => handleSubmit(data)} />

// GOOD: Stable reference
const handleSubmit = useCallback((data) => {
  // handle submission
}, [/* stable deps */]);
<ChildComponent onSubmit={handleSubmit} />
```

### 7. Loading State Patterns

####  Use Skeletons, Not Spinners
```typescript
// BAD: Jarring spinner experience
if (!data) return <Spinner />;

// GOOD: Smooth skeleton loading
if (data === undefined) return <DashboardSkeleton />;
if (data === null) return <EmptyState />;
return <DashboardContent data={data} />;
```

## =Ê State Management Patterns

### 8. Form State with Convex

####  Optimistic Updates Pattern
```typescript
function TodoItem({ todo }) {
  const [optimisticComplete, setOptimisticComplete] = useState(todo.isComplete);
  const updateTodo = useMutation(api.todos.update);
  
  const handleToggle = async () => {
    const newValue = !optimisticComplete;
    setOptimisticComplete(newValue); // Update UI immediately
    
    try {
      await updateTodo({ id: todo._id, isComplete: newValue });
    } catch (error) {
      setOptimisticComplete(todo.isComplete); // Rollback on error
      toast.error("Failed to update");
    }
  };
}
```

### 9. Complex Form State

####  Use Reducer for Multi-field Forms
```typescript
// BAD: Multiple useState calls
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");

// GOOD: Single reducer
const [formData, dispatch] = useReducer(formReducer, initialState);

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

## = Real-time Subscription Patterns

### 10. Selective Field Subscriptions

####  Return Only Required Fields
```typescript
// convex/users.ts
// BAD: Returns entire user object
export const getUser = query({
  handler: async (ctx) => {
    return await ctx.db.get(userId); // All fields
  }
});

// GOOD: Return only needed fields
export const getUserBasic = query({
  handler: async (ctx) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    
    // Only subscribe to changes in these fields
    return {
      id: user._id,
      name: user.name,
      avatar: user.avatar
    };
  }
});
```

### 11. Subscription Batching

####  Batch Related Operations
```typescript
// BAD: Sequential operations
const user = await ctx.db.get(userId);
const org = await ctx.db.get(user.organizationId);
const role = await ctx.db.get(user.roleId);

// GOOD: Parallel operations
const user = await ctx.db.get(userId);
const [org, role] = await Promise.all([
  ctx.db.get(user.organizationId),
  ctx.db.get(user.roleId)
]);
```

## =Â File Structure Patterns

### 12. Component Organization

```
app/
  (protected)/
    dashboard/
      page.tsx              # Server component (no client logic)
      loading.tsx           # Loading UI
      error.tsx            # Error boundary
components/
  dashboard/
    DashboardClient.tsx    # Client component with Convex
    DashboardSkeleton.tsx  # Loading skeleton
    subcomponents/         # Feature-specific components
hooks/
  useDashboard.ts         # All dashboard-related Convex hooks
```

### 13. Hook File Structure

```
hooks/
  useUser.ts              # User-related queries/mutations
  useOrganization.ts      # Organization domain
  useOnboarding.ts        # Onboarding flow
  shared/
    useDebounce.ts        # Utility hooks
    useOptimistic.ts      # Reusable patterns
```

## =¨ Anti-Patterns to AVOID

### L Never Do These:

1. **Multiple `useQuery` for the same data in different components**
2. **Using `useQuery` in server components**
3. **Creating new functions inside render without `useCallback`**
4. **Forgetting to memoize expensive computations**
5. **Using `.filter()` in Convex queries instead of indexes**
6. **Returning entire documents when you need 2 fields**
7. **Not handling loading states properly (undefined vs null)**
8. **Client-side data joining instead of Convex denormalization**
9. **Creating components without proper error boundaries**
10. **Using multiple `useState` for related form fields**

## =Ë Performance Checklist

Before creating any component:
- [ ] Is this a server or client component?
- [ ] Can I get all data in a single Convex query?
- [ ] Have I memoized expensive computations?
- [ ] Are my event handlers stable (useCallback)?
- [ ] Am I handling all loading states (undefined/null/error)?
- [ ] Have I avoided duplicate subscriptions?

Before writing Convex functions:
- [ ] Have I denormalized data to reduce client work?
- [ ] Am I using proper indexes (check schema)?
- [ ] Am I returning only necessary fields?
- [ ] Have I batched related operations with Promise.all?
- [ ] Is pagination implemented for large datasets?

## <¯ Key Principles

1. **Server Components = Layout & Structure**
2. **Client Components = Interactivity & Real-time**
3. **One Query Per Route = Fewer Re-renders**
4. **Denormalize in Convex = Simpler Client Code**
5. **Memoize Everything = Predictable Performance**
6. **Skeletons > Spinners = Better UX**
7. **Optimistic Updates = Instant Feedback**

Follow these rules to ensure optimal performance with Next.js App Router and Convex's real-time capabilities.