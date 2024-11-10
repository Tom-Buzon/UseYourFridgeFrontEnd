// app/controllers/shoppinglist.controller.js

const db = require("../models");
const ShoppingList = db.ShoppingList;
const ShoppingListItem = db.ShoppingListItem;
const ShoppingListUser = db.ShoppingListUser;
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
  const id = req.params.id;
  try {
    const shoppingLists = await ShoppingList.findAll({
      where: { userID: id },
      include: [{ model: ShoppingListItem, as: 'items' }] // Alias 'items' correspond à l'association
    });
    res.send(shoppingLists);
  } catch (error) {
    console.error("Erreur lors de la récupération des listes de courses:", error);
    res.status(500).send({ message: "Erreur lors de la récupération des listes de courses." });
  }
};


// Méthode pour ajouter des items à une liste existante
exports.addItems = async (req, res) => {
  const listId = req.params.id;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).send({ message: "Les items sont requis et doivent être un tableau." });
  }

  try {
    const shoppingList = await ShoppingList.findOne({ where: { id: listId, userID: req.userId } });

    if (!shoppingList) {
      return res.status(404).send({ message: "Liste de courses non trouvée." });
    }

    // Ajouter les nouveaux items
    const createdItems = await ShoppingListItem.bulkCreate(
      items.map(item => ({
        shoppinglist_id: listId,
        quantite: item.quantite,
        unit: item.unit,
        ingredient: item.ingredient
      }))
    );

    res.status(201).send({ ...shoppingList.toJSON(), items: createdItems });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'items à la liste de courses:", error);
    res.status(500).send({ message: "Erreur lors de l'ajout d'items à la liste de courses." });
  }
};

exports.delete = async (req, res) => {
  const listId = req.params.id;
  try {
    const result = await ShoppingList.destroy({
      where: { id: listId, userID: req.userId }
    });
    if (result === 0) {
      return res.status(404).send({ message: 'Liste de courses non trouvée.' });
    }
    res.send({ message: 'Liste de courses supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la liste de courses:', error);
    res.status(500).send({
      message: 'Erreur lors de la suppression de la liste de courses.',
      error: error.message
    });
  }
};


exports.createWithName = async (req, res) => {
  try {
    const { name, items, scheduledDate, userId } = req.body;

    // Créer la liste
    const shoppingList = await ShoppingList.create({
      name,
      scheduledDate,
      userID: req.body.userId
    });

    // Créer les items
    if (items && items.length > 0) {
      const shoppingListItems = items.map(item => ({
        ...item,
        shoppinglist_id: shoppingList.id
      }));
      await ShoppingListItem.bulkCreate(shoppingListItems);
    }

    // Récupérer la liste complète avec les items
    const completeList = await ShoppingList.findOne({
      where: { id: shoppingList.id },
      include: [{
        model: ShoppingListItem,
        as: 'items'
      }]
    });

    const userID = req.userId;

    res.status(201).json(completeList);
  } catch (error) {
    console.error('Error creating shopping list:', error);
    res.status(500).json({ message: 'Error creating shopping list' });
  }
};