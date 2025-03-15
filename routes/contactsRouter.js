import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateFavoriteStatus,
} from "../controllers/contactsControllers.js";

import validateBody from "../helpers/validateBody.js";
import authenticate from "../middleware/authenticate.js";

import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from "../schemas/contactsSchemas.js";

const contactsRouter = express.Router();

// Apply authentication middleware to all routes
contactsRouter.use(authenticate);

contactsRouter.get("/", getAllContacts);
contactsRouter.get("/:id", getOneContact);
contactsRouter.delete("/:id", deleteContact);

contactsRouter.post("/", validateBody(createContactSchema), createContact);
contactsRouter.put("/:id", validateBody(updateContactSchema), updateContact);

// Route for updating favorite status
contactsRouter.patch("/:id/favorite", validateBody(updateFavoriteSchema), updateFavoriteStatus);

export default contactsRouter;