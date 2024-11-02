import pandas as pd
import ast
import re

# Fonction de nettoyage des chaînes
def clean_string(s):
    if isinstance(s, str):
        # Ne pas ré-encoder les chaînes, simplement nettoyer les caractères indésirables
        s = re.sub(r'[\/:*?"<>|]', '_', s)  # Remplace les caractères invalides
        s = re.sub(r'[^\w\s]', '', s)       # Supprime les caractères non alphanumériques sauf les espaces
        s = re.sub(r'\s+', ' ', s)          # Remplace les espaces multiples par un seul espace
        return s.strip()                    # Supprime les espaces au début et à la fin
    else:
        return s

# Charger le fichier CSV avec l'encodage approprié
df = pd.read_csv(r'C:\Users\suean\OneDrive\Desktop\tom\useYourFridgeProd\UseYourFridgeFrontEnd\Scrap\platprincipal_from1_to3.csv', encoding='latin1')

# Afficher les colonnes pour vérifier leur nom
print(df.columns.tolist())

# Liste des colonnes à nettoyer (exclure 'url', 'steps', 'images', 'tags')
columns_to_clean = [col for col in df.columns if col not in ['url', 'steps', 'images', 'tags'] and df[col].dtype == 'object']

# Appliquer la fonction clean_string sur les colonnes spécifiées
for col in columns_to_clean:
    df[col] = df[col].apply(clean_string)

# Fonction pour créer les colonnes Tag1 à Tag5
def split_tags(tags):
    try:
        tag_list = ast.literal_eval(tags)
        return tag_list + [None] * (5 - len(tag_list))
    except (ValueError, SyntaxError):
        return [None] * 5

# Appliquer la fonction pour créer de nouvelles colonnes
df[['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5']] = df['tags'].apply(split_tags).apply(pd.Series)

# Supprimer la colonne 'tags'
df = df.drop(columns=['tags'])

# Sauvegarder le fichier modifié avec l'encodage approprié
output_file_path = r'C:\Users\suean\OneDrive\Desktop\tom\useYourFridgeProd\UseYourFridgeFrontEnd\Scrap\fichier_modifie.csv'
df.to_csv(output_file_path, index=False, encoding='utf-8-sig')

print("Les colonnes Tag1 à Tag5 ont été créées et la colonne 'tags' a été supprimée.")
print(f"Le fichier de sortie a été enregistré sous : {output_file_path}")
