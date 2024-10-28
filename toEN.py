import pandas as pd
from deep_translator import GoogleTranslator
import time
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_user_input():
    """
    Demande à l'utilisateur de saisir le nombre de lignes à traiter.
    Si aucune entrée n'est fournie, retourne None pour traiter tout le fichier.
    """
    while True:
        user_input = input("Entrez le nombre de lignes à traiter (appuyez sur Entrée pour tout traiter) : ").strip()
        if user_input == "":
            return None
        try:
            n = int(user_input)
            if n > 0:
                return n
            else:
                print("Le nombre de lignes doit être un entier positif. Veuillez réessayer.")
        except ValueError:
            print("Entrée invalide. Veuillez entrer un nombre entier ou appuyer sur Entrée pour tout traiter.")

def batch_translate(texts, translator, batch_size=100):
    """
    Traduit une liste de textes en utilisant le traducteur fourni.
    La traduction est effectuée par lots de taille 'batch_size' pour optimiser les performances.
    """
    translations = []
    total = len(texts)
    for i in range(0, total, batch_size):
        batch = texts[i:i+batch_size]
        try:
            translated_batch = translator.translate_batch(batch)
            translations.extend(translated_batch)
        except Exception as e:
            print(f"Erreur de traduction pour le lot {i//batch_size + 1}: {e}")
            # Remplir le lot avec des traductions vides en cas d'erreur
            translations.extend([""] * len(batch))
        # Petit délai entre les lots pour éviter de surcharger le service de traduction
        time.sleep(0.5)
    return translations

def translate_column(col, df, translator, excluded_columns, translation_cache):
    """
    Traduit une colonne spécifique du DataFrame.
    """
    new_col = f"{col}_en"
    print(f"Traduction de la colonne: '{col}' en '{new_col}'")

    # Extraire les textes à traduire, en éliminant les valeurs manquantes
    texts = df[col].dropna().astype(str).tolist()

    # Identifier les textes uniques pour la mise en cache
    unique_texts = list(set(texts))

    # Traduire les textes uniques
    print(f"Traduction de {len(unique_texts)} textes uniques dans la colonne '{col}'.")
    translated_texts = batch_translate(unique_texts, translator, batch_size=25)
    # Dans la fonction batch_translate, augmenter le délai à 1 seconde
    time.sleep(1)

    # Remplir le cache
    for original, translated in zip(unique_texts, translated_texts):
        translation_cache[original] = translated

    # Appliquer les traductions à la colonne
    df[new_col] = df[col].apply(lambda x: translation_cache.get(str(x), ""))

    return df

def main():
    # Chemin des fichiers
    input_csv = r'C:\Users\suean\OneDrive\Desktop\tom\useYourFridgeProd\UseYourFridgeFrontEnd\fullingrFR.csv'
    output_csv = r'C:\Users\suean\OneDrive\Desktop\tom\useYourFridgeProd\UseYourFridgeFrontEnd\fullingrFRandEN.csv'

    # Initialiser le traducteur
    translator = GoogleTranslator(source='fr', target='en')

    # Liste des colonnes à exclure de la traduction
   # excluded_columns = ['id', 'url', 'rate', 'tag4', 'tag5', 'people', 'prep_time', 'cooking_time', 'total_time']
    excluded_columns = ['id', 'recetteid']

    # Lire le fichier CSV
    try:
        df = pd.read_csv(input_csv, encoding='utf-8')
        print("Fichier CSV lu avec succès.")
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier CSV: {e}")
        sys.exit(1)

    # Demander à l'utilisateur le nombre de lignes à traiter
    limit = get_user_input()
    if limit is not None:
        df = df.head(limit)
        print(f"Traitement des {limit} premières lignes.")
    else:
        print("Traitement de l'intégralité du fichier.")

    # Identifier les colonnes à traduire (toutes sauf celles dans excluded_columns)
    columns_to_translate = [col for col in df.columns if col.lower() not in excluded_columns]
    print(f"Colonnes à traduire : {columns_to_translate}")

    # Initialiser un dictionnaire de cache pour stocker les traductions déjà effectuées
    translation_cache = {}

    # Dupliquer les colonnes et ajouter le suffixe '_en'
    for col in columns_to_translate:
        new_col = f"{col}_en"
        df[new_col] = ""

    # Utiliser ThreadPoolExecutor pour traduire les colonnes en parallèle
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(translate_column, col, df, translator, excluded_columns, translation_cache): col for col in columns_to_translate}
        for future in as_completed(futures):
            col = futures[future]
            try:
                df = future.result()
                print(f"Colonne '{col}' traduite avec succès.")
            except Exception as e:
                print(f"Erreur lors de la traduction de la colonne '{col}': {e}")

    # Sauvegarder le nouveau CSV
    try:
        df.to_csv(output_csv, index=False, encoding='utf-8-sig')
        print(f"Traduction terminée. Le fichier traduit est sauvegardé sous '{output_csv}'")
    except Exception as e:
        print(f"Erreur lors de la sauvegarde du fichier CSV: {e}")

if __name__ == "__main__":
    main()
