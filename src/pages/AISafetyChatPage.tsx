import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AISafetyChatPage = () => {
  useEffect(() => {
    // Inject Chatling script
    const script = document.createElement('script');
    script.src = 'https://chatling.ai/js/embed.js';
    script.async = true;
    script.setAttribute('data-id', '3843596487');
    script.id = 'chatling-embed-script';
    document.body.appendChild(script);

    // Set config before script loads
    (window as any).chtlConfig = {
      chatbotId: '3843596487',
    };

    return () => {
      // Cleanup
      const oldScript = document.getElementById('chatling-embed-script');
      if (oldScript) document.body.removeChild(oldScript);
    };
  }, []);

  const suggestions = [
    "Safety tips for traveling alone",
    "What to do if I'm being followed",
    "How to use the SOS feature",
    "Is this area safe?",
  ];

  const sendSuggestion = (text: string) => {
    // Wait a bit to make sure Chatling has loaded
    if ((window as any).Chatling?.sendMessage) {
      (window as any).Chatling.sendMessage(text);
    } else {
      console.warn("Chatling not ready yet.");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-16rem)]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            AI Safety Assistant
          </h1>
          <p className="text-muted-foreground">
            Ask anything related to safety and emergencies.
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Suggested Questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => sendSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <p className="text-muted-foreground text-sm">
            The AI assistant will appear shortly...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AISafetyChatPage;
