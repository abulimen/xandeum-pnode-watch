# Contributing Guidelines

Thank you for your interest in contributing to the Xandeum pNode Analytics Platform!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
git clone https://github.com/abulimen/xandeum-analytics.git
cd xandeum-analytics
npm install
cp .env.example .env.local
npm run dev
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Commit Messages

Use conventional commits:

```
feat: add node comparison export
fix: resolve map marker clustering
docs: update API documentation
refactor: simplify filter logic
```

## Pull Request Process

1. Update documentation if needed
2. Ensure `npm run lint` passes
3. Test on both light and dark themes
4. Test responsive design
5. Write clear PR description

## Code Style

- TypeScript with strict types
- Functional React components
- Use existing UI components from `components/ui`
- Follow existing file structure

## Questions?

Open an issue or reach out to maintainers.
