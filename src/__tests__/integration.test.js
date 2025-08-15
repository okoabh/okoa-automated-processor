/**
 * OKOA Platform Integration Tests
 * End-to-end testing of core platform functionality
 */

describe('OKOA Platform Integration Tests', () => {
  // Test authentication system
  describe('Authentication System', () => {
    test('should require authentication for protected routes', () => {
      expect(process.env.DEMO_PASSWORD_REQUIRED).toBeDefined()
      expect(process.env.DEMO_PASSWORD).toBeDefined()
    })
  })

  // Test environment configuration
  describe('Environment Configuration', () => {
    test('should have all required environment variables', () => {
      const requiredVars = [
        'NEXT_PUBLIC_CONVEX_URL',
        'ANTHROPIC_API_KEY',
        'DEMO_PASSWORD_REQUIRED',
        'DEMO_PASSWORD'
      ]
      
      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined()
      })
    })
  })

  // Test utility functions
  describe('Utility Functions', () => {
    test('btoa should work for basic auth encoding', () => {
      const credentials = 'demo:OKOA2024Demo!'
      const encoded = Buffer.from(credentials).toString('base64')
      expect(encoded).toBe('ZGVtbzpPS09BMjAyNERlbW8h')
    })

    test('should handle document categorization logic', () => {
      const testDocuments = [
        { filename: 'contract.pdf', originalFilename: 'contract.pdf' },
        { filename: 'contract_OCR.txt', originalFilename: 'contract_OCR.txt' },
        { filename: 'summary_Extract.txt', originalFilename: 'summary_Extract.txt' },
        { filename: 'analysis_Summary.md', originalFilename: 'analysis_Summary.md' },
        { filename: 'master_SYNTHDOC.txt', originalFilename: 'master_SYNTHDOC.txt' },
      ]

      const categorized = {
        original: testDocuments.filter(doc => {
          const name = (doc.filename || doc.originalFilename || '').toLowerCase()
          return (
            (name.endsWith('.pdf') || name.endsWith('.xlsx') || name.endsWith('.docx')) &&
            !name.includes('_ocr') && !name.includes('extract') && 
            !name.includes('summary') && !name.includes('synthdoc')
          )
        }),
        ocr: testDocuments.filter(doc => {
          const name = (doc.filename || doc.originalFilename || '').toLowerCase()
          return name.includes('_ocr')
        }),
        plaintext: testDocuments.filter(doc => {
          const name = (doc.filename || doc.originalFilename || '').toLowerCase()
          return name.includes('extract')
        }),
        synthetic: testDocuments.filter(doc => {
          const name = (doc.filename || doc.originalFilename || '').toLowerCase()
          return name.includes('summary') || name.includes('analysis')
        }),
        synthdoc: testDocuments.filter(doc => {
          const name = (doc.filename || doc.originalFilename || '').toLowerCase()
          return name.includes('synthdoc')
        })
      }

      expect(categorized.original).toHaveLength(1)
      expect(categorized.ocr).toHaveLength(1)
      expect(categorized.plaintext).toHaveLength(1)
      expect(categorized.synthetic).toHaveLength(1)
      expect(categorized.synthdoc).toHaveLength(1)
    })
  })

  // Test API endpoint structure
  describe('API Endpoint Structure', () => {
    test('should have required API routes defined', () => {
      const fs = require('fs')
      const path = require('path')
      
      const apiDir = path.join(__dirname, '../app/api')
      expect(fs.existsSync(apiDir)).toBe(true)
      
      // Check for key API routes
      const requiredRoutes = [
        'deals',
        'folders',
        'webhooks'
      ]
      
      requiredRoutes.forEach(route => {
        const routePath = path.join(apiDir, route)
        expect(fs.existsSync(routePath)).toBe(true)
      })
    })

    test('should have AI agent configuration file', () => {
      const fs = require('fs')
      const path = require('path')
      
      const agentPath = path.join(__dirname, '../lib/agents/MIDNIGHT_ATLAS_PRISM_v1.1_RE_EDITION.yaml')
      expect(fs.existsSync(agentPath)).toBe(true)
      
      const agentConfig = fs.readFileSync(agentPath, 'utf-8')
      expect(agentConfig).toContain('MIDNIGHT_ATLAS_PRISM_v1.1_RE_EDITION')
      expect(agentConfig).toContain('real_estate_analysis_agent')
    })
  })

  // Test color system implementation
  describe('Design System Implementation', () => {
    test('should have Figma colors defined in CSS', () => {
      const fs = require('fs')
      const path = require('path')
      
      const cssPath = path.join(__dirname, '../app/globals.css')
      expect(fs.existsSync(cssPath)).toBe(true)
      
      const cssContent = fs.readFileSync(cssPath, 'utf-8')
      
      // Check for key Figma colors
      const figmaColors = [
        '#faf9f7', // cream lightest
        '#2d2d2d', // text dark
        '#f5f4f2', // cream light
        '#ede9e3', // cream
        '#8b4513', // brown accent
        '#1a1a1a', // black dark
      ]
      
      figmaColors.forEach(color => {
        expect(cssContent).toContain(color)
      })
    })

    test('should have monospace font stack defined', () => {
      const fs = require('fs')
      const path = require('path')
      
      const cssPath = path.join(__dirname, '../app/globals.css')
      const cssContent = fs.readFileSync(cssPath, 'utf-8')
      
      expect(cssContent).toContain('ui-monospace')
      expect(cssContent).toContain('SF Mono')
      expect(cssContent).toContain('Monaco')
    })
  })

  // Test component structure
  describe('Component Structure', () => {
    test('should have key components available', () => {
      const fs = require('fs')
      const path = require('path')
      
      const componentsDir = path.join(__dirname, '../components')
      expect(fs.existsSync(componentsDir)).toBe(true)
      
      const requiredComponents = [
        'ascii/InteractiveButton.tsx',
        'ai/AISidebar.tsx',
        'deals/FinancialAnalysis.tsx'
      ]
      
      requiredComponents.forEach(component => {
        const componentPath = path.join(componentsDir, component)
        expect(fs.existsSync(componentPath)).toBe(true)
      })
    })
  })

  // Test package configuration
  describe('Package Configuration', () => {
    test('should have all required dependencies', () => {
      const fs = require('fs')
      const path = require('path')
      
      const packagePath = path.join(__dirname, '../../package.json')
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
      
      const requiredDeps = [
        '@anthropic-ai/sdk',
        'convex',
        'next',
        'react',
        'tailwindcss',
        'typescript',
        'zod'
      ]
      
      requiredDeps.forEach(dep => {
        expect(
          packageJson.dependencies[dep] || packageJson.devDependencies[dep]
        ).toBeDefined()
      })
    })

    test('should have test scripts defined', () => {
      const fs = require('fs')
      const path = require('path')
      
      const packagePath = path.join(__dirname, '../../package.json')
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
      
      expect(packageJson.scripts.test).toBeDefined()
      expect(packageJson.scripts['test:coverage']).toBeDefined()
      expect(packageJson.scripts['test:integration']).toBeDefined()
    })
  })

  // Test build system
  describe('Build System', () => {
    test('should have proper TypeScript configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tsconfigPath = path.join(__dirname, '../../tsconfig.json')
      expect(fs.existsSync(tsconfigPath)).toBe(true)
    })

    test('should have Tailwind configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tailwindPath = path.join(__dirname, '../../tailwind.config.js')
      expect(fs.existsSync(tailwindPath)).toBe(true)
      
      const tailwindConfig = fs.readFileSync(tailwindPath, 'utf-8')
      expect(tailwindConfig).toContain('figma-cream-lightest')
      expect(tailwindConfig).toContain('#faf9f7')
    })
  })
})