import Contact from "../models/contact.js";

export async function listContacts(filter = {}, skip = 0, limit = 20) {
  return await Contact.findAll({
    where: filter,
    offset: skip,
    limit: parseInt(limit),
  });
}

export async function getContactById(contactId, userId) {
  return await Contact.findOne({
    where: {
      id: contactId,
      owner: userId,
    },
  });
}

export async function removeContact(contactId, userId) {
  const contact = await Contact.findOne({
    where: {
      id: contactId,
      owner: userId,
    },
  });

  if (!contact) return null;

  await contact.destroy();
  return contact;
}

export async function addContact(name, email, phone, favorite, owner) {
  return await Contact.create({ name, email, phone, favorite, owner });
}

export async function updateContact(contactId, data, userId) {
  const contact = await Contact.findOne({
    where: {
      id: contactId,
      owner: userId,
    },
  });

  if (!contact) return null;

  await contact.update(data);
  return contact;
}

export async function updateStatusContact(contactId, data, userId) {
  const contact = await Contact.findOne({
    where: {
      id: contactId,
      owner: userId,
    },
  });

  if (!contact) return null;

  await contact.update({ favorite: data.favorite });
  return contact;
}