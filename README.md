# React Clean Architecture Template

A production-ready React 18 + TypeScript starter template built on **Clean Architecture** principles. Includes authentication (Better Auth), state management (Recoil), SCSS Modules design system, form validation, and protected routing out of the box.


## Quick Start

```bash
# Install dependencies
yarn install

# Start development server (port 8090)
yarn dev

# Production build
yarn build
```

## Architecture

This project follows **Clean Architecture** (also known as Hexagonal Architecture). The dependency rule is strict: inner layers never depend on outer layers.

```
Domain  <--  Data  <--  Infra  <--  Main  -->  Presentation
```

| Layer | Purpose | Dependencies |
|-------|---------|-------------|
| **Domain** | Business rules, entities, use case interfaces | None (zero deps) |
| **Data** | Use case implementations | Domain |
| **Infra** | Technology adapters (localStorage, HTTP) | Data protocols |
| **Main** | Composition root, factories, routing, config | Everything (wires it all together) |
| **Presentation** | UI components, pages, hooks, styles | Domain interfaces only |
| **Validation** | Form validation strategies | None |

### Why Clean Architecture?

- **Testability**: Each layer can be tested in isolation with mocks.
- **Flexibility**: Swap out auth providers, HTTP clients, or storage without touching business logic.
- **Scalability**: Add new features by following established patterns — no spaghetti.

## Directory Structure

```
src/
├── domain/                    # Business rules (ZERO dependencies)
│   ├── models/                # Entity types (AccountModel)
│   ├── usecases/              # Use case interfaces (Authentication)
│   └── errors/                # Domain errors (InvalidCredentials, Unexpected)
│
├── data/                      # Use case implementations
│   ├── usecases/              # Concrete implementations (RemoteAuthentication)
│   └── protocols/             # External dependency interfaces
│       ├── cache/             # SetStorage, GetStorage
│       └── http/              # HttpClient, HttpStatusCode
│
├── infra/                     # Technology adapters
│   ├── cache/                 # LocalStorageAdapter
│   └── http/                  # AxiosHttpClient (placeholder)
│
├── lib/                       # Third-party client setup
│   └── auth-client.ts         # Better Auth client configuration
│
├── main/                      # Composition root & entry point
│   ├── index.tsx              # App entry (mounts Router)
│   ├── config/                # Environment config, TypeScript declarations
│   │   ├── app-config.ts      # local/dev/stage/prod API URLs
│   │   ├── assets.d.ts        # Image import declarations
│   │   ├── sass-modules.d.ts  # SCSS module declarations
│   │   └── setup-axios-interceptors.ts
│   ├── routes/                # React Router config
│   │   └── router.tsx         # All routes defined here
│   ├── proxies/               # Route guards
│   │   ├── private-route.tsx  # Requires authentication
│   │   └── admin-route.tsx    # Requires admin role
│   ├── factories/             # Object creation (DI)
│   │   ├── pages/             # Page factories
│   │   ├── usecases/          # Use case factories
│   │   ├── validation/        # Validation factories
│   │   └── cache/             # Storage factories
│   ├── adapters/              # Bridge functions (Recoil <-> localStorage)
│   ├── builders/              # Fluent API (ValidationBuilder)
│   └── composites/            # Composite pattern (ValidationComposite)
│
├── presentation/              # UI layer
│   ├── styles/                # Design system (SCSS)
│   │   ├── colors.scss        # Color palette
│   │   ├── fonts.scss         # Typography
│   │   ├── global.scss        # Base resets
│   │   ├── animations.scss    # Keyframe animations
│   │   └── mixins.scss        # Responsive breakpoints + container
│   ├── components/            # Reusable UI components
│   │   ├── atoms/             # Global Recoil atoms
│   │   ├── models/            # Shared component types (FormState)
│   │   ├── feedback-modal/    # Success/error modal
│   │   ├── spinner/           # Loading spinner
│   │   ├── input/             # Base input with validation
│   │   └── form-status/       # Form error display
│   ├── pages/                 # Route pages
│   │   ├── home/              # Landing page
│   │   ├── login/             # Login page + components
│   │   ├── signup/            # Signup page + components
│   │   └── dashboard/         # Protected dashboard
│   ├── hooks/                 # Custom hooks (useLogout)
│   └── protocols/             # UI interfaces (Validation)
│
└── validation/                # Form validation
    ├── validators/            # RequiredField, Email, MinLength, CompareFields
    ├── protocols/             # FieldValidation interface
    └── errors/                # RequiredFieldError, InvalidFieldError
```

## How-To Guides

### Create a New Page

1. **Create the page component**: `src/presentation/pages/my-page/my-page.tsx`
2. **Create styles**: `src/presentation/pages/my-page/my-page-styles.scss`
3. **If it has form state**, create a `components/` subdirectory with Recoil atoms + form components
4. **Export from barrel**: Add to `src/presentation/pages/index.tsx`
5. **Create a factory**: `src/main/factories/pages/my-page/my-page-factory.tsx`
6. **Add route**: Register in `src/main/routes/router.tsx`

Example factory:
```tsx
import React from 'react';
import { MyPage } from '@/presentation/pages';

export const MyPageFactory: React.FC = () => {
  return <MyPage />;
};
```

### Create a Reusable Component

1. Create directory: `src/presentation/components/my-component/`
2. Add `my-component.tsx` and `my-component-styles.scss`
3. Export from `src/presentation/components/index.tsx`

### Create a Custom Hook

1. Add file: `src/presentation/hooks/use-my-hook.ts`
2. Export from `src/presentation/hooks/index.ts`

### Add a New Use Case

1. **Domain interface**: `src/domain/usecases/my-usecase.ts`
2. **Data implementation**: `src/data/usecases/remote-my-usecase.ts`
3. **Factory**: `src/main/factories/usecases/my-usecase/remote-my-usecase-factory.ts`
4. **Inject into page** via the page factory

### Add Form Validation

Use the fluent `ValidationBuilder`:
```ts
import { ValidationComposite } from '@/main/composites';
import { ValidationBuilder as Builder } from '@/main/builders';

export const makeMyFormValidation = (): ValidationComposite => {
  return ValidationComposite.build([
    ...Builder.field('email').required().email().build(),
    ...Builder.field('password').required().min(8).build(),
    ...Builder.field('confirmPassword').required().sameAs('password').build()
  ]);
};
```

## Styling System

### SCSS Modules

All styles use CSS Modules via SCSS. Import them as objects:
```tsx
import Styles from './my-component-styles.scss';

<div className={Styles.container}>...</div>
```

### Color Palette

Customize colors in `src/presentation/styles/colors.scss`:
- `$primary`, `$primaryDark`, `$primaryForeground` -- Main brand colors
- `$accent`, `$accentHover` -- Call-to-action color
- `$textPrimary`, `$textSecondary`, `$textMuted` -- Text hierarchy
- `$border`, `$inputBorder`, `$inputBorderFocus` -- Borders
- `$valid`, `$invalid` -- Form validation colors

### Typography

Defined in `src/presentation/styles/fonts.scss`:
- `$fontHeading: 'Oswald'` -- For headings, buttons, labels
- `$fontBody: 'Inter'` -- For body text, inputs, paragraphs

Both are loaded via Google Fonts in the HTML templates.

### Responsive Breakpoints

Defined in `src/presentation/styles/mixins.scss`:
```scss
@include sm { ... }  // >= 640px
@include md { ... }  // >= 768px
@include lg { ... }  // >= 1024px
@include xl { ... }  // >= 1280px
```

Container mixin for centered, padded content:
```scss
.wrapper {
  @include container;
}
```

## Authentication Flow

Authentication uses [Better Auth](https://www.better-auth.com/) with cookie-based sessions.

### How it works

1. **Sign In**: `RemoteAuthentication.auth()` calls `authClient.signIn.email()`. On success, the account is stored in Recoil and persisted to localStorage.
2. **Sign Up**: `RemoteAuthentication.signUp()` calls `authClient.signUp.email()`. Same account storage flow.
3. **Sign Out**: `useLogout()` hook calls `authClient.signOut()`, clears Recoil state, and redirects to `/login`.
4. **Session persistence**: On page reload, `getCurrentAccountAdapter()` reads from localStorage and hydrates Recoil via `RecoilRoot initializeState`.
5. **Route protection**: `PrivateRoute` checks for a valid session. `AdminRoute` additionally checks for `role === 'admin'`.
6. **401 handling**: Axios interceptor catches 401 responses, clears the account, and redirects to login.

### Configuration

Update your backend URL in `src/main/config/app-config.ts`:
```ts
const local: AppConfig = {
  api: {
    ENDPOINT: 'http://localhost:3000/api',
    AUTH_URL: 'http://localhost:3000'
  }
};
```

## Design Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Factory** | `main/factories/` | Creates pages and use cases with injected dependencies |
| **Builder** | `main/builders/validation-builder.ts` | Fluent API for building validation chains |
| **Composite** | `main/composites/validation-composite.ts` | Combines multiple validators into one |
| **Adapter** | `infra/cache/`, `main/adapters/` | Wraps third-party APIs (localStorage, axios) |
| **Proxy** | `main/proxies/` | Auth guards for protected routes |
| **Strategy** | `validation/validators/` | Interchangeable validation rules |
| **DI** | Everywhere | Dependencies injected via constructors/props |

## Available Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server on port 8090 with hot reload |
| `yarn build` | Production build to `dist/` |
| `yarn test` | Run tests (Jest) |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:ci` | Run tests with coverage |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Run ESLint with auto-fix |

## Tech Stack

- **React** 18 with TypeScript
- **Webpack** 5 (dev server + production build)
- **SCSS Modules** with Dart Sass
- **Recoil** for state management
- **React Router** v6 for routing
- **Better Auth** for authentication
- **Axios** for HTTP requests
- **React Helmet Async** for SEO
- **Lucide React** for icons

## Production Build Notes

The production build uses CDN externals for React, ReactDOM, Recoil, and axios to reduce bundle size. These are loaded from unpkg in `template.prod.html`.

## Environment Variables

Set `REACT_APP_STAGE` in your `.env` file:
- `local` -- Development against localhost (default)
- `dev` -- Development server
- `stage` -- Staging/QA server
- `prod` -- Production

## Naming Conventions

- **Files**: kebab-case (`remote-authentication.ts`, `login-factory.tsx`)
- **Styles**: `{component}-styles.scss` next to the component
- **Factories**: `{purpose}-factory.ts/tsx`
- **Data use cases**: `remote-{name}.ts` prefix
- **Classes/Interfaces**: PascalCase
- **Functions**: camelCase
- **Barrel exports**: Every directory has an `index.ts`
