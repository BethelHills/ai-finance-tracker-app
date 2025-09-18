#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  SchemaAwareGenerator,
  OpenAPIGenerator,
  APIClientGenerator,
} = require('../src/lib/schema-aware-generator');

// CLI interface for schema-aware code generation
class SchemaAwareCLI {
  constructor() {
    this.commands = {
      analyze: this.analyzeSchema.bind(this),
      'generate-types': this.generateTypes.bind(this),
      'generate-service': this.generateService.bind(this),
      'generate-api-spec': this.generateApiSpec.bind(this),
      'generate-api-client': this.generateApiClient.bind(this),
      'generate-all': this.generateAll.bind(this),
    };
  }

  async run() {
    const [, , command, ...args] = process.argv;

    if (!command || !this.commands[command]) {
      this.showHelp();
      return;
    }

    try {
      await this.commands[command](args);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  async analyzeSchema(args) {
    console.log('🔍 Analyzing Prisma schema...');

    const schemaAnalysis = await SchemaAwareGenerator.analyzeSchema();

    // Save schema analysis
    const analysisPath = path.join(
      __dirname,
      '..',
      'generated',
      'schema-analysis.json'
    );
    fs.mkdirSync(path.dirname(analysisPath), { recursive: true });
    fs.writeFileSync(analysisPath, JSON.stringify(schemaAnalysis, null, 2));

    console.log('✅ Schema analysis complete!');
    console.log(`📁 Analysis saved to: ${analysisPath}`);
    console.log(
      `📊 Found ${schemaAnalysis.models.length} models and ${schemaAnalysis.enums.length} enums`
    );
  }

  async generateTypes(args) {
    console.log('📝 Generating TypeScript types...');

    const schemaAnalysis = await this.loadSchemaAnalysis();
    const types =
      await SchemaAwareGenerator.generateTypeScriptTypes(schemaAnalysis);

    // Save types
    const typesPath = path.join(__dirname, '..', 'generated', 'types.ts');
    fs.mkdirSync(path.dirname(typesPath), { recursive: true });
    fs.writeFileSync(typesPath, types);

    console.log('✅ TypeScript types generated!');
    console.log(`📁 Types saved to: ${typesPath}`);
  }

  async generateService(args) {
    const [modelName] = args;
    if (!modelName) {
      console.error('❌ Model name is required');
      return;
    }

    console.log(`🏗️  Generating CRUD service for ${modelName}...`);

    const schemaAnalysis = await this.loadSchemaAnalysis();
    const service = await SchemaAwareGenerator.generateCRUDService(
      modelName,
      schemaAnalysis
    );

    // Save service files
    const serviceDir = path.join(
      __dirname,
      '..',
      'generated',
      'services',
      modelName.toLowerCase()
    );
    fs.mkdirSync(serviceDir, { recursive: true });

    fs.writeFileSync(
      path.join(serviceDir, `${modelName.toLowerCase()}-service.ts`),
      service.service
    );
    fs.writeFileSync(path.join(serviceDir, 'types.ts'), service.types);
    fs.writeFileSync(
      path.join(serviceDir, `${modelName.toLowerCase()}-service.test.ts`),
      service.tests
    );
    fs.writeFileSync(path.join(serviceDir, 'api-routes.ts'), service.apiRoutes);

    console.log(`✅ ${modelName} service generated!`);
    console.log(`📁 Files saved to: ${serviceDir}`);
  }

  async generateApiSpec(args) {
    console.log('📋 Generating OpenAPI specification...');

    const schemaAnalysis = await this.loadSchemaAnalysis();
    const openApiSpec =
      await OpenAPIGenerator.generateOpenAPISpec(schemaAnalysis);

    // Save OpenAPI spec
    const specPath = path.join(__dirname, '..', 'generated', 'openapi.json');
    fs.mkdirSync(path.dirname(specPath), { recursive: true });
    fs.writeFileSync(specPath, JSON.stringify(openApiSpec, null, 2));

    console.log('✅ OpenAPI specification generated!');
    console.log(`📁 Spec saved to: ${specPath}`);
  }

  async generateApiClient(args) {
    console.log('🔌 Generating API client...');

    const openApiSpec = await this.loadOpenApiSpec();
    const config = {
      baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
      apiKey: process.env.API_KEY,
      timeout: 10000,
      retries: 3,
      cache: true,
    };

    const apiClient = await APIClientGenerator.generateFromOpenAPI(
      openApiSpec,
      config
    );

    // Save API client files
    const clientDir = path.join(__dirname, '..', 'generated', 'api-client');
    fs.mkdirSync(clientDir, { recursive: true });

    fs.writeFileSync(path.join(clientDir, 'api-client.ts'), apiClient.client);
    fs.writeFileSync(path.join(clientDir, 'types.ts'), apiClient.types);
    fs.writeFileSync(path.join(clientDir, 'hooks.ts'), apiClient.hooks);
    fs.writeFileSync(
      path.join(clientDir, 'api-client.test.ts'),
      apiClient.tests
    );
    fs.writeFileSync(
      path.join(clientDir, 'README.md'),
      apiClient.documentation
    );

    console.log('✅ API client generated!');
    console.log(`📁 Files saved to: ${clientDir}`);
  }

  async generateAll(args) {
    console.log('🚀 Generating all code from schema...');

    try {
      // Analyze schema
      await this.analyzeSchema([]);

      // Generate types
      await this.generateTypes([]);

      // Generate services for all models
      const schemaAnalysis = await this.loadSchemaAnalysis();
      for (const model of schemaAnalysis.models) {
        await this.generateService([model.name]);
      }

      // Generate API spec
      await this.generateApiSpec([]);

      // Generate API client
      await this.generateApiClient([]);

      console.log('🎉 All code generated successfully!');
      console.log('📁 Check the generated/ directory for all files');
    } catch (error) {
      console.error('❌ Error during generation:', error.message);
      throw error;
    }
  }

  async loadSchemaAnalysis() {
    const analysisPath = path.join(
      __dirname,
      '..',
      'generated',
      'schema-analysis.json'
    );

    if (!fs.existsSync(analysisPath)) {
      console.log('📊 Schema analysis not found, analyzing schema first...');
      await this.analyzeSchema([]);
    }

    return JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  }

  async loadOpenApiSpec() {
    const specPath = path.join(__dirname, '..', 'generated', 'openapi.json');

    if (!fs.existsSync(specPath)) {
      console.log('📋 OpenAPI spec not found, generating spec first...');
      await this.generateApiSpec([]);
    }

    return JSON.parse(fs.readFileSync(specPath, 'utf8'));
  }

  showHelp() {
    console.log(`
🗄️  Schema-Aware Code Generation CLI

Usage: node scripts/generate-from-schema.js <command> [options]

Commands:
  analyze                    Analyze Prisma schema and extract structure
  generate-types            Generate TypeScript types from schema
  generate-service <model>  Generate CRUD service for specific model
  generate-api-spec         Generate OpenAPI specification
  generate-api-client       Generate API client from OpenAPI spec
  generate-all              Generate all code from schema

Examples:
  node scripts/generate-from-schema.js analyze
  node scripts/generate-from-schema.js generate-types
  node scripts/generate-from-schema.js generate-service Transaction
  node scripts/generate-from-schema.js generate-api-spec
  node scripts/generate-from-schema.js generate-api-client
  node scripts/generate-from-schema.js generate-all

Environment Variables:
  API_BASE_URL              Base URL for API client (default: http://localhost:3000)
  API_KEY                   API key for authentication
  OPENAI_API_KEY            OpenAI API key for AI generation

Make sure to set OPENAI_API_KEY in your environment variables.
    `);
  }
}

// Run the CLI
const cli = new SchemaAwareCLI();
cli.run().catch(console.error);
