import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail, getUserById, updateUser, getAllUsers } from "../models/userModel.js";

// Fonction pour enregistrer un utilisateur
export const registerUser = async ({ name, email, password }) => {
  // Vérifier si l'email existe déjà
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Email déjà utilisé");

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'utilisateur
  const user = await createUser({ name, email, password: hashedPassword });
  // Sanitize
  const { password: _p, ...safeUser } = user;
  return safeUser;
};

// Fonction pour connecter un utilisateur
export const loginUser = async ({ email, password }) => {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("Utilisateur non trouvé");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Mot de passe incorrect");

  // Générer un token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const { password: _pass, ...safeUser } = user;
  return { user: safeUser, token };
};

// Fonction pour récupérer un utilisateur par ID
export const getUserProfile = async (id) => {
  const user = await getUserById(id);
  if (!user) throw new Error("Utilisateur non trouvé");
  return user;
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (id, data) => {
  // Vérifier si l'email existe déjà (si fourni et différent)
  if (data.email) {
    const existing = await getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      throw new Error("Email déjà utilisé");
    }
  }
  return await updateUser(id, data);
};

// Fonction pour récupérer tous les utilisateurs
export const fetchAllUsers = async () => {
  return await getAllUsers();
};
