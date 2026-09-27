# Auth Security Service Specification

## Security Rules
- **OTP Code Generation**: Crypto-random 6-digit number generator.
- **Lockout Verification**: Calculates `Date.now() - lockTime` to enforce 15-minute wait periods.
- **Password Strength Evaluation**: Measures entropy, character diversity (uppercase, lowercase, numbers, symbols), and length.
