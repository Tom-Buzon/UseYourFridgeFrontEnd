//////////////////////////////////////////////////////---------------------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
/////////////////////////////////////////////---------scrap It - The Marmiton-Local/API-----------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\---------------------------------/////////////////////////////////////////////////////////////////////////////
               
This script access to "https://www.marmiton.org/"

Access to the folder includind scrapit.py with your terminal ( cd "c:/ YOUR PATH").
Start the script - python scrapit.py - from your terminal.   #---------------------------------- RUN THE SCRIPT
You will have to choose a category. Pleasez Enter a Digit.

1.entree  - https://www.marmiton.org/recettes
2.plat  - https://www.marmiton.org/recettes?type=platprincipal
3.dessert - https://www.marmiton.org/recettes?type=dessert
4.aperitif - https://www.marmiton.org/recettes?type=amusegueule
5.vegetarian   -"https://www.marmiton.org/recettes/selection_vegetarien
6.boisson - https://www.marmiton.org/recettes?type=boisson
7.sauce - https://www.marmiton.org/recettes?type=sauce
8.Accompagnement - https://www.marmiton.org/recettes?type=accompagnement


When you launch the script you have to say from which page, then to which page to dowload.

It will return a file Categoryfrompagetopage.csv with clean data but not formated for database integration. (You have to delete ingredients column)

Also a ingredient csv file is deliver with a split unit/quantity/ingredient and a link to the recette id => for DataBase integration (you need both files).


///////////////////---------------------------------------------------------------------------------------------------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//////////////-------------------------IF CRASH -- launch recover.py, ligne 71 Change the Path for the Last backup.--------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///////////-------------------------------------------Re-launch spcrapit.py from the last page--------------------------------------------\\\\\\\\\\\\\\\\\\\\\\\\\\
\\\\\\\\\\\\\\----------------------------------------------------------Sorry.---------------------------------------------------------/////////////////////////////
\\\\\\\\\\\\\\\\\\-----------------------------------------------------------------------------------------------------------------/////////////////////////////////


///////////////////////////////////////////////----------to import into postgres you have to authorize the file-----------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////////////////////////////------------------------Open admin powerShell------------------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

# Ouvrir PowerShell en tant qu'administrateur
$path = "C:\Users\suean\OneDrive\Desktop\tom\Scrap\modified_igrdtRecette4.csv" #------------------ ADD YOUR PATH HERE
$user = "NT AUTHORITY\NetworkService"  # ou "postgres" selon votre configuration

# Donner les permissions
$acl = Get-Acl $path
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($user, "Read", "Allow")
$acl.SetAccessRule($rule)
Set-Acl $path $acl


////////////////////////////////////////////////////////------------Then into PGAdmin------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////-----------------------------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////--------------CReate TABLE---------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

CREATE TABLE recetteFormat (
    id SERIAL PRIMARY KEY,
    title TEXT,
    url TEXT,
    rate DECIMAL,
    Tag1 TEXT,
    Tag2 TEXT,
    Tag3 TEXT,
    Tag4 TEXT,
    Tag5 TEXT,
    difficulty TEXT,
    budget TEXT,
    people INTEGER,
    prep_time INTEGER,
    cooking_time INTEGER,
    total_time INTEGER
);

AND

CREATE TABLE recette_ingredients (
    id SERIAL PRIMARY KEY,
    recetteId INTEGER,
    unit VARCHAR,
    quantite VARCHAR,
    ingredient VARCHAR
);

AFTER IMPORT:

SELECT *
FROM recetteformat rf
JOIN recetteingredients ri ON rf.id = ri.recetteid
WHERE rf.id = 42


///////////////////////////////////////////////////------------------then push the data-----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\-------------ADD YOUR PATH IN FROM--------------///////////////////////////////////////////////////////////////

COPY recetteFormat (title, url, rate, Tag1, Tag2, Tag3, Tag4, Tag5, difficulty, budget, people, prep_time, cooking_time, total_time)
FROM 'C:\Users\suean\OneDrive\Desktop\tom\Scrap\modified_igrdtRecette3.csv'
DELIMITER ','
CSV HEADER;

\\\\\\To push to a remote database you will need to extract the databasefrom your localDatabase and then use this file for manual insertion (right click import)./////
///////////////////////////////////////////////////----------------------Thank You----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



ASCI ART !!!!!!!!!!!!!!!!