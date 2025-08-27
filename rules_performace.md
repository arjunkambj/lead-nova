# Performance & Developer Experience Guide (Next.js + Convex + HeroUI)

## 🚨 Critical Performance Patterns

### 1. Query Optimization

#### ❌ Anti-pattern: Multiple Parallel Queries
```tsx
// BAD - Creates multiple WebSocket subscriptions
const user = useCurrentUser();
const org = useOrganization();
const settings = useSettings();
```

#### ✅ Best Practice: Batch Related Queries
```tsx
// GOOD - Single subscription, one round-trip
const data = useCombinedData(); // Returns { user, org, settings }
```

**Impact:** Reduces WebSocket connections by 60-70%, faster initial load

### 2. Component Memoization

#### ❌ Anti-pattern: Recreating Values on Every Render
```tsx
// BAD - Recalculates on every render
const isReady = user && org && !loading;
const config = { theme: user?.theme, locale: user?.locale };
```

#### ✅ Best Practice: Use useMemo for Derived State
```tsx
// GOOD - Only recalculates when dependencies change
const isReady = useMemo(() => user && org && !loading, [user, org, loading]);
const config = useMemo(() => ({ 
  theme: user?.theme, 
  locale: user?.locale 
}), [user?.theme, user?.locale]);
```

**Impact:** Prevents 30-50% of unnecessary re-renders

### 3. Event Handler Stability

#### ❌ Anti-pattern: Inline Functions
```tsx
// BAD - New function reference every render
<Button onClick={() => handleSubmit(data)}>Submit</Button>
```

#### ✅ Best Practice: Use useCallback
```tsx
// GOOD - Stable reference across renders
const onSubmit = useCallback(() => handleSubmit(data), [data]);
<Button onClick={onSubmit}>Submit</Button>
```

**Impact:** Prevents child component re-renders, smoother interactions

## 🏗️ Architecture Patterns

### 4. Server vs Client Components

#### ❌ Anti-pattern: Client Components at Layout Level
```tsx
// BAD - Forces entire subtree to client-render
// app/layout.tsx
"use client";
export default function Layout({ children }) {
  const user = useUser();
  return <div>{children}</div>;
}
```

#### ✅ Best Practice: Server Components by Default
```tsx
// GOOD - Server component with client leaves
// app/layout.tsx (no "use client")
export default function Layout({ children }) {
  return (
    <div>
      <ClientHeader /> {/* Client component only where needed */}
      {children}
    </div>
  );
}
```

**Impact:** 40% smaller bundle size, faster initial page load

### 5. Loading State Management

#### ❌ Anti-pattern: Waterfall Loading
```tsx
// BAD - Sequential checks create loading waterfalls
if (user === undefined) return <Spinner />;
if (org === undefined) return <Spinner />;
if (settings === undefined) return <Spinner />;
```

#### ✅ Best Practice: Unified Loading States
```tsx
// GOOD - Single loading check
const isLoading = !user || !org || !settings;
if (isLoading) return <LoadingSkeleton />;
```

**Impact:** Eliminates layout shift, better perceived performance

### 6. Navigation Optimization

#### ❌ Anti-pattern: Client-side Navigation Without Prefetch
```tsx
// BAD - No prefetching
router.push('/next-page');
```

#### ✅ Best Practice: Use Next.js Link & Prefetch
```tsx
// GOOD - Automatic prefetching on hover
import Link from 'next/link';
<Link href="/next-page" prefetch>Continue</Link>

// For programmatic navigation
useEffect(() => {
  router.prefetch('/next-page'); // Prefetch when idle
}, []);
```

**Impact:** 200-300ms faster page transitions

## 💾 Convex-Specific Optimizations

### 7. Database Query Patterns

#### ❌ Anti-pattern: Sequential Database Queries
```tsx
// BAD - Each await blocks the next
const user = await ctx.db.get(userId);
const org = await ctx.db.get(user.orgId);
const settings = await ctx.db.get(user.settingsId);
```

#### ✅ Best Practice: Parallel Queries with Promise.all
```tsx
// GOOD - All queries run in parallel
const [user, org, settings] = await Promise.all([
  ctx.db.get(userId),
  ctx.db.get(orgId),
  ctx.db.get(settingsId)
]);
```

**Impact:** 50-60% faster query execution

### 8. Index Usage

#### ❌ Anti-pattern: Filtering Without Indexes
```tsx
// BAD - Full table scan
const items = await ctx.db
  .query("items")
  .collect()
  .filter(item => item.userId === userId);
```

#### ✅ Best Practice: Always Use Indexes
```tsx
// GOOD - Efficient index lookup
const items = await ctx.db
  .query("items")
  .withIndex("by_user", q => q.eq("userId", userId))
  .collect();
```

**Impact:** 10-100x faster queries on large datasets

### 9. Mutation Patterns

#### ❌ Anti-pattern: Multiple Round Trips
```tsx
// BAD - Multiple mutations
await updateUser({ name });
await updateUser({ email });
await updateUser({ phone });
```

#### ✅ Best Practice: Batch Updates
```tsx
// GOOD - Single mutation
await updateUser({ name, email, phone });
```

**Impact:** 3x faster updates, atomic operations

## 🎨 UI/UX Performance

### 10. Optimistic Updates

#### ❌ Anti-pattern: Wait for Server Response
```tsx
// BAD - UI freezes during save
const handleSave = async () => {
  setLoading(true);
  await mutation(data);
  setLoading(false);
};
```

#### ✅ Best Practice: Update UI Immediately
```tsx
// GOOD - Instant feedback
const handleSave = async () => {
  setLocalData(newData); // Update UI immediately
  try {
    await mutation(newData);
  } catch (error) {
    setLocalData(oldData); // Rollback on error
    toast.error("Failed to save");
  }
};
```

**Impact:** Instant UI response, better user experience

### 11. Animation Performance

#### ❌ Anti-pattern: Unmemoized Animation Components
```tsx
// BAD - Recreates animation on every parent render
<motion.div animate={{ x: position }} />
```

#### ✅ Best Practice: Memoize Animation Components
```tsx
// GOOD - Only re-renders when props change
const AnimatedComponent = memo(({ position }) => (
  <motion.div animate={{ x: position }} />
));
```

**Impact:** Smoother animations, 60fps consistency

### 12. Form Performance

#### ❌ Anti-pattern: Uncontrolled Re-renders
```tsx
// BAD - Every keystroke re-renders entire form
<Form>
  <Input value={formData.field1} onChange={updateForm} />
  <ExpensiveComponent /> {/* Re-renders on every input change */}
</Form>
```

#### ✅ Best Practice: Isolate Form State
```tsx
// GOOD - Only input components re-render
<Form>
  <InputField name="field1" /> {/* Isolated state */}
  <ExpensiveComponent /> {/* Doesn't re-render */}
</Form>
```

**Impact:** 80% fewer re-renders in complex forms

## 🎨 HeroUI-Specific Optimizations

### 13. HeroUI Component Best Practices

#### ✅ Best Practice: Leverage Built-in Optimizations
```tsx
// GOOD - Use HeroUI's built-in loading states
<Button isLoading={isSubmitting}>Submit</Button>
<Input isDisabled={isProcessing} />
<Card isBlurred={!isReady} />

// Use HeroUI Skeleton components for loading
import { Skeleton } from "@heroui/react";
<Skeleton className="rounded-lg">
  <div className="h-24 rounded-lg bg-default-300"></div>
</Skeleton>
```

#### ✅ Best Practice: Use Theme Colors via Tailwind Classes
```tsx
// GOOD - Use semantic color classes directly (no imports needed)
<Button color="primary">Submit</Button>
<Alert color="danger">Error message</Alert>
<Badge color="success">Active</Badge>

// Use Tailwind classes with theme colors
<div className="bg-primary text-primary-foreground">
<div className="bg-success text-white">
<div className="border-danger bg-danger-50">

// DON'T hardcode Tailwind colors
// BAD: <div className="bg-blue-500">
// GOOD: <div className="bg-primary">
```

#### ✅ Best Practice: Optimize HeroUI Lists
```tsx
// GOOD - Memoize HeroUI components in lists
const MemoizedCard = memo(({ item }) => (
  <Card key={item.id}>
    <CardBody>{item.content}</CardBody>
  </Card>
));

// Use HeroUI's virtualized Table for large datasets
<Table 
  isVirtualized
  aria-label="Data table"
  bottomContent={<Pagination />}
>
  {/* Table content */}
</Table>
```

### 14. Theme & Color Management

#### ✅ Best Practice: Use Semantic Color Classes
```tsx
// Use semantic color classes (automatically adapt to light/dark mode)
<Card className="bg-content1"> {/* Highest elevation */}
  <CardHeader className="text-foreground">
    Title
  </CardHeader>
  <CardBody className="text-default-500">
    Content
  </CardBody>
</Card>

// Available theme colors (all work with Tailwind):
// bg-primary, text-primary, border-primary     → Indigo
// bg-secondary, text-secondary                 → Blue  
// bg-success, text-success                     → Emerald
// bg-warning, text-warning                     → Orange
// bg-danger, text-danger                       → Rose
// bg-default-{50-900}                         → Zinc grays
```

#### ✅ Best Practice: Respect Dark Mode
```tsx
// GOOD - Let HeroUI handle dark mode automatically
<div className="bg-background text-foreground">
  <Card> {/* Automatically adapts */}
    Content
  </Card>
</div>

// Use content1-4 for elevation layers
<div className="bg-content1"> {/* Highest elevation */}
<div className="bg-content2"> {/* Mid elevation */}
<div className="bg-content3"> {/* Lower elevation */}
<div className="bg-content4"> {/* Lowest elevation */}
```

## 🛠️ Developer Experience

### 15. Error Boundaries

#### ✅ Best Practice: Graceful Error Handling
```tsx
// Wrap features in error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <FeatureComponent />
</ErrorBoundary>
```

**Impact:** Prevents entire app crashes, better user experience

### 16. Type Safety

#### ✅ Best Practice: Strict Convex Validators
```tsx
// Define strict input/output types
export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.union(v.object({ /* user fields */ }), v.null()),
  handler: async (ctx, args) => { /* ... */ }
});
```

**Impact:** Catch errors at compile time, safer refactoring

### 17. Code Splitting

#### ✅ Best Practice: Dynamic Imports
```tsx
// Load heavy components only when needed
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

**Impact:** 30-40% smaller initial bundle

## 📊 Performance Monitoring

### 18. Metrics to Track

```tsx
// Track Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms  
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 200ms

// Convex Metrics
- Query execution time: < 100ms
- Mutation execution time: < 200ms
- WebSocket reconnection time: < 1s
```

### 19. Performance Testing

```bash
# Run performance audits
npm run build
npm run analyze  # Bundle analysis
lighthouse http://localhost:3000  # Lighthouse audit

# Profile in production
- Use React DevTools Profiler
- Monitor with Vercel Analytics
- Set up Sentry performance monitoring
```

## ✅ Implementation Checklist

### Priority 1 - Critical (Implement First)
- [ ] Batch related Convex queries
- [ ] Add indexes to all database queries  
- [ ] Remove client components from layouts
- [ ] Fix loading state waterfalls

### Priority 2 - High Impact
- [ ] Implement useMemo for derived values
- [ ] Add useCallback to event handlers
- [ ] Set up route prefetching
- [ ] Add error boundaries

### Priority 3 - Optimization
- [ ] Implement optimistic updates
- [ ] Add suspense boundaries
- [ ] Memoize expensive components
- [ ] Set up code splitting

### Priority 4 - Monitoring
- [ ] Set up performance monitoring
- [ ] Add analytics tracking
- [ ] Configure error reporting
- [ ] Create performance dashboard

## 🚀 Quick Wins (< 1 hour each)

1. **Add React.memo to heavy components** - 5 min per component
2. **Replace multiple queries with batched query** - 30 min
3. **Add indexes to Convex queries** - 10 min per query
4. **Implement route prefetching** - 20 min
5. **Add loading skeletons** - 15 min per page

## 📈 Expected Impact

Following these patterns should result in:
- **50-70% reduction in unnecessary re-renders**
- **40-60% faster page transitions**
- **30-50% smaller JavaScript bundle**
- **2-3x faster database queries**
- **60% fewer WebSocket connections**
- **Better Core Web Vitals scores**

## 🎯 HeroUI Stack Note

This guide is optimized for applications using:
- **HeroUI Components** - Pre-optimized React components with built-in memoization
- **Custom Meyoo Theme** - Located at `/style/hero.ts` with semantic color tokens
- **Tailwind CSS** - For utility-first styling with HeroUI integration

### Key HeroUI Performance Tips:
1. **Use built-in props** - `isLoading`, `isDisabled`, `isBlurred` instead of custom states
2. **Use theme color classes** - `bg-primary`, `text-success`, etc. instead of hardcoding colors
3. **Leverage Skeleton components** - HeroUI's Skeleton for better loading states
4. **Use virtualized Tables** - For large datasets with `isVirtualized` prop
5. **Respect semantic tokens** - Use `content1-4`, `background`, `foreground` for automatic dark mode

## 🔗 Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Convex Best Practices](https://docs.convex.dev/production/best-practices)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [HeroUI Documentation](https://heroui.com/docs)
- [Custom Theme Configuration](./style/hero.ts)