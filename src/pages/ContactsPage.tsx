import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Contacts } from '@capacitor-community/contacts';
import { Checkbox } from '@/components/ui/checkbox';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type DeviceContact = {
  displayName: string;
  phoneNumbers: string[];
  selected?: boolean;
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<DeviceContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsMessage, setSmsMessage] = useState('I need help! This is an emergency.');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const { toast } = useToast();
  const { contacts: emergencyContacts, addContact, isLoading: isLoadingEmergencyContacts } = useEmergencyContacts();
  const { user } = useAuth();

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const permission = await Contacts.requestPermissions();

      if ((permission as any)?.contacts === 'granted') {
        const result = await Contacts.getContacts({
          projection: { name: true, phones: true },
        });

        const formattedContacts: DeviceContact[] = result.contacts
          .map(contact => ({
            displayName: contact.name?.display || 'Unnamed',
            phoneNumbers: contact.phones?.map(p => {
              let phoneNumber = p.number || '';
              phoneNumber = phoneNumber.replace(/\s+|-|\(|\)|\.|\+/g, '');
              
              if (/^\d{10}$/.test(phoneNumber)) {
                return '+91' + phoneNumber;
              }
              
              if (phoneNumber.startsWith('91') || phoneNumber.startsWith('0091')) {
                return '+91' + phoneNumber.replace(/^(91|0091)/, '');
              }
              
              return phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
            }) || [],
            selected: false,
          }))
          .map(contact => ({
            ...contact,
            phoneNumbers: [...new Set(contact.phoneNumbers)],
          }))
          .filter(contact => contact.displayName && contact.phoneNumbers.length > 0);

        const uniqueContactsMap = new Map();
        for (const c of formattedContacts) {
          const key = `${c.displayName}-${c.phoneNumbers.join(',')}`;
          if (!uniqueContactsMap.has(key)) {
            uniqueContactsMap.set(key, c);
          }
        }

        const sorted = Array.from(uniqueContactsMap.values()).sort((a, b) =>
          a.displayName.localeCompare(b.displayName),
        );

        setContacts(sorted);
        setFilteredContacts(sorted);

        toast({
          title: 'Contacts Synced',
          description: `Loaded ${sorted.length} contacts.`,
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Contacts permission not granted.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync contacts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const toggleContactSelection = (index: number) => {
    const newFilteredContacts = [...filteredContacts];
    newFilteredContacts[index].selected = !newFilteredContacts[index].selected;
    setFilteredContacts(newFilteredContacts);

    const contactToUpdate = newFilteredContacts[index];
    const mainContactIndex = contacts.findIndex(
      c => c.displayName === contactToUpdate.displayName && 
           c.phoneNumbers.join(',') === contactToUpdate.phoneNumbers.join(',')
    );
    
    if (mainContactIndex !== -1) {
      const newContacts = [...contacts];
      newContacts[mainContactIndex].selected = contactToUpdate.selected;
      setContacts(newContacts);
    }
  };

  const addSelectedContactsToEmergency = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add emergency contacts.',
        variant: 'destructive',
      });
      return;
    }

    const selectedContacts = contacts.filter(contact => contact.selected);
    
    if (selectedContacts.length === 0) {
      toast({
        title: 'No Contacts Selected',
        description: 'Please select at least one contact to add.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const results = [];

    let maxPriority = 0;
    if (emergencyContacts.length > 0) {
      maxPriority = Math.max(...emergencyContacts.map(c => c.priority));
    }

    for (const [index, contact] of selectedContacts.entries()) {
      try {
        let phoneNumber = contact.phoneNumbers[0];
        
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+91' + phoneNumber;
        } else if (!phoneNumber.startsWith('+91')) {
          phoneNumber = '+91' + phoneNumber.substring(1);
        }
        
        const exists = emergencyContacts.some(
          c => c.phone_number === phoneNumber && c.name === contact.displayName
        );
        
        if (!exists) {
          const result = await addContact({
            name: contact.displayName,
            phone_number: phoneNumber,
            relationship: '',
            priority: maxPriority + index + 1,
          });
          
          results.push({
            name: contact.displayName,
            success: result.success,
          });
        } else {
          results.push({
            name: contact.displayName,
            success: false,
            error: 'Contact already exists in emergency contacts',
          });
        }
      } catch (err) {
        console.error('Error adding contact:', err);
        results.push({
          name: contact.displayName,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const newContacts = contacts.map(c => ({ ...c, selected: false }));
    setContacts(newContacts);
    setFilteredContacts(newContacts.filter(contact =>
      contact.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
    ));

    setLoading(false);

    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      toast({
        title: 'Contacts Added',
        description: `Added ${successCount} contact(s) to your emergency contacts.`,
      });
    } else {
      toast({
        title: 'No Contacts Added',
        description: 'Failed to add contacts or they already exist.',
        variant: 'destructive',
      });
    }
  };

  const sendSmsToEmergencyContacts = async () => {
    if (emergencyContacts.length === 0) {
      toast({
        title: 'No Emergency Contacts',
        description: 'Please add emergency contacts before sending SMS.',
        variant: 'destructive',
      });
      return;
    }

    if (!smsMessage.trim()) {
      toast({
        title: 'Empty Message',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingSms(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-emergency-sms', {
        body: {
          message: smsMessage,
          userId: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: 'SMS Sent',
        description: `Message sent to ${data.sentCount} emergency contacts.`,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Failed to Send SMS',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Device Contacts</h1>
          <p className="text-muted-foreground">Sync and add contacts to your emergency list</p>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <Button onClick={fetchContacts} disabled={loading} className="w-full mb-2">
            {loading ? 'Syncing Contacts...' : 'Sync Contacts'}
          </Button>
          
          <Button 
            onClick={addSelectedContactsToEmergency} 
            disabled={loading || isLoadingEmergencyContacts || !contacts.some(c => c.selected)}
            className="w-full"
          >
            Add Selected to Emergency Contacts
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Send Emergency SMS</h2>
          <div className="flex flex-col space-y-2">
            <Input
              type="text"
              placeholder="Enter emergency message..."
              value={smsMessage}
              onChange={e => setSmsMessage(e.target.value)}
              className="mb-2"
            />
            <Button 
              onClick={sendSmsToEmergencyContacts} 
              disabled={isSendingSms || emergencyContacts.length === 0} 
              className="w-full"
              variant="destructive"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Emergency SMS
            </Button>
          </div>
        </div>

        {loading && (
          <div className="mb-4">
            <Progress value={50} className="h-2" />
          </div>
        )}

        <div className="space-y-4">
          {filteredContacts.length === 0 && !loading ? (
            <p>No contacts found.</p>
          ) : (
            filteredContacts.map((contact, index) => (
              <div key={index} className="p-3 rounded-lg border flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{contact.displayName}</h3>
                  {contact.phoneNumbers.map((number, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {number}
                    </p>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`contact-${index}`}
                    checked={contact.selected}
                    onCheckedChange={() => toggleContactSelection(index)}
                  />
                  {emergencyContacts.some(ec => 
                    ec.name === contact.displayName && 
                    contact.phoneNumbers.includes(ec.phone_number)
                  ) && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContactsPage;
