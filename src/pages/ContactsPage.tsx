import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Contacts } from '@capacitor-community/contacts';

type DeviceContact = {
  displayName: string;
  phoneNumbers: string[];
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<DeviceContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
            phoneNumbers: contact.phones?.map(p => p.number) || [],
          }))
          .map(contact => ({
            ...contact,
            phoneNumbers: [...new Set(contact.phoneNumbers)], // remove duplicate numbers
          }))
          .filter(contact => contact.displayName && contact.phoneNumbers.length > 0);

        // Remove duplicate contacts by name + number
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

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Device Contacts</h1>
          <p className="text-muted-foreground">Sync and view contacts from your device</p>
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
          <Button onClick={fetchContacts} disabled={loading} className="w-full">
            {loading ? 'Syncing Contacts...' : 'Sync Contacts'}
          </Button>
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
              <div key={index} className="p-3 rounded-lg border">
                <h3 className="font-medium">{contact.displayName}</h3>
                {contact.phoneNumbers.map((number, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {number}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContactsPage;
