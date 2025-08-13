import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { BulkAnalyzer } from "@/components/bulk-analyzer";
import { Search, Upload } from "lucide-react";

function Navigation() {
  const [location] = useLocation();

  return (
    <div className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">SeoWatch</h1>
            <p className="text-sm text-gray-600 hidden sm:block">SEO Analysis Tool</p>
          </div>

          <Tabs value={location === '/bulk' ? 'bulk' : 'single'} className="w-auto">
            <TabsList>
              <TabsTrigger value="single" asChild>
                <Link href="/">
                  <Search className="h-4 w-4 mr-2" />
                  Single URL
                </Link>
              </TabsTrigger>
              <TabsTrigger value="bulk" asChild>
                <Link href="/bulk">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Analysis
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bulk" component={BulkAnalyzer} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
