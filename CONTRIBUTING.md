# Contributing to HorizonView

Thank you for your interest in contributing to HorizonView! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to maintain a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account (free tier works)
- A Clerk account (free tier works)

### Development Setup

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/horizonview.git
   cd horizonview
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase and Clerk credentials.

4. **Set up the database**:
   - Create a new Supabase project
   - Run the migrations from `supabase/migrations/` in the SQL Editor

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/` - New features (e.g., `feature/add-dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/api-layer`)

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit with clear messages:
   ```bash
   git commit -m "feat: add new feature description"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request against `main`

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Process

1. **Before submitting:**
   - Run `npm run lint` and fix any issues
   - Run `npm test` and ensure all tests pass
   - Update documentation if needed

2. **PR Requirements:**
   - Clear description of changes
   - Reference any related issues
   - All CI checks must pass
   - At least 1 approval from a maintainer

3. **Review Process:**
   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, a maintainer will merge

## 💻 Code Style

### TypeScript

- Use TypeScript for all new code
- Define types for props and function parameters
- Avoid `any` type when possible
- Use interfaces for object shapes

### React

- Use functional components with hooks
- Keep components focused and reusable
- Use proper prop types with TypeScript interfaces
- Follow React best practices for performance

### CSS

- Use Tailwind CSS classes
- Follow the dark theme conventions
- Keep animations smooth and performant

### Naming Conventions

- **Files**: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

### Writing Tests

- Place tests in `src/__tests__/`
- Follow the existing test patterns
- Test both happy path and edge cases
- Aim for meaningful coverage, not 100%

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## ❓ Questions?

Feel free to [open an issue](https://github.com/affanshaikhsurab/horizonview/issues) for any questions or reach out to the maintainers.

---

Thank you for contributing! 🚀
