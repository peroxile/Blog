# Security Best Practices

Essential security guidelines for modern applications.

## Authentication

Always use secure authentication methods.

### Password Storage
- Use hashing (bcrypt, argon2)
- Never store plain text
- Use salt values

### Session Management
- Use HTTPOnly cookies
- Implement CSRF protection
- Set reasonable timeouts

## Data Protection

Protect user data with encryption.

## API Security

- Use HTTPS only
- Validate all inputs
- Rate limiting