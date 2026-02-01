import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Configuración de Vitest para MedRound
 * 
 * Esta configuración soporta:
 * - Tests unitarios con mocks (servicios, BD, email)
 * - Tests de integración con SQLite en archivo
 * - Setup global que inicializa la BD de test una sola vez
 * - Cleanup automático entre tests
 * 
 * Variables de entorno:
 * - NODE_ENV=test (carga .env.test automáticamente)
 * - DATABASE_URL=file:./medround_test.db (SQLite)
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    
    /**
     * Setup files - se ejecutan antes de cada archivo de test
     * setup.ts: Limpia la base de datos entre tests
     */
    setupFiles: ["./tests/setup.ts"],
    
    /**
     * Global setup - se ejecuta UNA VEZ antes de todos los tests
     * global-setup.ts: Crea/resetea la BD de test y aplica migraciones
     */
    globalSetup: "./tests/global-setup.ts",
    
    /**
     * Timeout extendido para tests que usan Better Auth
     * (creación de usuarios, hashing de passwords, etc.)
     */
    testTimeout: 15000,
    
    /**
     * Configuración de hooks
     */
    pool: "forks",  // Aislamiento entre tests
    
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mocks/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/app": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/services": path.resolve(__dirname, "./services"),
    },
  },
  
  /**
   * Optimizaciones para tests
   */
  optimizeDeps: {
    include: ["@prisma/client"],
  },
});
