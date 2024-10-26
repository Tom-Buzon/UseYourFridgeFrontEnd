import json
import csv
import pandas as pd
import re
import ast

# Define the updated regex pattern to match numbers without units
updated_quantity_pattern = re.compile(
    r'([\d,.]+)\s?((cuillères? à soupe|cuillères? à café|g|kg|ml|cl|l|pincée|sachet|verre|bouillon|noix|branches?|bouquet|gousse|rave|feuilles?|morceaux?|tranches?|pots?|petit pot)?(?=\s|$))'
)

# Special handling function for 'cl' and similar cases
def process_special_cases(ingredient_entry):
    if 'cl' in ingredient_entry['ingredient']:
        index = ingredient_entry['ingredient'].find('cl')
        if index + 2 < len(ingredient_entry['ingredient']) and ingredient_entry['ingredient'][index + 2] != ' ':
            return ingredient_entry
        else:
            ingredient_entry['unit'] = 'cl'
            ingredient_entry['ingredient'] = ingredient_entry['ingredient'].replace('cl', '').strip()

    if 'gr' in ingredient_entry['ingredient']:
        index = ingredient_entry['ingredient'].find('gr')
        if index + 2 < len(ingredient_entry['ingredient']) and ingredient_entry['ingredient'][index + 2] != ' ':
            return ingredient_entry
        else:
            ingredient_entry['unit'] = 'g'
            ingredient_entry['ingredient'] = ingredient_entry['ingredient'].replace('gr', '').strip()

    return ingredient_entry

def extract_updated_quantities_units_ingredients(ingredient_list):
    ingredients = ingredient_list.split('|')
    extracted = []
    
    for ingredient in ingredients:
        match = updated_quantity_pattern.search(ingredient)
        if match:
            quantity = match.group(1)
            unit = match.group(2) if match.group(2) else ''
            ingredient_name = ingredient[match.end():].strip()
            extracted.append({'quantity': quantity, 'unit': unit, 'ingredient': ingredient_name})
        else:
            extracted.append({'quantity': '', 'unit': '', 'ingredient': ingredient.strip()})
    
    return [process_special_cases(entry) for entry in extracted]

def split_into_columns(value, max_columns):
    values = value.split('|') if value else []
    return values[:max_columns] + [''] * (max_columns - len(values))

def decompose_ingredients(ingredients_list, max_ingredients):
    ingredients, quantities, units = [], [], []
    try:
        parsed_list = ast.literal_eval(ingredients_list)
        for i, entry in enumerate(parsed_list[:max_ingredients]):
            ingredients.append(entry.get('ingredient', ''))
            quantities.append(entry.get('quantity', ''))
            units.append(entry.get('unit', ''))
    except (ValueError, SyntaxError):
        ingredients = [''] * max_ingredients
        quantities = [''] * max_ingredients
        units = [''] * max_ingredients

    return (ingredients + [''] * (max_ingredients - len(ingredients)),
            quantities + [''] * (max_ingredients - len(quantities)),
            units + [''] * (max_ingredients - len(units)))
if __name__ == "__main__":
        try:
            # Charger le fichier JSON
            input_json_file = 'C:/Users/suean/OneDrive/Desktop/tom/Scrap/recipes_backup_1125.json'
            with open(input_json_file, 'r', encoding='utf-8') as f:
                recipes = json.load(f)
    
            # Créer le nom du fichier de sortie
            dataFile = "recipes_from_json"
            
            # Sauvegarder en CSV
            output_file = f"C:/Users/suean/OneDrive/Desktop/tom/Scrap/{dataFile}.csv"
            if recipes:
                headers = list(recipes[0].keys())
    
                with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
                    writer = csv.DictWriter(f, fieldnames=headers)
                    writer.writeheader()
    
                    for recipe in recipes:
                        recipe_copy = recipe.copy()
                        for key, value in recipe_copy.items():
                            if isinstance(value, list):
                                recipe_copy[key] = '|'.join(str(item) for item in value)
                        writer.writerow(recipe_copy)
    
                print(f"Conversion CSV terminée! {len(recipes)} recettes ont été exportées vers {output_file}")
    
            # Ajouter la colonne des quantités séparées
            data = pd.read_csv(output_file)
            data['updated_separated_quantities_units'] = data['ingredients'].apply(extract_updated_quantities_units_ingredients)
            data.to_csv(output_file, index=False, encoding='utf-8-sig')
    
            # Premier formatage
            input_file = output_file
            output_file_split = f'C:/Users/suean/OneDrive/Desktop/tom/Scrap/{dataFile}_split.csv'
    
            max_tags = 5
            max_ingredients = 20
    
            # Lire et formater le CSV
            with open(input_file, 'r', encoding='utf-8') as infile, open(output_file_split, 'w', newline='', encoding='utf-8') as outfile:
                reader = csv.DictReader(infile)
    
                fieldnames = reader.fieldnames + [f'Tag{i}' for i in range(1, max_tags + 1)] \
                                                + [f'Ingredient{i}' for i in range(1, max_ingredients + 1)] \
                                                + [f'Quantity{i}' for i in range(1, max_ingredients + 1)] \
                                                + [f'Unit{i}' for i in range(1, max_ingredients + 1)]
    
                writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    
                writer.writeheader()
                for row in reader:
                    tags = split_into_columns(row['tags'], max_tags)
                    for i in range(max_tags):
                        row[f'Tag{i+1}'] = tags[i]
    
                    ingredients, quantities, units = decompose_ingredients(row['updated_separated_quantities_units'], max_ingredients)
                    for i in range(max_ingredients):
                        row[f'Ingredient{i+1}'] = ingredients[i]
                        row[f'Quantity{i+1}'] = quantities[i]
                        row[f'Unit{i+1}'] = units[i]
    
                    writer.writerow(row)
    
            print(f"Modified CSV saved to {output_file_split}")
    
            # Dernier formatage
            input_file_split = output_file_split
            output_file_final = f'C:/Users/suean/OneDrive/Desktop/tom/Scrap/{dataFile}_split_rearranged.csv'
    
            desired_columns = [
                'title', 'url', 'rate', 
                'Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5', 
                'difficulty', 'budget', 'people', 
                'Ingredient1', 'Ingredient2', 'Ingredient3', 'Ingredient4', 'Ingredient5', 
                'Ingredient6', 'Ingredient7', 'Ingredient8', 'Ingredient9', 'Ingredient10',
                'Ingredient11', 'Ingredient12', 'Ingredient13', 'Ingredient14', 'Ingredient15',
                'Ingredient16', 'Ingredient17', 'Ingredient18', 'Ingredient19', 'Ingredient20',
                'Quantity1', 'Quantity2', 'Quantity3', 'Quantity4', 'Quantity5', 
                'Quantity6', 'Quantity7', 'Quantity8', 'Quantity9', 'Quantity10',
                'Quantity11', 'Quantity12', 'Quantity13', 'Quantity14', 'Quantity15',
                'Quantity16', 'Quantity17', 'Quantity18', 'Quantity19', 'Quantity20',
                'Unit1', 'Unit2', 'Unit3', 'Unit4', 'Unit5', 
                'Unit6', 'Unit7', 'Unit8', 'Unit9', 'Unit10',
                'Unit11', 'Unit12', 'Unit13', 'Unit14', 'Unit15',
                'Unit16', 'Unit17', 'Unit18', 'Unit19', 'Unit20',
                'prep_time', 'cooking_time', 'total_time'
            ]
    
            data_rearranged = pd.read_csv(input_file_split)[desired_columns]
            data_rearranged.to_csv(output_file_final, index=False)
    
            print(f"Rearranged CSV saved to {output_file_final}")
    
        except Exception as e:
            print(f"Une erreur est survenue : {e}")
    
    

   