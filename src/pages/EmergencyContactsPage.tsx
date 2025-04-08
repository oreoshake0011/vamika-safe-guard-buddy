
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useEmergencyContacts, EmergencyContact } from '@/hooks/useEmergencyContacts';
import ContactCard from '@/components/ContactCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Phone, UserPlus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone_number: z.string().min(10, { message: "Enter a valid phone number" }),
  email: z.string().email({ message: "Enter a valid email" }).optional().or(z.literal('')),
  relationship: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const EmergencyContactsPage = () => {
  const { contacts, addContact, updateContact, deleteContact, isLoading } = useEmergencyContacts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<EmergencyContact | null>(null);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      email: '',
      relationship: '',
    },
  });

  const editForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      email: '',
      relationship: '',
    },
  });

  const handleAddContact = async (data: ContactFormValues) => {
    try {
      const result = await addContact({
        ...data,
        priority: contacts.length > 0 ? Math.max(...contacts.map(c => c.priority)) + 1 : 1,
      });

      if (result.success) {
        setIsAddDialogOpen(false);
        form.reset();
        toast({
          title: "Contact Added",
          description: `${data.name} has been added to your emergency contacts.`,
        });
      } else {
        toast({
          title: "Error Adding Contact",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async (data: ContactFormValues) => {
    if (!currentContact) return;

    try {
      const result = await updateContact(currentContact.id, data);

      if (result.success) {
        setIsEditDialogOpen(false);
        editForm.reset();
        setCurrentContact(null);
        toast({
          title: "Contact Updated",
          description: `${data.name} has been updated.`,
        });
      } else {
        toast({
          title: "Error Updating Contact",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const result = await deleteContact(id);

      if (result.success) {
        toast({
          title: "Contact Deleted",
          description: "Emergency contact has been removed.",
        });
      } else {
        toast({
          title: "Error Deleting Contact",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleImportFromDevice = () => {
    // Navigate to the contacts page
    window.location.href = '/contacts';
  };

  const handleCallContact = (contact: any) => {
    window.location.href = `tel:${contact.phone}`;
  };

  const openEditDialog = (contact: EmergencyContact) => {
    setCurrentContact(contact);
    editForm.reset({
      name: contact.name,
      phone_number: contact.phone_number,
      email: contact.email || '',
      relationship: contact.relationship || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Emergency Contacts</h1>
          <p className="text-muted-foreground">Manage your emergency contacts</p>
        </div>

        <div className="mb-6 flex flex-col gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Contact
          </Button>
          
          <Button variant="outline" onClick={handleImportFromDevice}>
            <Phone className="mr-2 h-4 w-4" />
            Import from Device
          </Button>
          
          <Link to="/sos">
            <Button variant="destructive" className="w-full">
              <AlertCircle className="mr-2 h-4 w-4" />
              Emergency SOS
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div>Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/30">
            <p className="mb-4">You haven't added any emergency contacts yet.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Your First Contact</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={{
                  id: contact.id,
                  name: contact.name,
                  phone: contact.phone_number,
                  email: contact.email,
                  relationship: contact.relationship || 'Not specified',
                  priority: contact.priority,
                }}
                onCall={handleCallContact}
                onEmail={(c) => window.location.href = `mailto:${c.email}`}
                onDelete={handleDeleteContact}
                className="cursor-pointer"
                onClick={() => openEditDialog(contact)}
              />
            ))}
          </div>
        )}

        {/* Add Contact Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddContact)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +1234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include country code for international numbers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Family, Friend, Neighbor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    Add Contact
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Emergency Contact</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditContact)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +1234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include country code for international numbers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Family, Friend, Neighbor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={editForm.formState.isSubmitting}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default EmergencyContactsPage;
