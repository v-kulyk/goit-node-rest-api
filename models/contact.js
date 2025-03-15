import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
  }
);

// Set up association
Contact.belongsTo(User, {
  foreignKey: "owner",
  as: "user",
});

User.hasMany(Contact, {
  foreignKey: "owner",
  as: "contacts",
});

export default Contact;