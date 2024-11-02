// app/controllers/shoppinglist.controller.js

const db = require("../models");
const ShoppingList = db.shoppinglist;
const ShoppingListItem = db.shoppinglist_item;
const ShoppingListUser = db.shoppinglist_user;
const Op = db.Sequelize.Op;

// Méthode pour créer une nouvelle liste de courses
exports.create = async (req, res) => {
  console.log('Corps de la requête:', req.body); // Pour déboguer

  // Vérifier que les items sont fournis
  if (!req.body.items || !Array.isArray(req.body.items)) {
    return res.status(400).send({ message: "La liste des articles est requise." });
  }

  try {
    // Créer la liste de courses
    const shoppingList = await ShoppingList.create({
      userID: req.userId // Assurez-vous que le middleware authJwt ajoute userId à req
    });
    console.log('Liste de courses créée avec ID:', shoppingList.id);

    // Créer les articles de la liste
    const items = req.body.items.map(item => ({
      shoppinglist_id: shoppingList.id,
      quantite: item.quantite,
      unit: item.unit,
      ingredient: item.ingredient
    }));
    console.log('Articles à créer:', items);

    const createdItems = await ShoppingListItem.bulkCreate(items);
    console.log('Articles créés:', createdItems);

    // Optionnel : Lier la liste à l'utilisateur (si vous utilisez shoppinglist_user)
    await ShoppingListUser.create({
      userID: req.userId,
      shoppinglist_id: shoppingList.id
    });
    console.log('Liste de courses liée à l\'utilisateur.');

    // Récupérer la liste avec ses articles en utilisant l'alias 'items'
    const createdList = await ShoppingList.findOne({
      where: { id: shoppingList.id },
      include: [{ model: ShoppingListItem, as: 'items' }] // Utiliser l'alias 'items'
    });
    console.log('Liste de courses récupérée avec ses articles:', createdList);

    res.send(createdList);
  } catch (error) {
    console.error("Erreur lors de la création de la liste de courses:", error);
    res.status(500).send({ message: "Erreur lors de la création de la liste de courses." });
  }
};

// Méthode pour récupérer toutes les listes de courses d'un utilisateur
exports.findAll = async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.findAll({
      where: { userID: req.userId },
      include: [{ model: ShoppingListItem, as: 'items' }]
    });
    res.send(shoppingLists);
  } catch (error) {
    console.error("Erreur lors de la récupération des listes de courses:", error);
    res.status(500).send({ message: "Erreur lors de la récupération des listes de courses." });
  }
};