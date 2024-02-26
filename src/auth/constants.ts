import * as dotenv from 'dotenv';
dotenv.config();

  /**
   * Definition des constants JWT pour les gestions de token d'acces et de refraichissement.
   * Les valeurs par défaut sont définies pour garantir les fonctionnalités mêmes si les variables d'environnement ne sont pas définies.
   * @property {string} secret - Clé secrète utilisée pour signer les tokens d'accès.
   * @property {string} refreshSecret - Clé secrète utilisée pour signer les tokens de rafraîchissement JWT.
   * @property {string|number} refreshExpiration - Durée de validité des tokens de rafraîchissement.
  */
export const jwtConstants = {
  secret: process.env.SECRET || "YOUR_ACCESS_TOKEN_SECRET_KEY",
  refreshSecret: process.env.REFRESH_SECRET || "YOUR_REFRESH_TOKEN_SECRET_KEY",
  refreshExpiration: "7d",
};

  /**
    * Definition des constants JWT pour les mots de passe associés aux tokens d'acces et de refraichissement.
    * Les valeurs par défaut sont définies pour garantir les fonctionnalités mêmes si les variables d'environnement ne sont pas définies.
    * @property {string} secret - Clé secrète utilisée pour signer les tokens d'accès aux operations mot de passe
    * @property {string} refreshSecret - Clé secrète utilisée pour signer les tokens de rafraîchissement JWT utilisées dans les opérations de mot de passe.
    * @property {string|number} refreshExpiration - Clé secrète utilisée pour signer les tokens de rafraîchissement JWT utilisées dans les opérations de mot de passe.
  */
export const jwtConstantsPasswordToken = {
  secret: process.env.SECRET|| "YOUR_ACCESS_TOKEN_SECRET_KEY",
  refreshSecret: process.env.REFRESH_SECRET|| "YOUR_REFRESH_TOKEN_SECRET_KEY",
  refreshExpiration: "7d", 
};
