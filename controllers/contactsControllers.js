import * as contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";

// GET /api/contacts
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await contactsService.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

// GET /api/contacts/:id
export const getOneContact = async (req, res, next) => {
  try {
    const contact = await contactsService.getContactById(req.params.id);

    if (!contact) {
      return next(HttpError(404, "Not found"));
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/contacts/:id
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await contactsService.removeContact(req.params.id);

    if (!contact) {
      return next(HttpError(404, "Not found"));
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
};

// POST /api/contacts
export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, favorite } = req.body;
    const contact = await contactsService.addContact(
      name,
      email,
      phone,
      favorite
    );

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

// PUT /api/contacts/:id
export const updateContact = async (req, res, next) => {
  try {
    const contact = await contactsService.updateContact(
      req.params.id,
      req.body
    );

    if (!contact) {
      return next(HttpError(404, "Not found"));
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/contacts/:id/favorite
export const updateFavoriteStatus = async (req, res, next) => {
  try {
    const contact = await contactsService.updateStatusContact(
      req.params.id,
      req.body
    );

    if (!contact) {
      return next(HttpError(404, "Not found"));
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
};
