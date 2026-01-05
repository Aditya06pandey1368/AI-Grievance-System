import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import { useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-bg p-10 gap-8">
      
      <Card className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Grievance AI
        </h1>
        <p className="text-slate-500">
          The Future of Governance. Powered by Artificial Intelligence.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            isLoading={loading} 
            onClick={() => setLoading(!loading)}
          >
            {loading ? "Processing..." : "Get Started"}
          </Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </Card>

    </div>
  );
}

export default App;