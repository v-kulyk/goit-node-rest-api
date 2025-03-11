import * as contactsService from "../services/contactsServices.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";

// GET /api/contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactsService.listContacts();
    // Повертає масив всіх контактів в json-форматі зі статусом 200
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/contacts/:id
export const getOneContact = async (req, res) => {
  try {
    const contact = await contactsService.getContactById(req.params.id);
    
    // Якщо контакт за id знайдений, повертає об'єкт контакту в json-форматі зі статусом 200
    if (contact) {
      res.json(contact);
    } else {
      // Якщо контакт за id не знайдено, повертає json формату {"message": "Not found"} зі статусом 404
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/contacts/:id
export const deleteContact = async (req, res) => {
  try {
    const contact = await contactsService.removeContact(req.params.id);
    
    // Якщо контакт за id знайдений і видалений, повертає об'єкт видаленого контакту в json-форматі зі статусом 200
    if (contact) {
      res.json(contact);
    } else {
      // Якщо контакт за id не знайдено, повертає json формату {"message": "Not found"} зі статусом 404
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/contacts
export const createContact = async (req, res) => {
  // Отримує body в json-форматі з полями {name, email, phone}
  const body = req.body;
  
  // Валідація схеми
  const { error } = createContactSchema.validate(body);
  
  // Якщо в body немає якихось обов'язкових полів (або передані поля мають не валідне значення)
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  
  try {
    // Якщо body валідне, викликає функцію-сервіс addContact
    const contact = await contactsService.addContact(
      body.name,
      body.email,
      body.phone
    );
    
    // Повертає новостворений об'єкт з полями {id, name, email, phone} і статусом 201
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/contacts/:id
export const updateContact = async (req, res) => {
  const body = req.body;
  
  // Якщо запит на оновлення здійснено без передачі в body хоча б одного поля
  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: "Body must have at least one field" });
  }
  
  // Валідація переданих полів
  const { error } = updateContactSchema.validate(body);
  
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  
  try {
    // Викликає функцію-сервіс updateContact
    const contact = await contactsService.updateContact(req.params.id, body);
    
    // Якщо контакт оновлено успішно
    if (contact) {
      res.json(contact);
    } else {
      // Якщо контакт за id не знайдено
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};