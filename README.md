Born To Travel - Back-end

Ce projet contient la partie back-end de l'application BornToTravel.
Résumé du Backend

Ce README documente la section backend de l'application BornToTravel. Le backend est construit avec NestJS et TypeORM, fournissant une base robuste pour la gestion des données, l'authentification des utilisateurs, et l'intégration des API externes. Il joue un rôle crucial dans le traitement des demandes, la sécurité des données et la fourniture de réponses aux clients de l'application.
Architecture du Backend

Le backend de BornToTravel est structuré en modules distincts pour une meilleure organisation et une maintenance facile :

    Module Authentification : Gère l'authentification et la sécurité des utilisateurs.
    Module Places : Récupère et gère les informations touristiques et les bornes de recharge pour véhicules électriques.
    Module Users : Responsable de la gestion des comptes utilisateurs.
    Module Favorites : Permet aux utilisateurs d'enregistrer et de gérer leurs lieux favoris.

Chaque module est conçu pour fonctionner de manière indépendante tout en contribuant à la fonctionnalité globale de l'application.
Installation

L'application utilise npm/yarn pour gérer ses dépendances. Assurez-vous d'avoir Node.js installé avant d'exécuter ces commandes.
Clonage du projet

Pour obtenir une copie locale du projet, exécutez la commande suivante dans votre terminal :

$ git clone https://github.com/polewebdev/BornToTravel.git

Accès au dossier du projet

Rendez-vous dans le dossier contenant le projet :

$ cd "BornToTravel" 

Installer les dépendances

Pour garantir la cohérence et éviter tout problème d'incompatibilité, il est recommandé de n'utiliser qu'une seule dépendance. Choisissez votre gestionnaire de paquets préféré, npm ou yarn, et utilisez-le exclusivement pour gérer les dépendances et exécuter les scripts dans ce projet.

$ npm install    # Utilisez cette commande si vous utilisez npm
$ yarn install   # Utilisez cette commande si vous utilisez yarn

Configuration

Avant de lancer le projet, assurez-vous de configurer correctement votre application en fonction de votre environnement local. Voici comment vous pouvez configurer les paramètres de connexion à votre base de données et d'autres informations essentielles :

    Navigation vers le Fichier Principal

    Action: Ouvrez le fichier principal du module de l'application.
    Chemin: src/app.module.ts

    Comprendre la Configuration

    Contexte: Dans le fichier app.module.ts, vous trouverez une référence à DatabaseModule à l'intérieur du décorateur @Module.
    Astuce: Cherchez la propriété imports du décorateur @Module.

    Accéder au Module de Base de Données

    Action: Ouvrez le fichier où DatabaseModule est défini.
    Chemin: src/DatabaseModule.ts
    Astuce: Si votre éditeur le prend en charge, cliquez sur DatabaseModule dans app.module.ts pour y accéder directement.

    Ajuster la Configuration de TypeORM

    Emplacement: Recherchez la section TypeOrmModule.forRootAsync({ ... }) dans DatabaseModule.ts.
    Conseil: Ceci est généralement dans le décorateur @Module de DatabaseModule.

    Modifier la Configuration de la Base de Données

    Action: Adaptez les valeurs de configuration à vos paramètres locaux de base de données:

TypeOrmModule.forRootAsync({
   imports: [ConfigModule],
   useFactory: (configService: ConfigService): MysqlConnectionOptions => ({
     type: "mysql", // Type de SGBD utilisé (e.g., mysql, postgres, etc.).
     host: configService.get<MysqlConnectionOptions["host", "defaultHost"]>('DATABASE_HOST', 3306), // Adresse IP ou domaine du serveur de base de données (e.g., localhost).
     port: configService.get<MysqlConnectionOptions["port"]>('DATABASE_PORT'), // Port de connexion à la base de données (MySQL utilise le 3306 par défaut)
     username: configService.get<MysqlConnectionOptions["username"]>('DATABASE_USERNAME', 'defaultUsername'),// Identifiant de connexion à la base de données.
     password:configService.get<MysqlConnectionOptions["password"]>('DATABASE_PASSWORD', 'defaultPassword'),// Mot de passe associé à l'identifiant.
     database: configService.get<MysqlConnectionOptions["database"]>('DATABASE_DATABASE', 'defaultDatabase'),,// Nom de la base de données ciblée.
     entities: [Place,User,RefreshToken, FavoritePlace], // Entités ORM liées à la base de données.
     synchronize: configService.get<MysqlConnectionOptions["synchronize"]>('DATABASE_SYNCHRONIZE', false), // DANGER! Active/désactive la synchro auto de la BD. Utiliser "true" en dev pour l'activer, "false" en prod pour le désactiver
     supportBigNumbers: configService.get<MysqlConnectionOptions["supportBigNumbers"]>('DATABASE_SUPPORTBIGNUMBERS', false),// Activer pour gérer de grandes valeurs numériques (BIGINT, DECIMAL) comme par exemple, l'utilisation de ID
   }),
   inject: [ConfigService],
 }),

6. Installer le module de configuration de NestJS.

Installez le module @nestjs/config pour gérer les variables d'environnement, ce qui permet de garder les données sensibles hors du code source.

```bash
$ npm i --save @nestjs/config
$ yarn add @nestjs/config

    Configuration des variables d'environnement.

a. Créez un fichier .env à la racine de votre projet NestJS et définissez les variables d'environnement nécessaires.


MY_APP_NODE_ENV= # Définit l'environnement d'exécution de l'application avec des modes prédéfinis: MY_APP_NODE_ENV=development,production,test,provision. Cette variable joue un rôle crucial dans la configuration de validateDecoratorSynchronize.ts pour initialiser un décorateur sur mesure qui exclut DATABASE_SYNCHRONIZE en mode "production". Cette exclusion prévient tout risque de suppression accidentelle de la base de données si DATABASE_SYNCHRONIZE est positionné à "true". Il doit être mis de cette manière : MY_APP_NODE_ENV=development,production,test,provision
NODE_ENV= # L'environnement Node.js standard pour déterminer le mode d'exécution. Les valeurs courantes sont "development", "production", "test", etc.
DATABASE_HOST= # Adresse IP ou domaine du serveur de base de données (e.g., localhost).
DATABASE_PORT= # Port de connexion à la base de données (MySQL utilise le 3306 par défaut)
DATABASE_USERNAME= # Identifiant de connexion à la base de données.
DATABASE_PASSWORD= # Mot de passe associé à l'identifiant.
DATABASE_DATABASE= # Nom de la base de données ciblée.
DATABASE_SYNCHRONIZE= # true ou false
DATABASE_SUPPORTBIGNUMBERS= # true ou false

b. Assurez-vous de ne pas exposer vos données sensibles : ajoutez le fichier .env à votre .gitignore pour éviter de l'ajouter accidentellement à votre dépôt GitHub.


# .gitignore
.env

Note : Les variables d'environnement définies dans .env sont accessibles dans votre application via le module @nestjs/config et peuvent être utilisées pour configurer votre module de base de données et d'autres services sans exposer d'informations sensibles dans le code ou le dépôt. Assurez-vous de documenter les variables attendues dans votre README ou votre documentation pour faciliter la configuration par d'autres développeurs ou des utilisateurs finaux.

    Validation de la Configuration Environnementale

Contexte:

La mise en place d'un mécanisme rigoureux de validation des données pour le fichier .env a été une initiative délibérée dans ce projet, s'alignant sur un besoin crucial de précision, de sécurité et d'adéquation des variables environnementales. Ces dernières jouent un rôle pivotal dans l’exécution correcte de l'application à travers divers environnements (développement, production, test, etc.). L'optique sous-jacente à cette démarche est d'établir un degré supplémentaire d'assurance, s'assurant que les entrées du fichier .env ne sont pas simplement valides, mais correspondent également à nos aspirations et exigences opérationnelles. Le Processus de Validation:

Le script src/config/env.validation.ts orchestre le processus de validation, faisant office de plaque tournante où les contrôles et critères de validation des variables environnementales sont définis et gérés. Cela implique d'explorer et de valider les données selon un ensemble de règles préétablies, tout en signalant toute irrégularité ou incongruité. Sécurisation de la Configuration de Base de Données:

En parallèle, un décorateur personnalisé a été construit et est localisé dans src/config/validateDecoratorSynchronize.ts. Conçu spécifiquement pour être appliqué à la variable d'environnement DATABASE_SYNCHRONIZE, son but est de prévenir tout déclenchement accidentel de la synchronisation de la base de données en mode production, une initiative visant à parer à d'éventuelles perturbations ou pertes de données dues à des modifications non désirées du schéma de base de données. Pourquoi valider .env ?

    Prévention des erreurs: La validation stricte du fichier .env garantit que toutes les variables environnementales requises sont bien définies avant le démarrage de l'application, minimisant ainsi les risques d'erreurs durant l'exécution.

    Sécurité: La validation des configurations permet de mettre en œuvre des contrôles assurant une configuration sécurisée. A titre d'exemple dans ce contexte applicatif, le fait de garantir que synchronize soit défini à false en production pour prévenir toute modification involontaire du schéma de la base de données grâce au décorateur personnalisé @IsSynchronizeValid().

    Clarté: Cette approche procure une documentation transparente et fournit des messages d'erreur explicites concernant les prérequis de configuration et les anomalies potentielles, facilitant ainsi le processus de débogage.

    Renforcement du Typage Fort dans le Projet BornToTravel avec NestJS et TypeScript.

Dans le cadre du développement du projet BornToTravel, nous avons adopté une approche rigoureuse du typage fort en utilisant TypeScript. Cette initiative a comporté la suppression presque totale des types any, remplacés par des types spécifiques pour chaque fonction, variable et paramètre, dans le but de prévenir les erreurs et d'assurer une meilleure fiabilité du code.

Les exemples suivants, tirés directement du module "place", illustrent notre démarche :

    Interfaces telles que MuseumRecordInterface, MuseumApiResponseInterface, et FilteredMuseumRecordInterface pour structurer les données des API.

    Type AllPlacesType pour regrouper les différents types de lieux touristiques, utilisé dans le service fetchAllPlaces :

typescript

```typescript

export type AllPlacesType = 
  FilteredMuseumRecordInterface | 
  FilteredMonumentRecordInterface | 
  FilteredPointOfViewApiRecordInterface | 
  FilteredTouristOfficeInterface | 
  DivertissementApiRecordInterface | 
  FilteredChargePointsInterface;
```

Ces exemples représentent une partie de nos efforts pour renforcer la qualité du code. Des approches similaires ont été mises en œuvre dans d'autres modules du projet, où des interfaces et des types spécifiques ont été définis pour répondre aux besoins uniques de chaque composant.

L'adoption de ces pratiques typographiques améliore la robustesse et la maintenabilité de notre application, en garantissant la cohérence et la fiabilité des données à travers le projet.

    Amélioration de la Gestion des Erreurs

Nous avons considérablement renforcé la gestion des erreurs dans l'ensemble de notre application. Dans chaque module, les fonctions des contrôleurs et des services ont été dotées d'une gestion d'erreur améliorée. Cela assure que toutes les erreurs potentielles sont non seulement capturées mais aussi traitées de manière appropriée.

Chaque cas d'erreur est désormais géré de façon spécifique, retournant les codes d'erreur adaptés et des messages explicites. Cette approche permet une meilleure compréhension des problèmes survenant durant l'exécution et facilite le débogage.

De plus, cette amélioration est cruciale pour la communication entre le backend et le frontend. Les erreurs traitées et formatées correctement peuvent être transmises au frontend, permettant ainsi l'affichage de messages d'erreur précis et compréhensibles pour l'utilisateur final. Cela contribue à une expérience utilisateur plus cohérente et informée.

Cette stratégie de gestion des erreurs améliore non seulement la robustesse de notre backend, mais enrichit également l'interface utilisateur en fournissant des retours clairs et utiles en cas de problèmes.

    Amélioration des Data Transfer Objects (DTOs)

Nous avons apporté des améliorations significatives aux DTOs (Data Transfer Objects) dans notre projet, en intégrant des décorateurs de validation pour assurer la cohérence des types de données. Ces décorateurs, fournis par la bibliothèque class-validator, jouent un rôle crucial dans la validation des données entrantes, garantissant ainsi que les informations reçues correspondent aux types attendus.

Prenons l'exemple du module places


  import { IsArray, IsNumber, IsString } from "class-validator";

  export class CreatePlaceDto {
    @IsString()
    name?: string;
    @IsString()
    localite?: string;
    @IsString()
    categorieApi?: string;
    @IsString()
    categorie?: string;
    @IsString()
    telephone?: string;
    @IsString()
    adresse?: string;
    @IsArray()
    @IsNumber({}, { each: true })
    geolocalisation?: number[];
  }

Dans cet exemple, les décorateurs comme @IsString() et @IsArray() avec @IsNumber() sont utilisés pour valider que les données fournies correspondent bien aux types spécifiés (comme des chaînes de caractères ou des tableaux de nombres). Cette approche renforce la robustesse de notre API en prévenant les erreurs liées aux types de données incorrects et en assurant une meilleure intégrité des données.

Cette amélioration des DTOs contribue grandement à la fiabilité et à la sécurité de notre application, en empêchant efficacement l'introduction de données invalides ou mal formées.

    Implémentation du Décorateur @Exclude pour la Sécurité des Données

Dans notre quête constante d'améliorer la sécurité de notre application, nous avons intégré le décorateur @Exclude() de class-transformer pour gérer avec précision les données transmises au frontend. Cette approche est essentielle pour protéger les informations sensibles et préserver la confidentialité des utilisateurs.

Un exemple parlant se trouve dans notre entité User du module "typeorm". Le décorateur @Exclude() est utilisé pour exclure certaines propriétés sensibles de l'entité lors de la sérialisation, comme le montre le code suivant :


import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RefreshToken, FavoritePlace } from './...';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  // ... Autres colonnes ...

  @Exclude()
  @Column({type: 'varchar', nullable: false })
  password: string;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // ... Autres colonnes exclues ...

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

Pour que le décorateur @Exclude() fonctionne correctement, nous avons ajouté un constructeur qui permet de traiter toutes les propriétés comme partielles. En outre, dans nos contrôleurs, l'utilisation du ClassSerializerInterceptor assure que les exclusions définies dans les entités soient respectées lors de la réponse aux requêtes. Voici un exemple dans le contrôleur du module users :


@UseInterceptors(ClassSerializerInterceptor)
@Get()
async getAllUsers(): Promise<User[]> {
  try {
    return this.userService.findAllUsers();
  } catch(err) {
    // ... Gestion des erreurs ...
  }
}

Cette mise en œuvre contribue à un niveau de sécurité accru, en veillant à ce que seules les informations nécessaires soient partagées avec le frontend, tout en excluant efficacement les données sensibles.

    Utilisation des UUIDs pour Renforcer la Sécurité des Identifiants avec TypeORM

Pour améliorer la sécurité de notre base de données, nous avons intégré l'utilisation d'UUIDs (Universally Unique Identifiers) dans la gestion des identifiants (IDs) de chaque module et table. Les UUIDs rendent les identifiants moins prévisibles et plus difficiles à manipuler de manière malveillante.

Une caractéristique clé de notre implémentation est l'utilisation de TypeORM, qui propose et gère automatiquement les UUIDv4. Ces UUIDs de version 4 sont générés aléatoirement, garantissant ainsi un niveau élevé de singularité et de sécurité.

Voici un exemple de la façon dont nous appliquons les UUIDs dans l'entité User :


import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { RefreshToken, FavoritePlace } from './...';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ... Autres propriétés et relations ...
}

Dans cet exemple, l'annotation @PrimaryGeneratedColumn("uuid") indique à TypeORM de générer automatiquement un UUIDv4 pour chaque nouvel enregistrement. Cette approche non seulement simplifie le processus de création d'identifiants uniques, mais renforce également la sécurité en évitant les conflits d'ID et en réduisant les risques de manipulation des données.

L'adoption des UUIDv4 dans notre projet s'aligne avec les meilleures pratiques de sécurité des bases de données et souligne notre engagement envers la protection et l'intégrité des données.

    Migration vers Luxon.js en Remplacement de Moment.js

Dans notre démarche continue d'amélioration et de modernisation de notre code, nous avons effectué une migration significative de la bibliothèque de gestion de dates Moment.js vers Luxon.js. Cette décision a été prise en réponse à la dépréciation de Moment.js, qui n'est plus activement maintenue depuis plus de trois ans.

L'adoption de Luxon.js offre plusieurs avantages clés :

    Sécurité renforcée : En éliminant l'utilisation de Moment.js, nous réduisons le risque associé aux failles de sécurité potentielles dans une bibliothèque obsolète.
    Meilleure performance : Luxon.js est reconnu pour sa légèreté et son efficacité, contribuant ainsi à l'amélioration des performances de notre application.
    Fonctionnalités modernes : Luxon.js apporte des fonctionnalités modernes et une API plus intuitive, facilitant la manipulation et le formatage des dates et des heures.

Voici un exemple illustrant l'utilisation de Luxon.js dans notre code :


// Exemple d'utilisation de Luxon.js pour manipuler et formater des dates
import { DateTime } from 'luxon';

const now = DateTime.now();
console.log(now.toISO()); // Affiche la date et l'heure actuelles au format ISO

Cette migration vers Luxon.js représente un pas en avant dans l'utilisation de technologies à jour et fiables, alignant ainsi notre projet avec les meilleures pratiques de développement moderne.

    Utilisation de Redis pour la Mise en Cache

L'intégration de Redis dans notre projet représente une avancée majeure dans la gestion de la mise en cache, contribuant significativement à l'amélioration des performances et à la persistance des données. Voici un guide détaillé pour mettre en place Redis avec Docker Compose et l'intégrer dans notre application NestJS. Mise en Place de Redis avec Docker Compose

1. Installation de Docker Compose : Commencez par installer Docker (https://www.docker.com/products/docker-desktop/).

2. Création du fichier Docker Compose : Créez un fichier docker-compose.yml en utilisant la commande touch docker-compose.yml. Ajoutez-y la configuration suivante pour définir le service Redis :

```yml
  services:
    redis:
      container_name: cache
      image: redis
      ports:
        - "6379:6379"
      volumes:
        - redis:/data
      deploy:
        resources:
          limits:
            cpus: '0.50'
            memory: 512M
          reservations:
            cpus: '0.25'
            memory: 256M
      restart: always
      logging:
        driver: json-file
        options:
          max-size: "200k"
          max-file: "10"

  volumes:
    redis:
      driver: local
```

3. Lancement du Serveur Redis : Exécutez docker-compose up dans le terminal pour démarrer le serveur Redis.

Intégration de Redis dans NestJS

1. Installation des Packages Nécessaires : Installez le package NestJS config en utilisant npm i --save @nestjs/config.

2. Configuration dans app.module.ts : Importez CacheModule de cache-manager et redisStore de cache-manager-redis-store. Configurez le CacheModule comme suit :

``` typescript

@Module({
  imports: [
    // Autres imports...
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      // Autres configurations...
    }),
  ],
})
```

3. Utilisation de la Cache : Implémentez la logique de mise en cache dans vos services. Par exemple, pour vérifier si un lieu existe dans la cache :

``` typescript
      async isPlaceExistsOnCache(placeReference: string): Promise<boolean> {
    // Logique pour vérifier la cache
  }
```

4. Injection du Gestionnaire de Cache : Injectez CACHE_MANAGER dans vos services pour interagir avec la cache Redis.

5. Auto-Caching des Réponses : Utilisez @UseInterceptors(CacheInterceptor) dans vos contrôleurs pour mettre en cache automatiquement les réponses.

6. Configuration de l'Environnement de Production : Configurez les variables d'environnement pour Redis en production, en utilisant process.env pour les paramètres tels que l'hôte et le port.

Conclusion

L'adoption de Redis pour la mise en cache est un choix stratégique qui optimise les performances de notre application et renforce la persistance des données. Ce guide fournit les étapes essentielles pour intégrer Redis dans un projet NestJS, assurant ainsi une mise en œuvre efficace et professionnelle.

Vous pouvez aller sur ce site pour plus de tutoriel: https://www.tomray.dev/nestjs-caching-redis

Lancer le projet

Pour démarrer et gérer efficacement votre projet, suivez les instructions ci-dessous. Il est crucial de maintenir une utilisation constante d'un seul gestionnaire de dépendances, soit npm soit yarn, pour éviter les problèmes d'incompatibilité ou de synchronisation des dépendances. Prérequis :

* Ouvrez WAMP (ou un autre serveur local) et Docker Desktop avant de commencer.
* Vérifiez que toutes les dépendances nécessaires sont installées.

En Mode Développement :

1. Démarrage de Redis avec Docker Compose :
Dans le terminal, exécutez :

```bash
  $ docker-compose up
```

Cette commande démarre le serveur Redis nécessaire pour la gestion de la mise en cache.

2. Lancement de l'Application :

Utilisez la commande appropriée en fonction de votre gestionnaire de dépendances :

    Avec npm :

```bash

$ npm run start:dev

* Avec yarn :

```bash

        $ yarn start:dev

Ces commandes lancent l'application en mode développement, où elle se mettra à jour automatiquement à chaque modification du code. En Mode Production :

Pour lancer votre application en mode production, les étapes sont légèrement différentes, axées sur la stabilité et l'optimisation des performances.

1. Construire l'Application :
Tout d'abord, construisez une version optimisée de votre application. Cette étape compile et optimise votre code pour la production.

       Avec npm :

      ```bash
        $ npm run build
      ```

    Avec yarn :


    $ yarn build

    2 Lancer l'Application en Production :

Une fois l'application construite, utilisez la commande suivante pour la démarrer :

    Avec npm :

```bash
$ npm run start:prod
```

    Avec yarn :


        $ yarn start:prod

Ces commandes exécutent la version optimisée de votre application, adaptée pour un environnement de production. Remarques Importantes :

* Assurez-vous que toutes les configurations, telles que les variables d'environnement et les paramètres de connexion, sont correctement définies pour l'environnement de production.
* Il est recommandé de tester l'application en mode production dans un environnement de pré-production avant de la déployer réellement.

Auteurs

    Antoine Jolivet & David Satria Bouhaben

License

HDM
Structure du Projet

Le projet est structuré en plusieurs modules, chacun responsable d'une partie spécifique de l'application.
Module Authentification

Le module d'authentification gère l'authentification des utilisateurs et la sécurité de l'application. Il comprend les fonctionnalités suivantes :

    Connexion des utilisateurs

    Deconnexion des utilisateurs

    Demande de changement de mot de passe

    Gestion des tokens d'accès et de rafraîchissement

    Dossiers et fichiers pertinents : src/auth

Module Places

Le module Places gère les parties suivantes :

    Récupération des activités touristiques
    Récupération des lieux touristiques
    Récupération bornes de recharge pour les véhicules électriques
    Ajout de ces données dans la base de données

La récupération des données se fait à partir de sources externes (API):

    Bornes de Recharge pour Véhicules Électriques : Les données concernant les points de recharge sont obtenues via l'API Open Charge Map (https://openchargemap.org/site/develop/api#/). Cette API fournit des informations détaillées sur les emplacements des bornes de recharge, leur type, et d'autres caractéristiques pertinentes.

    API Touristiques : Pour les informations relatives aux lieux touristiques tels que les musées, monuments, points de vue, et offices de tourisme, nous utilisons une API fournie par ODWB (https://www.odwb.be/pages/home/). Cette API est une source riche d'informations touristiques en Belgique, offrant des données précises et à jour.

La fonctionnalité principale est de retourner des endpoints dont les données sont structurées et filtrables :

    "nom de domaine" + "/places" --> Récupère toutes les données
    "nom de domaine" + "/places" + "?category=" + "nom catégorie" --> Récupère les données par type (borne de recharge, visites...)
    "nom de domaine" + "/places" + "?category=" + "nom catégorie" + "&subcategory=" + "nom sous catégorie" --> Récupère les données par sous-catégorie (musée, promenade...)

exemple: http://localhost:3000/places?category=bornederecharge http://localhost:3000/places?category=visite&subcategory=musee

    Dossiers et fichiers pertinents : src/places

Module Favorites

Le module Favorites sert à :

    Ajouter des données externes "Places" dans la base de données afin de lier un utilisateur à cette donnée. Cela permet de créer un système de favori pour un utilisateur.

    Afficher certains données des lieux que l'utilisateur a mis dans ses favorits

    Dossiers et fichiers pertinents : src/favorites

Module Users

Le module Users contient toute la partie de gestion de compte utilisateur. Les fonctionnalités principales sont les suivantes :

    Récupération des informations utilisateur (par son id, mail ou toutes les utilisateurs)

    Modificaiton des informations utilisateur

    Supression des informations utilisateur

    Ajour d'un utilisateur

    Dossiers et fichiers pertinents : src/users

Dossier utils

    Contient un dossier exceptions contenant les class qui permettent de renvoyer des exceptions personnalisées.
    Fichier bcrypt qui contient le traitement du mot de passe utilisateur
    Fichier extractCategory qui contient la logique d'extraction des mots clés dans les libellés de l'api "divertissement".
    Fichier keywords qui contient les tableaux de synonymes permettant d'extraire des libellés les mots clés afin de les associer à une catégorie.
    Fichier Type qui contient tous les types utilisés comme modèles pour représenter différentes entités telles que les catégories, les utilisateurs, les lieux, et les informations de transport.
    Fichier ValidationService qui contient les fonctions de validation pour les données qui nécessitent des critères spéciaux (mot de passe, email...)

Auteurs

    Antoine Jolivet & David Satria Bouhaben

Authors

    @octokatherine

Born To Travel - Back-end

Ce projet contient la partie back-end de l'application BornToTravel.
Résumé du Backend

Ce README documente la section backend de l'application BornToTravel. Le backend est construit avec NestJS et TypeORM, fournissant une base robuste pour la gestion des données, l'authentification des utilisateurs, et l'intégration des API externes. Il joue un rôle crucial dans le traitement des demandes, la sécurité des données et la fourniture de réponses aux clients de l'application.
Architecture du Backend

Le backend de BornToTravel est structuré en modules distincts pour une meilleure organisation et une maintenance facile :

    Module Authentification : Gère l'authentification et la sécurité des utilisateurs.
    Module Places : Récupère et gère les informations touristiques et les bornes de recharge pour véhicules électriques.
    Module Users : Responsable de la gestion des comptes utilisateurs.
    Module Favorites : Permet aux utilisateurs d'enregistrer et de gérer leurs lieux favoris.

Chaque module est conçu pour fonctionner de manière indépendante tout en contribuant à la fonctionnalité globale de l'application.
Installation

L'application utilise npm/yarn pour gérer ses dépendances. Assurez-vous d'avoir Node.js installé avant d'exécuter ces commandes.
Clonage du projet

Pour obtenir une copie locale du projet, exécutez la commande suivante dans votre terminal :

$ git clone https://github.com/polewebdev/BornToTravel.git

Accès au dossier du projet

Rendez-vous dans le dossier contenant le projet :

$ cd "BornToTravel" 

Installer les dépendances

Pour garantir la cohérence et éviter tout problème d'incompatibilité, il est recommandé de n'utiliser qu'une seule dépendance. Choisissez votre gestionnaire de paquets préféré, npm ou yarn, et utilisez-le exclusivement pour gérer les dépendances et exécuter les scripts dans ce projet.

$ npm install    # Utilisez cette commande si vous utilisez npm
$ yarn install   # Utilisez cette commande si vous utilisez yarn

Configuration

Avant de lancer le projet, assurez-vous de configurer correctement votre application en fonction de votre environnement local. Voici comment vous pouvez configurer les paramètres de connexion à votre base de données et d'autres informations essentielles :

    Navigation vers le Fichier Principal

    Action: Ouvrez le fichier principal du module de l'application.
    Chemin: src/app.module.ts

    Comprendre la Configuration

    Contexte: Dans le fichier app.module.ts, vous trouverez une référence à DatabaseModule à l'intérieur du décorateur @Module.
    Astuce: Cherchez la propriété imports du décorateur @Module.

    Accéder au Module de Base de Données

    Action: Ouvrez le fichier où DatabaseModule est défini.
    Chemin: src/DatabaseModule.ts
    Astuce: Si votre éditeur le prend en charge, cliquez sur DatabaseModule dans app.module.ts pour y accéder directement.

    Ajuster la Configuration de TypeORM

    Emplacement: Recherchez la section TypeOrmModule.forRootAsync({ ... }) dans DatabaseModule.ts.
    Conseil: Ceci est généralement dans le décorateur @Module de DatabaseModule.

    Modifier la Configuration de la Base de Données

    Action: Adaptez les valeurs de configuration à vos paramètres locaux de base de données:

TypeOrmModule.forRootAsync({
   imports: [ConfigModule],
   useFactory: (configService: ConfigService): MysqlConnectionOptions => ({
     type: "mysql", // Type de SGBD utilisé (e.g., mysql, postgres, etc.).
     host: configService.get<MysqlConnectionOptions["host", "defaultHost"]>('DATABASE_HOST', 3306), // Adresse IP ou domaine du serveur de base de données (e.g., localhost).
     port: configService.get<MysqlConnectionOptions["port"]>('DATABASE_PORT'), // Port de connexion à la base de données (MySQL utilise le 3306 par défaut)
     username: configService.get<MysqlConnectionOptions["username"]>('DATABASE_USERNAME', 'defaultUsername'),// Identifiant de connexion à la base de données.
     password:configService.get<MysqlConnectionOptions["password"]>('DATABASE_PASSWORD', 'defaultPassword'),// Mot de passe associé à l'identifiant.
     database: configService.get<MysqlConnectionOptions["database"]>('DATABASE_DATABASE', 'defaultDatabase'),,// Nom de la base de données ciblée.
     entities: [Place,User,RefreshToken, FavoritePlace], // Entités ORM liées à la base de données.
     synchronize: configService.get<MysqlConnectionOptions["synchronize"]>('DATABASE_SYNCHRONIZE', false), // DANGER! Active/désactive la synchro auto de la BD. Utiliser "true" en dev pour l'activer, "false" en prod pour le désactiver
     supportBigNumbers: configService.get<MysqlConnectionOptions["supportBigNumbers"]>('DATABASE_SUPPORTBIGNUMBERS', false),// Activer pour gérer de grandes valeurs numériques (BIGINT, DECIMAL) comme par exemple, l'utilisation de ID
   }),
   inject: [ConfigService],
 }),

6. Installer le module de configuration de NestJS.

Installez le module @nestjs/config pour gérer les variables d'environnement, ce qui permet de garder les données sensibles hors du code source.

```bash
$ npm i --save @nestjs/config
$ yarn add @nestjs/config

    Configuration des variables d'environnement.

a. Créez un fichier .env à la racine de votre projet NestJS et définissez les variables d'environnement nécessaires.


MY_APP_NODE_ENV= # Définit l'environnement d'exécution de l'application avec des modes prédéfinis: MY_APP_NODE_ENV=development,production,test,provision. Cette variable joue un rôle crucial dans la configuration de validateDecoratorSynchronize.ts pour initialiser un décorateur sur mesure qui exclut DATABASE_SYNCHRONIZE en mode "production". Cette exclusion prévient tout risque de suppression accidentelle de la base de données si DATABASE_SYNCHRONIZE est positionné à "true". Il doit être mis de cette manière : MY_APP_NODE_ENV=development,production,test,provision
NODE_ENV= # L'environnement Node.js standard pour déterminer le mode d'exécution. Les valeurs courantes sont "development", "production", "test", etc.
DATABASE_HOST= # Adresse IP ou domaine du serveur de base de données (e.g., localhost).
DATABASE_PORT= # Port de connexion à la base de données (MySQL utilise le 3306 par défaut)
DATABASE_USERNAME= # Identifiant de connexion à la base de données.
DATABASE_PASSWORD= # Mot de passe associé à l'identifiant.
DATABASE_DATABASE= # Nom de la base de données ciblée.
DATABASE_SYNCHRONIZE= # true ou false
DATABASE_SUPPORTBIGNUMBERS= # true ou false

b. Assurez-vous de ne pas exposer vos données sensibles : ajoutez le fichier .env à votre .gitignore pour éviter de l'ajouter accidentellement à votre dépôt GitHub.


# .gitignore
.env

Note : Les variables d'environnement définies dans .env sont accessibles dans votre application via le module @nestjs/config et peuvent être utilisées pour configurer votre module de base de données et d'autres services sans exposer d'informations sensibles dans le code ou le dépôt. Assurez-vous de documenter les variables attendues dans votre README ou votre documentation pour faciliter la configuration par d'autres développeurs ou des utilisateurs finaux.

    Validation de la Configuration Environnementale

Contexte:

La mise en place d'un mécanisme rigoureux de validation des données pour le fichier .env a été une initiative délibérée dans ce projet, s'alignant sur un besoin crucial de précision, de sécurité et d'adéquation des variables environnementales. Ces dernières jouent un rôle pivotal dans l’exécution correcte de l'application à travers divers environnements (développement, production, test, etc.). L'optique sous-jacente à cette démarche est d'établir un degré supplémentaire d'assurance, s'assurant que les entrées du fichier .env ne sont pas simplement valides, mais correspondent également à nos aspirations et exigences opérationnelles. Le Processus de Validation:

Le script src/config/env.validation.ts orchestre le processus de validation, faisant office de plaque tournante où les contrôles et critères de validation des variables environnementales sont définis et gérés. Cela implique d'explorer et de valider les données selon un ensemble de règles préétablies, tout en signalant toute irrégularité ou incongruité. Sécurisation de la Configuration de Base de Données:

En parallèle, un décorateur personnalisé a été construit et est localisé dans src/config/validateDecoratorSynchronize.ts. Conçu spécifiquement pour être appliqué à la variable d'environnement DATABASE_SYNCHRONIZE, son but est de prévenir tout déclenchement accidentel de la synchronisation de la base de données en mode production, une initiative visant à parer à d'éventuelles perturbations ou pertes de données dues à des modifications non désirées du schéma de base de données. Pourquoi valider .env ?

    Prévention des erreurs: La validation stricte du fichier .env garantit que toutes les variables environnementales requises sont bien définies avant le démarrage de l'application, minimisant ainsi les risques d'erreurs durant l'exécution.

    Sécurité: La validation des configurations permet de mettre en œuvre des contrôles assurant une configuration sécurisée. A titre d'exemple dans ce contexte applicatif, le fait de garantir que synchronize soit défini à false en production pour prévenir toute modification involontaire du schéma de la base de données grâce au décorateur personnalisé @IsSynchronizeValid().

    Clarté: Cette approche procure une documentation transparente et fournit des messages d'erreur explicites concernant les prérequis de configuration et les anomalies potentielles, facilitant ainsi le processus de débogage.

    Renforcement du Typage Fort dans le Projet BornToTravel avec NestJS et TypeScript.

Dans le cadre du développement du projet BornToTravel, nous avons adopté une approche rigoureuse du typage fort en utilisant TypeScript. Cette initiative a comporté la suppression presque totale des types any, remplacés par des types spécifiques pour chaque fonction, variable et paramètre, dans le but de prévenir les erreurs et d'assurer une meilleure fiabilité du code.

Les exemples suivants, tirés directement du module "place", illustrent notre démarche :

    Interfaces telles que MuseumRecordInterface, MuseumApiResponseInterface, et FilteredMuseumRecordInterface pour structurer les données des API.

    Type AllPlacesType pour regrouper les différents types de lieux touristiques, utilisé dans le service fetchAllPlaces :

typescript

```typescript

export type AllPlacesType = 
  FilteredMuseumRecordInterface | 
  FilteredMonumentRecordInterface | 
  FilteredPointOfViewApiRecordInterface | 
  FilteredTouristOfficeInterface | 
  DivertissementApiRecordInterface | 
  FilteredChargePointsInterface;
```

Ces exemples représentent une partie de nos efforts pour renforcer la qualité du code. Des approches similaires ont été mises en œuvre dans d'autres modules du projet, où des interfaces et des types spécifiques ont été définis pour répondre aux besoins uniques de chaque composant.

L'adoption de ces pratiques typographiques améliore la robustesse et la maintenabilité de notre application, en garantissant la cohérence et la fiabilité des données à travers le projet.

    Amélioration de la Gestion des Erreurs

Nous avons considérablement renforcé la gestion des erreurs dans l'ensemble de notre application. Dans chaque module, les fonctions des contrôleurs et des services ont été dotées d'une gestion d'erreur améliorée. Cela assure que toutes les erreurs potentielles sont non seulement capturées mais aussi traitées de manière appropriée.

Chaque cas d'erreur est désormais géré de façon spécifique, retournant les codes d'erreur adaptés et des messages explicites. Cette approche permet une meilleure compréhension des problèmes survenant durant l'exécution et facilite le débogage.

De plus, cette amélioration est cruciale pour la communication entre le backend et le frontend. Les erreurs traitées et formatées correctement peuvent être transmises au frontend, permettant ainsi l'affichage de messages d'erreur précis et compréhensibles pour l'utilisateur final. Cela contribue à une expérience utilisateur plus cohérente et informée.

Cette stratégie de gestion des erreurs améliore non seulement la robustesse de notre backend, mais enrichit également l'interface utilisateur en fournissant des retours clairs et utiles en cas de problèmes.

    Amélioration des Data Transfer Objects (DTOs)

Nous avons apporté des améliorations significatives aux DTOs (Data Transfer Objects) dans notre projet, en intégrant des décorateurs de validation pour assurer la cohérence des types de données. Ces décorateurs, fournis par la bibliothèque class-validator, jouent un rôle crucial dans la validation des données entrantes, garantissant ainsi que les informations reçues correspondent aux types attendus.

Prenons l'exemple du module places


  import { IsArray, IsNumber, IsString } from "class-validator";

  export class CreatePlaceDto {
    @IsString()
    name?: string;
    @IsString()
    localite?: string;
    @IsString()
    categorieApi?: string;
    @IsString()
    categorie?: string;
    @IsString()
    telephone?: string;
    @IsString()
    adresse?: string;
    @IsArray()
    @IsNumber({}, { each: true })
    geolocalisation?: number[];
  }

Dans cet exemple, les décorateurs comme @IsString() et @IsArray() avec @IsNumber() sont utilisés pour valider que les données fournies correspondent bien aux types spécifiés (comme des chaînes de caractères ou des tableaux de nombres). Cette approche renforce la robustesse de notre API en prévenant les erreurs liées aux types de données incorrects et en assurant une meilleure intégrité des données.

Cette amélioration des DTOs contribue grandement à la fiabilité et à la sécurité de notre application, en empêchant efficacement l'introduction de données invalides ou mal formées.

    Implémentation du Décorateur @Exclude pour la Sécurité des Données

Dans notre quête constante d'améliorer la sécurité de notre application, nous avons intégré le décorateur @Exclude() de class-transformer pour gérer avec précision les données transmises au frontend. Cette approche est essentielle pour protéger les informations sensibles et préserver la confidentialité des utilisateurs.

Un exemple parlant se trouve dans notre entité User du module "typeorm". Le décorateur @Exclude() est utilisé pour exclure certaines propriétés sensibles de l'entité lors de la sérialisation, comme le montre le code suivant :


import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RefreshToken, FavoritePlace } from './...';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  // ... Autres colonnes ...

  @Exclude()
  @Column({type: 'varchar', nullable: false })
  password: string;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // ... Autres colonnes exclues ...

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

Pour que le décorateur @Exclude() fonctionne correctement, nous avons ajouté un constructeur qui permet de traiter toutes les propriétés comme partielles. En outre, dans nos contrôleurs, l'utilisation du ClassSerializerInterceptor assure que les exclusions définies dans les entités soient respectées lors de la réponse aux requêtes. Voici un exemple dans le contrôleur du module users :


@UseInterceptors(ClassSerializerInterceptor)
@Get()
async getAllUsers(): Promise<User[]> {
  try {
    return this.userService.findAllUsers();
  } catch(err) {
    // ... Gestion des erreurs ...
  }
}

Cette mise en œuvre contribue à un niveau de sécurité accru, en veillant à ce que seules les informations nécessaires soient partagées avec le frontend, tout en excluant efficacement les données sensibles.

    Utilisation des UUIDs pour Renforcer la Sécurité des Identifiants avec TypeORM

Pour améliorer la sécurité de notre base de données, nous avons intégré l'utilisation d'UUIDs (Universally Unique Identifiers) dans la gestion des identifiants (IDs) de chaque module et table. Les UUIDs rendent les identifiants moins prévisibles et plus difficiles à manipuler de manière malveillante.

Une caractéristique clé de notre implémentation est l'utilisation de TypeORM, qui propose et gère automatiquement les UUIDv4. Ces UUIDs de version 4 sont générés aléatoirement, garantissant ainsi un niveau élevé de singularité et de sécurité.

Voici un exemple de la façon dont nous appliquons les UUIDs dans l'entité User :


import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { RefreshToken, FavoritePlace } from './...';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ... Autres propriétés et relations ...
}

Dans cet exemple, l'annotation @PrimaryGeneratedColumn("uuid") indique à TypeORM de générer automatiquement un UUIDv4 pour chaque nouvel enregistrement. Cette approche non seulement simplifie le processus de création d'identifiants uniques, mais renforce également la sécurité en évitant les conflits d'ID et en réduisant les risques de manipulation des données.

L'adoption des UUIDv4 dans notre projet s'aligne avec les meilleures pratiques de sécurité des bases de données et souligne notre engagement envers la protection et l'intégrité des données.

    Migration vers Luxon.js en Remplacement de Moment.js

Dans notre démarche continue d'amélioration et de modernisation de notre code, nous avons effectué une migration significative de la bibliothèque de gestion de dates Moment.js vers Luxon.js. Cette décision a été prise en réponse à la dépréciation de Moment.js, qui n'est plus activement maintenue depuis plus de trois ans.

L'adoption de Luxon.js offre plusieurs avantages clés :

    Sécurité renforcée : En éliminant l'utilisation de Moment.js, nous réduisons le risque associé aux failles de sécurité potentielles dans une bibliothèque obsolète.
    Meilleure performance : Luxon.js est reconnu pour sa légèreté et son efficacité, contribuant ainsi à l'amélioration des performances de notre application.
    Fonctionnalités modernes : Luxon.js apporte des fonctionnalités modernes et une API plus intuitive, facilitant la manipulation et le formatage des dates et des heures.

Voici un exemple illustrant l'utilisation de Luxon.js dans notre code :


// Exemple d'utilisation de Luxon.js pour manipuler et formater des dates
import { DateTime } from 'luxon';

const now = DateTime.now();
console.log(now.toISO()); // Affiche la date et l'heure actuelles au format ISO

Cette migration vers Luxon.js représente un pas en avant dans l'utilisation de technologies à jour et fiables, alignant ainsi notre projet avec les meilleures pratiques de développement moderne.

    Utilisation de Redis pour la Mise en Cache

L'intégration de Redis dans notre projet représente une avancée majeure dans la gestion de la mise en cache, contribuant significativement à l'amélioration des performances et à la persistance des données. Voici un guide détaillé pour mettre en place Redis avec Docker Compose et l'intégrer dans notre application NestJS. Mise en Place de Redis avec Docker Compose

1. Installation de Docker Compose : Commencez par installer Docker (https://www.docker.com/products/docker-desktop/).

2. Création du fichier Docker Compose : Créez un fichier docker-compose.yml en utilisant la commande touch docker-compose.yml. Ajoutez-y la configuration suivante pour définir le service Redis :

```yml
  services:
    redis:
      container_name: cache
      image: redis
      ports:
        - "6379:6379"
      volumes:
        - redis:/data
      deploy:
        resources:
          limits:
            cpus: '0.50'
            memory: 512M
          reservations:
            cpus: '0.25'
            memory: 256M
      restart: always
      logging:
        driver: json-file
        options:
          max-size: "200k"
          max-file: "10"

  volumes:
    redis:
      driver: local
```

3. Lancement du Serveur Redis : Exécutez docker-compose up dans le terminal pour démarrer le serveur Redis.

Intégration de Redis dans NestJS

1. Installation des Packages Nécessaires : Installez le package NestJS config en utilisant npm i --save @nestjs/config.

2. Configuration dans app.module.ts : Importez CacheModule de cache-manager et redisStore de cache-manager-redis-store. Configurez le CacheModule comme suit :

``` typescript

@Module({
  imports: [
    // Autres imports...
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      // Autres configurations...
    }),
  ],
})
```

3. Utilisation de la Cache : Implémentez la logique de mise en cache dans vos services. Par exemple, pour vérifier si un lieu existe dans la cache :

``` typescript
      async isPlaceExistsOnCache(placeReference: string): Promise<boolean> {
    // Logique pour vérifier la cache
  }
```

4. Injection du Gestionnaire de Cache : Injectez CACHE_MANAGER dans vos services pour interagir avec la cache Redis.

5. Auto-Caching des Réponses : Utilisez @UseInterceptors(CacheInterceptor) dans vos contrôleurs pour mettre en cache automatiquement les réponses.

6. Configuration de l'Environnement de Production : Configurez les variables d'environnement pour Redis en production, en utilisant process.env pour les paramètres tels que l'hôte et le port.

Conclusion

L'adoption de Redis pour la mise en cache est un choix stratégique qui optimise les performances de notre application et renforce la persistance des données. Ce guide fournit les étapes essentielles pour intégrer Redis dans un projet NestJS, assurant ainsi une mise en œuvre efficace et professionnelle.

Vous pouvez aller sur ce site pour plus de tutoriel: https://www.tomray.dev/nestjs-caching-redis

Lancer le projet

Pour démarrer et gérer efficacement votre projet, suivez les instructions ci-dessous. Il est crucial de maintenir une utilisation constante d'un seul gestionnaire de dépendances, soit npm soit yarn, pour éviter les problèmes d'incompatibilité ou de synchronisation des dépendances. Prérequis :

* Ouvrez WAMP (ou un autre serveur local) et Docker Desktop avant de commencer.
* Vérifiez que toutes les dépendances nécessaires sont installées.

En Mode Développement :

1. Démarrage de Redis avec Docker Compose :
Dans le terminal, exécutez :

```bash
  $ docker-compose up
```

Cette commande démarre le serveur Redis nécessaire pour la gestion de la mise en cache.

2. Lancement de l'Application :

Utilisez la commande appropriée en fonction de votre gestionnaire de dépendances :

    Avec npm :

```bash

$ npm run start:dev

* Avec yarn :

```bash

        $ yarn start:dev

Ces commandes lancent l'application en mode développement, où elle se mettra à jour automatiquement à chaque modification du code. En Mode Production :

Pour lancer votre application en mode production, les étapes sont légèrement différentes, axées sur la stabilité et l'optimisation des performances.

1. Construire l'Application :
Tout d'abord, construisez une version optimisée de votre application. Cette étape compile et optimise votre code pour la production.

       Avec npm :

      ```bash
        $ npm run build
      ```

    Avec yarn :


    $ yarn build

    2 Lancer l'Application en Production :

Une fois l'application construite, utilisez la commande suivante pour la démarrer :

    Avec npm :

```bash
$ npm run start:prod
```

    Avec yarn :


        $ yarn start:prod

Ces commandes exécutent la version optimisée de votre application, adaptée pour un environnement de production. Remarques Importantes :

* Assurez-vous que toutes les configurations, telles que les variables d'environnement et les paramètres de connexion, sont correctement définies pour l'environnement de production.
* Il est recommandé de tester l'application en mode production dans un environnement de pré-production avant de la déployer réellement.

Auteurs

    Antoine Jolivet & David Satria Bouhaben

License

HDM
Structure du Projet

Le projet est structuré en plusieurs modules, chacun responsable d'une partie spécifique de l'application.
Module Authentification

Le module d'authentification gère l'authentification des utilisateurs et la sécurité de l'application. Il comprend les fonctionnalités suivantes :

    Connexion des utilisateurs

    Deconnexion des utilisateurs

    Demande de changement de mot de passe

    Gestion des tokens d'accès et de rafraîchissement

    Dossiers et fichiers pertinents : src/auth

Module Places

Le module Places gère les parties suivantes :

    Récupération des activités touristiques
    Récupération des lieux touristiques
    Récupération bornes de recharge pour les véhicules électriques
    Ajout de ces données dans la base de données

La récupération des données se fait à partir de sources externes (API):

    Bornes de Recharge pour Véhicules Électriques : Les données concernant les points de recharge sont obtenues via l'API Open Charge Map (https://openchargemap.org/site/develop/api#/). Cette API fournit des informations détaillées sur les emplacements des bornes de recharge, leur type, et d'autres caractéristiques pertinentes.

    API Touristiques : Pour les informations relatives aux lieux touristiques tels que les musées, monuments, points de vue, et offices de tourisme, nous utilisons une API fournie par ODWB (https://www.odwb.be/pages/home/). Cette API est une source riche d'informations touristiques en Belgique, offrant des données précises et à jour.

La fonctionnalité principale est de retourner des endpoints dont les données sont structurées et filtrables :

    "nom de domaine" + "/places" --> Récupère toutes les données
    "nom de domaine" + "/places" + "?category=" + "nom catégorie" --> Récupère les données par type (borne de recharge, visites...)
    "nom de domaine" + "/places" + "?category=" + "nom catégorie" + "&subcategory=" + "nom sous catégorie" --> Récupère les données par sous-catégorie (musée, promenade...)

exemple: http://localhost:3000/places?category=bornederecharge http://localhost:3000/places?category=visite&subcategory=musee

    Dossiers et fichiers pertinents : src/places

Module Favorites

Le module Favorites sert à :

    Ajouter des données externes "Places" dans la base de données afin de lier un utilisateur à cette donnée. Cela permet de créer un système de favori pour un utilisateur.

    Afficher certains données des lieux que l'utilisateur a mis dans ses favorits

    Dossiers et fichiers pertinents : src/favorites

Module Users

Le module Users contient toute la partie de gestion de compte utilisateur. Les fonctionnalités principales sont les suivantes :

    Récupération des informations utilisateur (par son id, mail ou toutes les utilisateurs)

    Modificaiton des informations utilisateur

    Supression des informations utilisateur

    Ajour d'un utilisateur

    Dossiers et fichiers pertinents : src/users

Dossier utils

    Contient un dossier exceptions contenant les class qui permettent de renvoyer des exceptions personnalisées.
    Fichier bcrypt qui contient le traitement du mot de passe utilisateur
    Fichier extractCategory qui contient la logique d'extraction des mots clés dans les libellés de l'api "divertissement".
    Fichier keywords qui contient les tableaux de synonymes permettant d'extraire des libellés les mots clés afin de les associer à une catégorie.
    Fichier Type qui contient tous les types utilisés comme modèles pour représenter différentes entités telles que les catégories, les utilisateurs, les lieux, et les informations de transport.
    Fichier ValidationService qui contient les fonctions de validation pour les données qui nécessitent des critères spéciaux (mot de passe, email...)

Auteurs

    Antoine Jolivet & David Satria Bouhaben