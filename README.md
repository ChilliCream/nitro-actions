# ChilliCream Nitro Actions 🚀

A collection of GitHub Actions for ChilliCream's Nitro CLI and GraphQL platform tools.

## Available Actions

### 📤 [fusion-publish](./fusion-publish)
Publishes GraphQL schemas using `nitro fusion publish`

```yaml
- uses: ChilliCream/nitro-actions/fusion-publish@v1
  with:
    tag: 'v1.0.0'
    stage: 'production'
    api-id: 'my-api'
    api-key: ${{ secrets.NITRO_API_KEY }}
```

## Quick Start

1. **Add to your workflow:**
   ```yaml
   name: Deploy Schema
   on:
     push:
       tags: ['v*']
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Publish GraphQL Schema
           uses: ChilliCream/nitro-actions/fusion-publish@v1
           with:
             tag: ${{ github.ref_name }}
             stage: 'production'
             api-id: 'my-api'
             api-key: ${{ secrets.NITRO_API_KEY }}
   ```

2. **Set up secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add `NITRO_API_KEY` with your ChilliCream API key

## Features

✅ **Cross-platform** - Works on Linux, macOS, and Windows runners  
✅ **Automatic Nitro installation** - Downloads and caches the right version  
✅ **Secure** - API keys handled as environment variables  
✅ **Smart caching** - Reuses Nitro installations across jobs  

## Supported Platforms

- 🐧 **Linux** (x64, ARM64)
- 🍎 **macOS** (Intel, Apple Silicon)
- 🪟 **Windows** (x64)

## Installation

No installation required! Just reference the actions in your workflows:

```yaml
uses: ChilliCream/nitro-actions/[action-name]@v1
```

## Security

🔒 **Always use GitHub secrets for API keys:**

```yaml
# ✅ Good
api-key: ${{ secrets.NITRO_API_KEY }}

# ❌ Never do this
api-key: 'my-secret-key'
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

## Support

- 📖 [Documentation](https://chillicream.com/docs)
- 💬 [Discord Community](https://discord.gg/TnNK7Mw)
- 🐛 [Report Issues](https://github.com/ChilliCream/nitro-actions/issues)

## License

MIT - see [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [ChilliCream](https://chillicream.com)