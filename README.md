# Nitro Fusion Publish Action

Publishes GraphQL schemas using ChilliCream's Nitro CLI `fusion publish` command.

## Usage

```yaml
- name: Publish GraphQL Schema
  uses: ChilliCream/nitro-fusion-publish-action@v1
  with:
    tag: 'v1.0.0'
    stage: 'production'
    api-id: 'my-api'
    api-key: ${{ secrets.NITRO_API_KEY }}
```

## Inputs

### Required

| Name | Description |
|------|-------------|
| `tag` | The tag of the schema version to deploy |
| `stage` | The name of the stage (e.g., `production`, `staging`) |
| `api-id` | The ID of the API |
| `api-key` | API key for authentication ⚠️ Use secrets! |

### Optional

| Name | Description | Default |
|------|-------------|---------|
| `cloud-url` | The URL of the API | `api.chillicream.com` |
| `working-directory` | Working directory for the command | `.` |
| `source-schema-file` | Path to source schema file (`.graphqls`) | |
| `source-schema-files` | Path to multiple source schema files (`.graphqls`) | |
| `nitro-version` | Specific version of Nitro to use | `latest` |

## Outputs

| Name | Description |
|------|-------------|
| `success` | Whether the publish was successful (`true`/`false`) |
| `schema-id` | The ID of the published schema (if returned by Nitro) |

## Examples

### Basic Usage

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
      
      - name: Publish to Production
        uses: ChilliCream/nitro-fusion-publish-action@v1
        with:
          tag: ${{ github.ref_name }}
          stage: 'production'
          api-id: 'my-api'
          api-key: ${{ secrets.NITRO_API_KEY }}
```

### With Custom Schema File

```yaml
- name: Publish Schema
  uses: ChilliCream/nitro-fusion-publish-action@v1
  with:
    tag: 'v2.1.0'
    stage: 'staging'
    api-id: 'my-api'
    api-key: ${{ secrets.NITRO_API_KEY }}
    source-schema-file: 'schemas/my-schema.graphqls'
    working-directory: './backend'
```

### With Multiple Custom Schema Files

```yaml
- name: Publish Schema
  uses: ChilliCream/nitro-fusion-publish-action@v1
  with:
    tag: 'v2.1.0'
    stage: 'staging'
    api-id: 'my-api'
    api-key: ${{ secrets.NITRO_API_KEY }}
    source-schema-files: |
      a.graphqls
      b.graphqls
      schemas/c.graphqls
    working-directory: './backend'
```

### Multi-Stage Deployment

```yaml
name: Deploy Schema to Multiple Stages

on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Schema version tag'
        required: true

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Staging
        uses: ChilliCream/nitro-fusion-publish-action@v1
        with:
          tag: ${{ github.event.inputs.tag }}
          stage: 'staging'
          api-id: 'my-api'
          api-key: ${{ secrets.NITRO_API_KEY }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        uses: ChilliCream/nitro-fusion-publish-action@v1
        with:
          tag: ${{ github.event.inputs.tag }}
          stage: 'production'
          api-id: 'my-api'
          api-key: ${{ secrets.NITRO_API_KEY }}
```

### Using Outputs

```yaml
- name: Publish Schema
  id: publish
  uses: ChilliCream/nitro-fusion-publish-action@v1
  with:
    tag: 'v1.0.0'
    stage: 'production'
    api-id: 'my-api'
    api-key: ${{ secrets.NITRO_API_KEY }}

- name: Check Result
  run: |
    echo "Success: ${{ steps.publish.outputs.success }}"
    echo "Schema ID: ${{ steps.publish.outputs.schema-id }}"
```

## Supported Platforms

- ✅ Linux (x64, ARM64)
- ✅ macOS (x64, Apple Silicon)  
- ✅ Windows (x64)

## Security

⚠️ **Never hardcode your API key!** Always use GitHub secrets:

```yaml
# ✅ Good
api-key: ${{ secrets.NITRO_API_KEY }}

# ❌ Never do this
api-key: 'my-secret-key'
```

## License

MIT - see [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [ChilliCream](https://chillicream.com)
