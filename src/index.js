const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Determines the platform and architecture for Nitro download
 */
function getPlatformInfo() {
  const platform = os.platform();
  const arch = os.arch();
  
  let osType, archType;
  
  // Determine OS
  switch (platform) {
    case 'darwin':
      osType = 'osx';
      break;
    case 'linux':
      osType = 'linux';
      break;
    case 'win32':
      osType = 'win';
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
  // Determine architecture
  switch (arch) {
    case 'x64':
    case 'x86_64':
      archType = 'x64';
      break;
    case 'arm64':
    case 'aarch64':
      archType = 'arm64';
      break;
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }
  
  return { osType, archType };
}

/**
 * Downloads and installs Nitro CLI
 */
async function installNitro(version = 'latest') {
  try {
    core.info('🔍 Installing Nitro CLI...');
    
    const { osType, archType } = getPlatformInfo();
    const binaryName = osType === 'win' ? 'nitro.exe' : 'nitro';
    
    // Check if already cached
    const toolName = 'nitro';
    let toolPath = tc.find(toolName, version);
    
    if (!toolPath) {
      core.info(`📦 Downloading Nitro for ${osType}-${archType}`);
      
      // Determine latest version if needed
      let resolvedVersion = version;
      if (version === 'latest') {
        const latestUrl = 'https://api.github.com/repos/ChilliCream/graphql-platform/releases/latest';
        const response = await exec.getExecOutput('curl', ['-s', latestUrl]);
        const release = JSON.parse(response.stdout);
        resolvedVersion = release.tag_name;
      }
      
      // Download URL
      const downloadUrl = `https://github.com/ChilliCream/graphql-platform/releases/download/${resolvedVersion}/nitro-${osType}-${archType}.zip`;
      
      core.info(`⬇️ Downloading from: ${downloadUrl}`);
      const downloadPath = await tc.downloadTool(downloadUrl);
      
      // Extract
      const extractPath = await tc.extractZip(downloadPath);
      
      // Cache the tool
      toolPath = await tc.cacheDir(extractPath, toolName, resolvedVersion);
    }
    
    // Add to PATH
    core.addPath(toolPath);
    
    // Make executable (Unix systems)
    if (osType !== 'win') {
      const binaryPath = path.join(toolPath, binaryName);
      await exec.exec('chmod', ['+x', binaryPath]);
    }
    
    core.info('✅ Nitro CLI installed successfully');
    
    // Verify installation
    await exec.exec('nitro', ['--version']);
    
    return toolPath;
    
  } catch (error) {
    core.setFailed(`Failed to install Nitro: ${error.message}`);
    throw error;
  }
}

/**
 * Runs nitro fusion publish command
 */
async function runNitroFusionPublish() {
  try {
    const tag = core.getInput('tag', { required: true });
    const stage = core.getInput('stage', { required: true });
    const apiId = core.getInput('api-id', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    
    // Optional inputs
    const cloudUrl = core.getInput('cloud-url') || 'api.chillicream.com';
    const workingDirectory = core.getInput('working-directory') || '.';
    const singleSchemaFile = core.getInput('source-schema-file');
    const multipleSchemaFiles = core.getInput('source-schema-files');
    
    // Change to working directory
    if (workingDirectory !== '.') {
      core.info(`📁 Changing to working directory: ${workingDirectory}`);
      process.chdir(workingDirectory);
    }
    
    // Build command arguments
    const args = [
      'fusion',
      'publish',
      '--tag', tag,
      '--stage', stage,
      '--api-id', apiId,
      '--cloud-url', cloudUrl
    ];
    
    // Handle schema files - prioritize multiple files if provided
    if (multipleSchemaFiles) {
      const files = multipleSchemaFiles.split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      
      core.info(`📋 Adding ${files.length} schema files`);
      files.forEach(file => {
        args.push('--source-schema-file', file);
      });
    } else if (singleSchemaFile) {
      core.info(`📋 Adding single schema file: ${singleSchemaFile}`);
      args.push('--source-schema-file', singleSchemaFile);
    }
    
    core.info('🚀 Publishing GraphQL schema...');
    core.info(`📋 Command: nitro ${args.join(' ')}`);
    
    // Set API key as environment variable for security
    const env = {
      ...process.env,
      NITRO_API_KEY: apiKey
    };
    
    // Execute the command
    let output = '';    
    const options = { env };
    
    const exitCode = await exec.exec('nitro', args, options);
    
    if (exitCode === 0) {
      core.info('✅ Schema published successfully!');
      core.setOutput('success', 'true');
      
      // Try to extract schema ID from output if present
      const schemaIdMatch = output.match(/Schema ID: ([a-zA-Z0-9-]+)/);
      if (schemaIdMatch) {
        core.setOutput('schema-id', schemaIdMatch[1]);
      }
    } else {
      throw new Error(`Nitro fusion publish failed with exit code ${exitCode}`);
    }
    
  } catch (error) {
    core.setFailed(`❌ Failed to publish schema: ${error.message}`);
    core.setOutput('success', 'false');
    throw error;
  }
}

/**
 * Main action entry point
 */
async function run() {
  try {
    core.info('🎯 Starting Nitro Fusion Publish Action');
    
    // Install Nitro
    const nitroVersion = core.getInput('nitro-version') || 'latest';
    await installNitro(nitroVersion);
    
    // Run the publish command
    await runNitroFusionPublish();
    
    core.info('🎉 Action completed successfully!');
    
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

// Run the action
if (require.main === module) {
  run();
}

module.exports = { run, installNitro, runNitroFusionPublish };