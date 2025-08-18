# Contributing to Home Budget App

First off, thank you for considering contributing to the Home Budget App! It's people like you that make this project such a great tool. We welcome contributions from everyone, regardless of their level of experience.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- **Be Respectful**: Treat everyone with respect. No harassment, discrimination, or inappropriate behavior will be tolerated.
- **Be Collaborative**: Work together towards common goals. Share knowledge and help others learn.
- **Be Professional**: Maintain professionalism in all interactions. Constructive criticism is welcome, but be kind.
- **Be Inclusive**: Welcome newcomers and help them get started. Everyone was a beginner once.

## 🚀 Getting Started

1. **Fork the Repository**: Click the "Fork" button at the top of the repository page.

2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/your-username/home-budget.git
   cd home-budget
   ```

3. **Add Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/wliant/home-budget.git
   ```

4. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

5. **Set Up Development Environment**: Follow the installation instructions in the [README.md](README.md).

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear Title**: Summarize the issue in a few words
- **Description**: Detailed description of the bug
- **Steps to Reproduce**: List the exact steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable, add screenshots
- **Environment**:
  - OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
  - Browser: [e.g., Chrome 96, Firefox 95]
  - Node version: [e.g., 16.13.0]
  - Java version: [e.g., 17.0.1]

**Bug Report Template**:
```markdown
## Bug Description
[Clear and concise description]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- OS: 
- Browser: 
- Node version: 
- Java version: 
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear Title**: Summarize the enhancement
- **Detailed Description**: Provide a detailed description of the proposed enhancement
- **Use Case**: Explain why this enhancement would be useful
- **Possible Implementation**: If you have ideas on how to implement it
- **Alternatives**: Any alternative solutions or features you've considered

**Enhancement Template**:
```markdown
## Enhancement Description
[Clear description of the enhancement]

## Use Case
[Why is this enhancement needed?]

## Proposed Solution
[How do you think this should work?]

## Alternatives Considered
[Any other approaches you've thought about]

## Additional Context
[Any other context or screenshots]
```

### Contributing Code

1. **Find an Issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Comment on the Issue**: Let others know you're working on it
3. **Write Code**: Follow our style guidelines
4. **Write Tests**: Ensure your code is tested
5. **Submit a Pull Request**: Follow our PR process

## 💻 Development Process

### Backend Development (Java/Spring Boot)

1. **Project Structure**:
   ```
   addon-app/
   ├── src/main/java/
   │   ├── controller/    # REST controllers
   │   ├── service/       # Business logic
   │   ├── repository/    # Data access layer
   │   ├── entity/        # JPA entities
   │   ├── dto/           # Data transfer objects
   │   └── config/        # Configuration classes
   ```

2. **Running the Backend**:
   ```bash
   cd addon-app
   ./gradlew bootRun
   ```

3. **Running Backend Tests**:
   ```bash
   ./gradlew test
   ```

### Frontend Development (React/TypeScript)

1. **Project Structure**:
   ```
   web/src/
   ├── api/          # API integration
   ├── components/   # Reusable components
   ├── contexts/     # React contexts
   ├── pages/        # Page components
   ├── theme/        # Theme configuration
   └── utils/        # Utility functions
   ```

2. **Running the Frontend**:
   ```bash
   cd web
   npm run dev
   ```

3. **Running Frontend Tests**:
   ```bash
   npm test
   ```

## 🎨 Style Guidelines

### Java Style Guide

- **Indentation**: Use 4 spaces (no tabs)
- **Line Length**: Maximum 120 characters
- **Naming Conventions**:
  - Classes: `PascalCase`
  - Methods/Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Packages: `lowercase`
- **Comments**: Use Javadoc for public methods and classes
- **Imports**: Organize imports, remove unused ones

**Example**:
```java
/**
 * Service for managing expenses.
 */
@Service
public class ExpenseService {
    private static final String DEFAULT_CURRENCY = "USD";
    
    private final ExpenseRepository expenseRepository;
    
    /**
     * Creates a new expense.
     * 
     * @param expense the expense to create
     * @return the created expense
     */
    public Expense createExpense(Expense expense) {
        // Implementation
    }
}
```

### TypeScript/React Style Guide

- **Indentation**: Use 2 spaces
- **Line Length**: Maximum 100 characters
- **Naming Conventions**:
  - Components: `PascalCase`
  - Functions/Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Types/Interfaces: `PascalCase`
- **Components**: Use functional components with hooks
- **Types**: Always use TypeScript types/interfaces
- **Imports**: Organize imports (React first, then external, then internal)

**Example**:
```typescript
import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import { ExpenseService } from '../services/ExpenseService';

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  initialData?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Expense>(initialData || {
    description: '',
    amount: 0,
  });

  // Component implementation
};

export default ExpenseForm;
```

### CSS/Styling Guidelines

- Use Material-UI's `sx` prop or styled components
- Follow mobile-first responsive design
- Use theme variables for colors and spacing
- Maintain consistent spacing (use theme spacing units)

## 🧪 Testing Guidelines

### Backend Testing

- **Unit Tests**: Test individual methods and classes
- **Integration Tests**: Test API endpoints
- **Test Coverage**: Aim for at least 80% coverage
- **Naming**: Use descriptive test names

**Example**:
```java
@Test
void testCreateExpense_WithValidData_ShouldReturnCreatedExpense() {
    // Given
    Expense expense = new Expense();
    expense.setDescription("Test expense");
    
    // When
    Expense created = expenseService.createExpense(expense);
    
    // Then
    assertNotNull(created);
    assertEquals("Test expense", created.getDescription());
}
```

### Frontend Testing

- **Component Tests**: Test component rendering and behavior
- **Integration Tests**: Test component interactions
- **Coverage**: Aim for at least 70% coverage
- **Tools**: Use React Testing Library and Vitest

**Example**:
```typescript
describe('ExpenseForm', () => {
  it('should render form fields', () => {
    render(<ExpenseForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const handleSubmit = jest.fn();
    render(<ExpenseForm onSubmit={handleSubmit} />);
    
    await userEvent.type(screen.getByLabelText('Description'), 'Test');
    await userEvent.type(screen.getByLabelText('Amount'), '100');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test',
        amount: 100,
      })
    );
  });
});
```

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(expenses): add recurring expense support"

# Bug fix
git commit -m "fix(auth): resolve login redirect issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(api): simplify expense service logic"
```

### Commit Best Practices

- Keep commits atomic (one feature/fix per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable: `fix(auth): resolve login issue #123`
- Use present tense: "add feature" not "added feature"

## 🔄 Pull Request Process

1. **Update Your Fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Changes**:
   - Write code
   - Add tests
   - Update documentation

4. **Run Tests**:
   ```bash
   # Backend
   cd addon-app && ./gradlew test
   
   # Frontend
   cd web && npm test
   ```

5. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

6. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature
   ```

7. **Create Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

### Pull Request Template

```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where necessary
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Fixes #(issue number)

## Screenshots
[If applicable]
```

### PR Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: At least one maintainer reviews
3. **Feedback**: Address any requested changes
4. **Approval**: Maintainer approves
5. **Merge**: PR is merged to main branch

## 🌟 Recognition

Contributors will be recognized in the following ways:

- Listed in the project's contributors section
- Mentioned in release notes for significant contributions
- Special badges for regular contributors
- Public acknowledgment in project communications

## 💬 Community

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For general discussions
- **Email**: [project-email@example.com]

### Getting Help

If you need help:

1. Check the documentation
2. Search existing issues
3. Ask in GitHub Discussions
4. Create a new issue with the `question` label

### Code Reviews

All submissions require review. We use GitHub pull requests for this purpose. Consult [GitHub Help](https://help.github.com/articles/about-pull-requests/) for more information.

## 📚 Additional Resources

- [Project Documentation](docs/)
- [API Documentation](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [React Documentation](https://reactjs.org/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Material-UI Documentation](https://mui.com/)

## 🙏 Thank You!

Thank you for taking the time to contribute to the Home Budget App! Your efforts help make this project better for everyone. We look forward to your contributions!

---

**Remember**: The best way to get started is to pick an issue labeled `good first issue` and dive in. Don't hesitate to ask questions – we're here to help!
