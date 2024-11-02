import requests
from bs4 import BeautifulSoup
import time
from dataclasses import dataclass
from typing import List, Optional
import logging
import sys
import json
import random
from urllib.parse import urljoin
import csv
import pandas as pd
import re

# Configuration du logging avec encodage UTF-8
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraping.log', 'w', 'utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

@dataclass
class Recipe:
    title: str
    url: str
    rate: float
    tags: List[str]
    difficulty: str
    budget: str
    people: int
    ingredients: List[dict]  # Dictionnaire pour chaque ingrédient
    prep_time: int
    cooking_time: int
    total_time: int
    steps: List[str]
    images: List[str]

    def to_dict(self):
        return {
            "title": self.title,
            "url": self.url,
            "rate": self.rate,
            "tags": self.tags,
            "difficulty": self.difficulty,
            "budget": self.budget,
            "people": self.people,
            "prep_time": self.prep_time,
            "cooking_time": self.cooking_time,
            "total_time": self.total_time,
            "steps": self.steps,
            "images": self.images
        }
    
def clean_ingredient_value(value):
    return ' '.join(value.split()).strip()

unit_patterns  = [
r'\bgrosses\b',r'\bgrosse\b',  r'\bgros\b', 
r'\bbon\b', r'\bbons\b', r'\bbonnes\b', r'\bbonne\b', r'\bmorceaux\b', r'\bmorceau\b',
r'\bpetites boîtes\b', r'\bpetite boîte\b', r'\bboîtes moyennes\b', r'\bboîte moyenne\b', r'\bboîtes\b',  r'\bboîte\b'
r'\bcuillères à soupe\b', r'\bcuillère à soupe\b', r'\bcuillères à café\b', r'\bcuillère à café\b',
r'\bcuillères rases\b', r'\bcuillère rase\b', r'\bcuillères\b', r'\bcuillère\b',
r'\bpoignées\b', r'\bpoignée\b', r'\btranches\b', r'\btranche\b',
r'\blamelles\b', r'\blamelle\b', r'\bpointes de couteaux\b', r'\bpointe de couteau\b',
r'\bpointes\b', r'\bpointe\b', r'\btours de moulin\b', r'\btour de moulin\b',
r'\bmoitiés\b', r'\bmoitié\b', r'\bpots\b', r'\bpot\b',
r'\bdoses\b', r'\bdose\b', r'\bpincées\b', r'\bpincée\b',
r'\bzestes\b', r'\bzeste\b', r'\bverres\b', r'\bverre\b',
r'\btasses\b', r'\btasse\b', r'\bsachets\b', r'\bsachet\b',
r'\bbouquets\b', r'\bbouquet\b', r'\bpaquets\b', r'\bpaquet\b',
r'\bfilets\b', r'\bfilet\b', r'\bfeuilles\b', r'\bfeuille\b',
r'\bbols\b', r'\bbol\b', r'\bblocs\b', r'\bbloc\b',
r'\bgouttes\b', r'\bgoutte\b', r'\bdemi(?!\S)\b',
r'\bbriquettes\b', r'\bbriquette\b', r'\bbrins\b', r'\bbrin\b',
r'\bbranches\b', r'\bbranche\b', r'\bbouteilles\b', r'\bbouteille\b',
r'\bboules\b', r'\bboule\b', r'\bbottes\b', r'\bbotte\b',
r'\bbocaux\b', r'\bbocal\b', r'\bblancs\b', r'\bblanc\b',
r'\bbelles\b', r'\bbelle\b', r'\bbeaux\b', r'\bbeau\b',
r'\bbâtons\b', r'\bbâton\b', r'\bbarquettes\b', r'\bbarquette\b',
r'\bgousses\b', r'\bgousse\b', r'\bgrosses\b', r'\bgrosse\b',
r'\bbons\b', r'\bbon\b', r'\bbonnes\b', r'\bbonne\b'
]

class MarmitonScraper:
    def __init__(self):
        self.base_url = "https://www.marmiton.org"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        self.pages_visitees = []
        self.recipes = []

    @staticmethod
    def get_category_url():
        categories = {
            "1": ("Entrées", "https://www.marmiton.org/recettes?type=entree"),
            "2": ("Plats principaux", "https://www.marmiton.org/recettes?type=platprincipal"),
            "3": ("Desserts", "https://www.marmiton.org/recettes?type=dessert"),
            "4": ("Apéritifs", "https://www.marmiton.org/recettes?type=amusegueule"),
            "5": ("Végétarien", "https://www.marmiton.org/recettes/selection_vegetarien/"),
            "6": ("Boissons", "https://www.marmiton.org/recettes?type=boisson"),
            "7": ("Sauces", "https://www.marmiton.org/recettes?type=sauce"),
            "8": ("Accompagnements", "https://www.marmiton.org/recettes?type=accompagnement")
        }

        print("\nCatégories disponibles:")
        for key, (name, _) in categories.items():
            print(f"{key}. {name}")

        while True:
            choice = input("\nChoisissez une catégorie (1-8) : ")
            if choice in categories:
                return categories[choice][1]
            print("Choix invalide. Veuillez choisir un numéro entre 1 et 8.")    

    def get_page_content(self, url: str) -> Optional[str]:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=self.headers)
                response.raise_for_status()
                return response.content
            except requests.RequestException as e:
                logging.error(f"Erreur lors de la récupération de {url}: {e}")
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    logging.info(f"Nouvelle tentative dans {wait_time} secondes...")
                    time.sleep(wait_time)
                else:
                    logging.error("Nombre maximum de tentatives atteint")
                    return None

    def clean_ingredient_value(value):
        """Nettoie les retours à la ligne et les espaces supplémentaires dans une chaîne."""
        return ' '.join(value.split()).strip()

    # Liste des unités courantes (exemples)


    def parse_recipe(self, url: str) -> Optional[Recipe]:
        try:
            content = self.get_page_content(url)
            if not content:
                return None

            soup = BeautifulSoup(content, 'html.parser')
            title = soup.find('h1').text.strip() if soup.find('h1') else ""
            rate_div = soup.find('span', class_='recipe-header__rating-text')
            rate = float(rate_div.text.strip().split('/')[0]) if rate_div else 0.0

            tags = [tag.text.strip() for tag in soup.find_all('a', class_='mrtn-tag')]
            breadcrumb = soup.find('p', class_='af-bread-crumb')
            if breadcrumb:
                category_links = breadcrumb.find_all('a')[2:]
                for link in category_links:
                    category = link.text.strip()
                    if category not in tags:
                        tags.append(category)

            recipe_primary = soup.find('div', class_='recipe-primary')
            if recipe_primary:
                primary_items = recipe_primary.find_all('div', class_='recipe-primary__item')
                difficulty = primary_items[1].find('span').text.strip() if len(primary_items) > 1 else "Non spécifié"
                budget = primary_items[2].find('span').text.strip() if len(primary_items) > 2 else "Non spécifié"
            else:
                difficulty = "Non spécifié"
                budget = "Non spécifié"

            people_input = soup.find('input', class_='recipe-ingredients__qt-counter__value')
            people = int(people_input['value']) if people_input else 4

            ingredients = []
            for ing_div in soup.find_all('div', class_='card-ingredient'):
                name = ing_div.find('span', class_='ingredient-name')
                quantity = ing_div.find('span', class_='card-ingredient-quantity')

                if name:
                    ingredient_text = clean_ingredient_value(name.text.strip())
                    quantity_text = clean_ingredient_value(quantity.text) if quantity else ''

                    # Regex pour capturer quantité, unité et nom d'ingrédient
                    match = re.match(rf"(\d*\.?\d*)\s*({unit_patterns})?\s*(.*)", quantity_text)
                    if match:
                        quantity = match.group(1).strip() if match.group(1) else ''
                        unit = match.group(2).strip() if match.group(2) else ''
                    else:
                        quantity, unit = '', ''

                    ingredients.append({
                        'ingredient': ingredient_text,
                        'quantity': quantity,
                        'unit': unit
                    })

            # Continue processing for time, steps, and images
            time_div = soup.find('div', class_='recipe-preparation__time')
            prep_time = 0
            cooking_time = 0
            if time_div:
                time_details = time_div.find('div', class_='time__details')
                if time_details:
                    time_divs = time_details.find_all('div', recursive=False)
                    for div in time_divs:
                        span_text = div.find('span').text.strip() if div.find('span') else ""
                        time_text = div.find_all('div')[-1].text.strip()
                        time_digits = ''.join(filter(str.isdigit, time_text))
                        if time_digits:
                            if "Préparation" in span_text:
                                prep_time = int(time_digits)
                            elif "Cuisson" in span_text:
                                cooking_time = int(time_digits)
            total_time = prep_time + cooking_time if prep_time or cooking_time else 0

            images = [img['src'] for img in soup.find_all('img', class_='recipe-media-viewer-picture')]
            steps = [step.find('p').text.strip() for step in soup.find_all('div', class_='recipe-step-list__container')]

            return Recipe(
                title=title,
                url=url,
                rate=rate,
                tags=tags,
                difficulty=difficulty,
                budget=budget,
                people=people,
                ingredients=ingredients,
                prep_time=prep_time,
                cooking_time=cooking_time,
                total_time=total_time,
                steps=steps,
                images=images
            )

        except Exception as e:
            logging.error(f"Erreur lors du parsing de la recette {url}: {e}")
            return None

    def scrape_recipes(self, base_url: str, max_recipes: int = 100, start_page: int = 1, nb_pages: int = None) -> List[Recipe]:
        recipes = []
        current_page = start_page
        pages_visited = 0

        while len(recipes) < max_recipes:
            if nb_pages and pages_visited >= nb_pages:
                logging.info(f"Nombre de pages demandé atteint ({nb_pages})")
                break
            
            page_url = f"{base_url}&page={current_page}" if "?" in base_url else f"{base_url}?page={current_page}"
            logging.info(f"Visite de la page {current_page}: {page_url}")
    
            content = self.get_page_content(page_url)
            if not content:
                break
            
            soup = BeautifulSoup(content, 'html.parser')
            recipe_cards = soup.find_all('a', class_='MRTN-recipeCard-link')
            if not recipe_cards:
                recipe_cards = soup.find_all('a', {'class': lambda x: x and 'recipe-card' in x.lower()})
            if not recipe_cards:
                main_content = soup.find('main') or soup.find('div', class_='main-content')
                if main_content:
                    recipe_cards = main_content.find_all('a', href=lambda x: x and '/recettes/recette_' in x)

            if not recipe_cards:
                logging.warning("Aucune recette trouvée sur cette page")
                break
            
            for card in recipe_cards:
                if len(recipes) >= max_recipes:
                    break
                
                recipe_url = urljoin(self.base_url, card['href'])
                if recipe_url not in self.pages_visitees:
                    self.pages_visitees.append(recipe_url)
                    logging.info(f"Traitement de la recette: {recipe_url}")
    
                    time.sleep(random.uniform(1, 3))
                    recipe = self.parse_recipe(recipe_url)
                    if recipe:
                        recipes.append(recipe)
                        logging.info(f"Recette ajoutée: {recipe.title}")

            current_page += 1
            pages_visited += 1
            time.sleep(2)
    
        return recipes

# Fonction pour créer les fichiers CSV principal et des ingrédients
def generate_csv_with_ingredients(recipes, main_csv_path, ingredient_csv_path):
    main_data = []
    ingredient_data = []
    
    for recette_id, recipe in enumerate(recipes, start=1):
        main_entry = recipe.to_dict()
        main_entry["id"] = recette_id
        main_data.append(main_entry)
        
        for ingredient in recipe.ingredients:
            ingredient_data.append({
                "recette_id": recette_id,
                "unit": ingredient.get('unit', ''),
                "quantity": ingredient.get('quantity', ''),
                "ingredient": ingredient.get('ingredient', ''),
            })
    
    with open(main_csv_path, 'w', newline='', encoding='utf-8-sig') as main_csv:
        fieldnames = list(main_data[0].keys())
        writer = csv.DictWriter(main_csv, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(main_data)
    
    with open(ingredient_csv_path, 'w', newline='', encoding='utf-8-sig') as ingredient_csv:
        writer = csv.DictWriter(ingredient_csv, fieldnames=["recette_id", "ingredient", "quantity", "unit"])
        writer.writeheader()
        writer.writerows(ingredient_data)

    print(f"Fichiers CSV sauvegardés: {main_csv_path} et {ingredient_csv_path}")

# Exemple d'utilisation
if __name__ == "__main__":
    try:
        scraper = MarmitonScraper()
        category_url = MarmitonScraper.get_category_url() 
        start_page = int(input("À partir de quelle page voulez-vous commencer ? (1 par défaut) : ") or "1")
        nb_pages = int(input("Combien de pages voulez-vous scraper ? : "))

        category_name = category_url.split('type=')[-1].split('&')[0] if 'type=' in category_url else 'categorie'
        category_name_sanitized = re.sub(r'[\/:*?"<>|]', '_', category_name)
        dataFile = f"{category_name_sanitized}_from{start_page}_to{nb_pages + start_page - 1}"

        print(f"\nDébut du scraping de la catégorie à partir de l'URL : {category_url}")

        recipes = scraper.scrape_recipes(
            category_url,
            max_recipes=nb_pages * 12,
            start_page=start_page,
            nb_pages=nb_pages
        )

        main_csv_path = f"C:/Users/suean/OneDrive/Desktop/tom/useYourFridgeProd/UseYourFridgeFrontEnd/Scrap/{dataFile}.csv"
        ingredient_csv_path = f"C:/Users/suean/OneDrive/Desktop/tom/useYourFridgeProd/UseYourFridgeFrontEnd/Scrap/{dataFile}_ingredientRecette.csv"

        if recipes:
            generate_csv_with_ingredients(recipes, main_csv_path, ingredient_csv_path)
        else:
            print("Aucune recette trouvée pour la conversion en CSV")

    except Exception as e:
        print(f"Une erreur est survenue : {e}")
