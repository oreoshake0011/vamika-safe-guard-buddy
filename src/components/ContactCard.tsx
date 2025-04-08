
import React from 'react';
import { Phone, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  priority: number;
};

interface ContactCardProps {
  contact: Contact;
  onCall?: (contact: Contact) => void;
  onEmail?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onCall,
  onEmail,
  onDelete,
  className,
}) => {
  return (
    <div className={cn("card-safety", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{contact.name}</h3>
          <p className="text-sm text-muted-foreground mb-1">{contact.relationship}</p>
          <div className="flex items-center gap-2 text-sm">
            <span>{contact.phone}</span>
            {contact.email && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="truncate max-w-[200px]">{contact.email}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onCall && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onCall(contact)}
              className="text-primary hover:text-primary-foreground hover:bg-primary"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          
          {onEmail && contact.email && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onEmail(contact)}
              className="text-primary hover:text-primary-foreground hover:bg-primary"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onDelete(contact.id)}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
