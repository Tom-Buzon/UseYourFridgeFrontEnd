import { SafeUrl } from "@angular/platform-browser";

export interface Item {
  text: string;
  value: string;
}

export interface User {
  id: number;
  username: string;
}

export interface Mesure {
  id: number;
  name: string;
}


export interface Frigo {
  id: number;
  nom: string;
  ingredients: Array<any>;
  // ajoutez d'autres propriétés si nécessaire
}

export interface Ingredient {
  id: number;
  nom: string;
  ingredient: string;
  ingredient_en: string;
  // ajoutez d'autres propriétés si nécessaire
}

export interface ShoppingItem {
  ingredient: string;
  unit: string | null;
  quantite: number | string | null;
  inFrigo: boolean;
}

export interface ShoppingList {
  id?: number;
  name: string;
  items: ShoppingItem[];
  createdAt?: string; // Ajoutez cette ligne
  scheduledDate?: string | null;
  userID?: number;
}

export interface CreateShoppingListPayload {
  name: string;
  items: ShoppingItem[];
  scheduledDate?: string | null;
  userId? : number;
}

export interface Recette {
  id: number;
  title: string;
  url: string;
  rate: number;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  difficulty: string;
  budget: string;
  people: number;
  prep_time: number;
  cooking_time: number;
  total_time: number;
  ingredients: { ingredient: string; unit: string; quantite: number }[];
  images?: string[]; // images est un tableau de chaînes
  steps?: string[]; // steps est un tableau de chaînes
  sanitizedImage?: SafeUrl;
  selected?: boolean;
  availableIngredients?: number;
  totalIngredients?: number;
  description?: string; // Ajouter une description si nécessaire
}