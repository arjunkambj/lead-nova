# Style & UI Guidelines

## Core Style Rules

### Icon Usage

- Always use `@iconify/react` for icons
- Never use other icon libraries

### Color System

#### Opacity Rules

- **NEVER use opacity classes like `color-50/50`, `color-200/50`**
- Use colors directly without opacity modifiers
- Example:

  ```tsx
  // BAD
  <div className="bg-primary-50/20">

  // GOOD
  <div className="bg-primary-50">
  ```

#### Theme Colors

- Use semantic Tailwind classes and HeroUI props
- Do not import raw color tokens into components
- If theme changes are needed, update `/styles/hero.ts`

### HeroUI Components

#### Available Theme Colors (Tailwind Classes)

```tsx
// Primary colors (automatically adapt to light/dark mode)
bg-primary, text-primary, border-primary       // Indigo
bg-secondary, text-secondary, border-secondary // Blue
bg-success, text-success, border-success       // Emerald
bg-warning, text-warning, border-warning       // Orange
bg-danger, text-danger, border-danger          // Rose

// Neutral colors
bg-default-{50-900}                            // Zinc grays
bg-background, text-foreground                 // Automatic theme colors

// Elevation layers (for cards and surfaces)
bg-content1  // Highest elevation
bg-content2  // Mid-high elevation
bg-content3  // Mid-low elevation
bg-content4  // Lowest elevation
```

#### Component Props

- Use built-in HeroUI props for states

  ```tsx
  // GOOD - Use built-in props
  <Button isLoading={isSubmitting}>Submit</Button>
  <Input isDisabled={isProcessing} />
  <Card isBlurred={!isReady} />

  // BAD - Custom state implementations
  <Button disabled={isSubmitting}>
    {isSubmitting ? <Spinner /> : 'Submit'}
  </Button>
  ```

#### Skeleton Components

- Use HeroUI's `Skeleton` component for loading states

  ```tsx
  import { Skeleton } from "@heroui/react";

  <Skeleton className="rounded-lg">
    <div className="h-24 rounded-lg bg-default-300"></div>
  </Skeleton>;
  ```

### Tailwind CSS Usage

#### Class Order

Follow this order for Tailwind classes:

1. Layout (display, position, float)
2. Box Model (width, height, padding, margin)
3. Typography (font, text)
4. Visual (background, border, shadow)
5. Animation/Transition
6. Other

#### Responsive Design

- Mobile-first approach
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Example:
  ```tsx
  <div className="p-4 md:p-6 lg:p-8">
  ```

### Dark Mode

#### Automatic Adaptation

- HeroUI components automatically adapt to dark mode
- Use semantic tokens that work in both modes:

  ```tsx
  // GOOD - Automatic dark mode support
  <div className="bg-background text-foreground">
    <Card> {/* Automatically adapts */}
      Content
    </Card>
  </div>

  // BAD - Hardcoded colors
  <div className="bg-white text-black dark:bg-black dark:text-white">
  ```

### Typography

#### Font Sizes

Use Tailwind's typography scale:

- `text-xs` - 12px
- `text-sm` - 14px
- `text-base` - 16px (default)
- `text-lg` - 18px
- `text-xl` - 20px
- `text-2xl` - 24px
- `text-3xl` - 30px
- `text-4xl` - 36px

#### Font Weights

- `font-light` - 300
- `font-normal` - 400
- `font-medium` - 500
- `font-semibold` - 600
- `font-bold` - 700

### Spacing

#### Consistent Spacing

Use Tailwind's spacing scale consistently:

- Small gaps: `space-y-2`, `gap-2`
- Medium gaps: `space-y-4`, `gap-4`
- Large gaps: `space-y-6`, `gap-6`, `space-y-8`, `gap-8`

#### Container Padding

Standard container padding:

```tsx
<div className="px-4 sm:px-6 lg:px-8">
```

### Forms

#### Input Styling

Use HeroUI's Input component with proper variants:

```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  variant="bordered" // or "flat", "faded", "underlined"
  color="primary"
  size="md" // or "sm", "lg"
/>
```

#### Form Layout

```tsx
<form className="space-y-4">
  <Input label="Name" />
  <Input label="Email" />
  <Button type="submit" color="primary">
    Submit
  </Button>
</form>
```

### Cards & Surfaces

#### Card Usage

```tsx
<Card className="p-6">
  <CardHeader>
    <h3 className="text-lg font-semibold">Title</h3>
  </CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

#### Surface Elevation

Use content layers for visual hierarchy:

- `bg-content1` - Primary surfaces (cards, modals)
- `bg-content2` - Secondary surfaces
- `bg-content3` - Tertiary surfaces
- `bg-content4` - Background surfaces

### Animations

#### Transition Classes

```tsx
// Smooth transitions
<div className="transition-all duration-200 ease-in-out">

// Hover effects
<Button className="hover:scale-105 transition-transform">

// Loading animations
<div className="animate-pulse">
```

### Best Practices

1. **Never override HeroUI component styles directly**
   - Use provided props and variants
   - Create wrapper components if needed

2. **Maintain consistency**
   - Use the same spacing patterns throughout
   - Stick to the defined color palette
   - Follow established component patterns

3. **Accessibility**
   - Always include proper ARIA labels
   - Ensure sufficient color contrast
   - Support keyboard navigation

4. **Performance**
   - Avoid unnecessary style recalculations
   - Use CSS classes over inline styles
   - Leverage Tailwind's purge for production

5. **Type Definitions**
   - **ALWAYS import types from `/types` folder**
   - **NEVER define types directly in component files**
   - Centralize all type definitions for reusability
   - Example:
     ```tsx
     // ✅ GOOD - Import from types folder
     import { User, Organization, DashboardData } from "@/types/core";
     import { ShopifyOrder, ShopifyProduct } from "@/types/shopify";
     
     // ❌ BAD - Defining types in component
     interface User {
       id: string;
       name: string;
     }
     
     // ❌ BAD - Inline type definitions
     const Component = ({ data }: { data: { id: string; name: string } }) => {
     ```

## Theme Configuration

The custom Meyoo theme is defined in `/styles/hero.ts` with:

- **Primary**: Indigo color palette
- **Secondary**: Blue color palette
- **Success**: Emerald color palette
- **Warning**: Orange color palette
- **Danger**: Rose color palette
- **Default**: Zinc grays for neutrals

All components should respect this theme configuration and use semantic color tokens rather than hardcoded values.
