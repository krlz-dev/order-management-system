import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { Package, Eye, EyeOff } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { isLoading, error, setLoading, setError, setAuth, clearError } = useAppStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()

    try {
      const response = await apiService.login(email, password)
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, expiresIn, user } = response.data
        // Transform the user data to match expected format
        const userWithRoles = {
          ...user,
          roles: [user.role] // Convert single role to array
        }
        setAuth(accessToken, refreshToken, expiresIn, userWithRoles)
      } else {
        setError(response.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-b from-[#2C4A4E] to-[#1E3438] rounded-xl mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OrderFlow</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <Card className="shadow-2xl border border-gray-200/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#2C4A4E] to-[#1E3438] hover:from-[#1E3438] hover:to-[#2C4A4E] text-white"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Demo credentials: <br />
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                  admin@orderflow.com / admin123
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          © 2024 OrderFlow. All rights reserved.
        </div>
      </div>
    </div>
  )
}