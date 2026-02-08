# Wallet Funding Security

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER commit private keys to version control!** The previous version of `fund-wallet.sh` contained a hardcoded private key, which is extremely dangerous.

## Secure Usage

### 1. Set Environment Variable
```bash
export DEPLOYER_PRIVATE_KEY=0x...your_private_key_here
```

### 2. Run the Script
```bash
./fund-wallet.sh 0x1234567890123456789012345678901234567890
```

### 3. Clear the Variable (Optional but Recommended)
```bash
unset DEPLOYER_PRIVATE_KEY
```

## Why This Matters

- Private keys control access to all funds in a wallet
- Committed private keys are exposed to anyone with repository access
- Even if you "remove" them later, they remain in git history
- This can lead to complete loss of funds

## Best Practices

1. **Never hardcode private keys** in any file
2. **Use environment variables** for sensitive data
3. **Add .env files to .gitignore** 
4. **Use throwaway wallets** for development/testing
5. **Rotate keys regularly** if they must be used

## Development Setup

For local development with Anvil, you can use the default Anvil account:

```bash
export DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**⚠️ This key should ONLY be used for local testing, never with real funds!**
