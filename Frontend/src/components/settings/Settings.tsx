// Add session ID to your component
const Settings = () => {
  const { user, sessionId } = useAuth();
  
  // In your security settings section:
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-yellow-500 font-bold mb-6">Settings</h1>
      
      {/* Other sections */}
      
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="h-5 w-5 mr-2 text-yellow-500" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Session Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Session ID</span>
                <div className="font-mono text-xs text-yellow-400 break-all bg-gray-900 p-2 rounded">
                  {sessionId}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-gray-400">IP Address</span>
                <div className="font-mono text-xs text-white">127.0.0.1</div>
                <span className="text-xs text-gray-400">Last Activity</span>
                <div className="font-mono text-xs text-white">{new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          {/* Other security settings */}
        </CardContent>
      </Card>
      
      {/* Rest of settings */}
    </div>
  );
};