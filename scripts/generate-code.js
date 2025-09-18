#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { AICodeGenerator } = require('../src/lib/ai-code-generator')

// CLI interface for code generation
class CodeGenerationCLI {
  constructor() {
    this.commands = {
      'component': this.generateComponent.bind(this),
      'hook': this.generateHook.bind(this),
      'api': this.generateAPI.bind(this),
      'model': this.generateModel.bind(this)
    }
  }

  async run() {
    const [,, command, ...args] = process.argv

    if (!command || !this.commands[command]) {
      this.showHelp()
      return
    }

    try {
      await this.commands[command](args)
    } catch (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    }
  }

  async generateComponent(args) {
    const [name, description] = args
    if (!name) {
      console.error('❌ Component name is required')
      return
    }

    console.log(`🚀 Generating component: ${name}`)
    
    const requirements = {
      name: name,
      description: description || `A ${name} component for the AI Finance Tracker`,
      props: [
        { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
        { name: 'children', type: 'React.ReactNode', required: false, description: 'Child elements' }
      ],
      features: ['responsive', 'accessible'],
      styling: 'tailwind',
      accessibility: true,
      responsive: true
    }

    const generated = await AICodeGenerator.generateComponent(requirements)
    
    // Save component files
    const componentDir = path.join(__dirname, '..', 'src', 'components', name.toLowerCase())
    fs.mkdirSync(componentDir, { recursive: true })

    // Save component file
    fs.writeFileSync(
      path.join(componentDir, `${name}.tsx`),
      generated.component
    )

    // Save types file
    fs.writeFileSync(
      path.join(componentDir, 'types.ts'),
      generated.types
    )

    // Save tests file
    fs.writeFileSync(
      path.join(componentDir, `${name}.test.tsx`),
      generated.tests
    )

    // Save storybook file
    fs.writeFileSync(
      path.join(componentDir, `${name}.stories.tsx`),
      generated.storybook
    )

    // Save documentation
    fs.writeFileSync(
      path.join(componentDir, 'README.md'),
      generated.documentation
    )

    console.log(`✅ Component ${name} generated successfully!`)
    console.log(`📁 Files created in: ${componentDir}`)
  }

  async generateHook(args) {
    const [name, description] = args
    if (!name) {
      console.error('❌ Hook name is required')
      return
    }

    console.log(`🚀 Generating hook: ${name}`)
    
    const requirements = {
      name: name,
      description: description || `A ${name} hook for the AI Finance Tracker`,
      parameters: [
        { name: 'initialValue', type: 'T', description: 'Initial value for the hook' }
      ],
      returnType: '[T, (value: T) => void]',
      dependencies: ['react']
    }

    const generated = await AICodeGenerator.generateHook(requirements)
    
    // Save hook files
    const hooksDir = path.join(__dirname, '..', 'src', 'hooks')
    fs.mkdirSync(hooksDir, { recursive: true })

    // Save hook file
    fs.writeFileSync(
      path.join(hooksDir, `use${name}.ts`),
      generated.hook
    )

    // Save types file
    fs.writeFileSync(
      path.join(hooksDir, `use${name}.types.ts`),
      generated.types
    )

    // Save tests file
    fs.writeFileSync(
      path.join(hooksDir, `use${name}.test.ts`),
      generated.tests
    )

    console.log(`✅ Hook use${name} generated successfully!`)
    console.log(`📁 Files created in: ${hooksDir}`)
  }

  async generateAPI(args) {
    const [method, path, description] = args
    if (!method || !path) {
      console.error('❌ Method and path are required')
      return
    }

    console.log(`🚀 Generating API endpoint: ${method} ${path}`)
    
    const requirements = {
      method: method.toUpperCase(),
      path: path,
      description: description || `API endpoint for ${path}`,
      parameters: [
        { name: 'id', type: 'string', required: true }
      ],
      responseType: 'ApiResponse<T>',
      authentication: true
    }

    const generated = await AICodeGenerator.generateAPIEndpoint(requirements)
    
    // Save API files
    const apiDir = path.join(__dirname, '..', 'src', 'app', 'api', path.replace('/', ''))
    fs.mkdirSync(apiDir, { recursive: true })

    // Save endpoint file
    fs.writeFileSync(
      path.join(apiDir, 'route.ts'),
      generated.endpoint
    )

    // Save types file
    fs.writeFileSync(
      path.join(apiDir, 'types.ts'),
      generated.types
    )

    // Save tests file
    fs.writeFileSync(
      path.join(apiDir, 'route.test.ts'),
      generated.tests
    )

    console.log(`✅ API endpoint ${method} ${path} generated successfully!`)
    console.log(`📁 Files created in: ${apiDir}`)
  }

  async generateModel(args) {
    const [name, description] = args
    if (!name) {
      console.error('❌ Model name is required')
      return
    }

    console.log(`🚀 Generating database model: ${name}`)
    
    const requirements = {
      name: name,
      description: description || `A ${name} model for the AI Finance Tracker database`,
      fields: [
        { name: 'id', type: 'String', required: true, unique: true },
        { name: 'createdAt', type: 'DateTime', required: true },
        { name: 'updatedAt', type: 'DateTime', required: true }
      ],
      indexes: ['id']
    }

    const generated = await AICodeGenerator.generateDatabaseModel(requirements)
    
    // Save model files
    const modelsDir = path.join(__dirname, '..', 'prisma', 'models')
    fs.mkdirSync(modelsDir, { recursive: true })

    // Save model file
    fs.writeFileSync(
      path.join(modelsDir, `${name.toLowerCase()}.prisma`),
      generated.model
    )

    // Save migration file
    fs.writeFileSync(
      path.join(modelsDir, `${name.toLowerCase()}-migration.sql`),
      generated.migration
    )

    console.log(`✅ Model ${name} generated successfully!`)
    console.log(`📁 Files created in: ${modelsDir}`)
  }

  showHelp() {
    console.log(`
🤖 AI Code Generator CLI

Usage: node scripts/generate-code.js <command> [options]

Commands:
  component <name> [description]  Generate a React component
  hook <name> [description]       Generate a custom React hook
  api <method> <path> [desc]      Generate an API endpoint
  model <name> [description]      Generate a database model

Examples:
  node scripts/generate-code.js component "BudgetCard" "A card component for displaying budget information"
  node scripts/generate-code.js hook "useTransactions" "A hook for managing transaction data"
  node scripts/generate-code.js api POST "/transactions" "Create a new transaction"
  node scripts/generate-code.js model "Investment" "A model for investment tracking"

Make sure to set OPENAI_API_KEY in your environment variables.
    `)
  }
}

// Run the CLI
const cli = new CodeGenerationCLI()
cli.run().catch(console.error)
