import { FindOperator } from "typeorm";

export type CreateCategoryParams = {
  name: string;
};

export type UpdateCategoryParams = {
  name: string;
};

/*
* Pour la module User
*/

/*
* Utilisable dans le cas ou le ID est number ou on doit chercher l'id dans la base de donénes: users.service.ts : line 122
*/
export type UserIdOrFindOperatorParam = {
  id: number | FindOperator<number>;
};


export type UserEmailParam = {
  email: string | FindOperator<string>;
}

export type CreateUserParams = {
  firstname: string;
  lastname: string;
  pseudo: string;
  password: string;
  email: string;
  isElectricCar: boolean; 
};

export type UpdateUserParams = {
  firstname: string;
  lastname: string;
  pseudo: string;
  password: string;
  email: string;
  isElectricCar: boolean; 

};

// Place
export type CreatePlaceParams = {
  name?: string;
  localite?: string;
  categorieApi?: string;
  categorie?: string;
  telephone?: string;
  adresse?: string;
  geolocalisation?: number[];
};

export type CreateTransportParams = {
    host: string;
    user: string;
    pass: string;
}
