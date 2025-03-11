import Joi from "joi";

// Schema for creating a new contact - all fields required
export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

// Schema for updating a contact - fields optional but at least one must be present
export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
}).min(1); // Ensure at least one field is present
