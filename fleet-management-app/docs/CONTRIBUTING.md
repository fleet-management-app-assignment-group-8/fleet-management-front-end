## 📋 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bugfix-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run dev    # Test in development
   npm run build  # Ensure it builds
   npm run lint   # Check for linting errors
   ```

## 📝 Commit Message Convention

Use conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```bash
feat: add vehicle export functionality
fix: resolve date picker issue in reports
docs: update authentication guide
refactor: optimize vehicle search performance
```

## 🎨 Code Style Guidelines

### TypeScript/React

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks
- Use proper type annotations (avoid `any`)

### File Organization

- Components: PascalCase (e.g., `VehicleCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase in separate files if shared
- Constants: UPPER_SNAKE_CASE

## 🧪 Testing

Currently, the project doesn't have automated tests. When adding tests:

- Place test files next to the component: `Component.test.tsx`
- Use React Testing Library
- Test user interactions, not implementation details
- Aim for meaningful test coverage

## 📚 Documentation

When adding new features:

1. Update relevant README sections
2. Add inline comments for complex logic
3. Document new environment variables in `.env.example`
4. Update TypeScript interfaces and types
5. Add JSDoc comments for utility functions

