import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'

function App() {
  const { 
    pingResponse, 
    isLoading, 
    error, 
    setPingResponse, 
    setLoading, 
    setError 
  } = useAppStore()

  const handlePing = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiService.ping()
      
      if (response.success && response.data) {
        setPingResponse(response.data.message)
      } else {
        setError(response.error || 'Failed to ping server')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Order Management System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button 
              onClick={handlePing} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Pinging...' : 'Ping Server'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              Error: {error}
            </div>
          )}
          
          {pingResponse && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-md text-sm">
              Server Response: {pingResponse}
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Test the connection to the Spring Boot backend
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App