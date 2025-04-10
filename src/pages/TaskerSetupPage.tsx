
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCopy, AlertTriangle, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskerSetupPage = () => {
  const navigate = useNavigate();
  const appUrl = "https://your-app-domain.com/sos?autoTrigger=true";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(appUrl);
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto py-6">
        <h1 className="text-2xl font-bold mb-2">Tasker Integration Setup</h1>
        <p className="text-muted-foreground mb-6">
          Learn how to automate emergency alerts using Tasker
        </p>
        
        <Tabs defaultValue="basic">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="basic" className="flex-1">Basic Setup</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">Advanced Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Tasker Setup</CardTitle>
                <CardDescription>
                  Create a simple task to trigger SOS alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal pl-5 space-y-3">
                  <li>Install Tasker from the Google Play Store</li>
                  <li>Create a new Task in Tasker (tap the + button)</li>
                  <li>Add a new Action (bottom right + button)</li>
                  <li>Select "App" → "Browse URL"</li>
                  <li>
                    Enter the following URL:
                    <div className="flex items-center mt-2 p-2 bg-muted rounded">
                      <code className="text-sm flex-1">{appUrl}</code>
                      <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                        <ClipboardCopy size={16} />
                      </Button>
                    </div>
                  </li>
                  <li>Go back to Tasker main screen</li>
                  <li>
                    Create a Profile that will trigger your task:
                    <ul className="list-disc pl-5 mt-2">
                      <li>Shake gesture</li>
                      <li>Button press (e.g., volume buttons)</li>
                      <li>Motion detection</li>
                      <li>Time of day</li>
                    </ul>
                  </li>
                </ol>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 rounded-md">
                  <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    The phone must be unlocked for Tasker to launch the SOS page.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>
                  Create more sophisticated automated responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Custom Tasker Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  You can create advanced automations such as:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Detect when you're not responding to regular check-ins</li>
                  <li>Trigger SOS alerts when entering specific locations</li>
                  <li>Use voice commands to trigger emergency alerts</li>
                  <li>Create custom gesture patterns that trigger SOS</li>
                </ul>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Example: Triple-press Power Button</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>In Tasker, create a new Profile</li>
                    <li>Select Event → Button → Power Button</li>
                    <li>Create a task that counts button presses within a short time window</li>
                    <li>If 3 presses detected, launch the SOS URL</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://tasker.joaoapps.com/userguide/en/index.html', '_blank')}
                  className="w-full"
                >
                  <Code className="mr-2 h-4 w-4" />
                  View Tasker Documentation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button 
            onClick={() => navigate('/emergency-contacts')} 
            className="w-full"
          >
            Back to Emergency Contacts
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default TaskerSetupPage;
