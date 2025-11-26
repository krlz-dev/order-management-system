import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({ 
    routeTree,
    context: {
      queryClient,
    }
  })
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}