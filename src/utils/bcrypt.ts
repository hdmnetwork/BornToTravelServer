import * as bcrypt from 'bcrypt';

/**
 * Encode un mot de passe brut en utilisant le hachage bcrypt.
 * @param rawPassword - Le mot de passe brut à encoder.
 * @returns Le mot de passe encodé.
 */
export function encodePassword(rawPassword: string): string {
  const SALT: string = bcrypt.genSaltSync();
  return bcrypt.hashSync(rawPassword, SALT);
}

/**
 * Compare un mot de passe brut avec un mot de passe haché pour vérifier s'ils correspondent.
 * @param rawPassword - Le mot de passe brut à comparer.
 * @param hashedPassword - Le mot de passe haché à comparer.
 * @returns Vrai si les mots de passe correspondent, sinon faux.
 */
// Private a voir!
export function decodePassword(
  rawPassword: string,
  hashedPassword: string,
): boolean{
  return bcrypt.compareSync(rawPassword, hashedPassword)
}

/**
 * Compare un mot de passe brut avec un mot de passe haché de manière asynchrone pour vérifier s'ils correspondent.
 * @param plainPassword - Le mot de passe brut à comparer.
 * @param hashedPassword - Le mot de passe haché à comparer.
 * @returns Une promesse résolue avec vrai si les mots de passe correspondent, sinon faux.
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
