import fs from "fs/promises";
import path from "path";

const contactsPath = path.join(process.cwd(), "db/contacts.json");

export async function listContacts() {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

export async function getContactById(contactId) {
  const contacts = await listContacts();

  return contacts.find((contact) => contact.id === contactId) || null;
}

export async function removeContact(contactId) {
  const contacts = await listContacts();

  const index = contacts.findIndex((contact) => contact.id === contactId);

  if (index === -1) return null;

  const [removedContact] = contacts.splice(index, 1);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return removedContact;
}

export async function addContact(name, email, phone) {
  const contacts = await listContacts();

  const newContact = { id: Date.now().toString(), name, email, phone };

  contacts.push(newContact);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return newContact;
}

export async function updateContact(contactId, data) {
  const contacts = await listContacts();
  
  const index = contacts.findIndex((contact) => contact.id === contactId);
  
  if (index === -1) return null;
  
  // Update the contact with new data while preserving existing fields
  contacts[index] = { ...contacts[index], ...data };
  
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  
  return contacts[index];
}