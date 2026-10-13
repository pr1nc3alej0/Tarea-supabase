import { supabase } from "../Lib/supabase";

export class AuthService {
async registrar(email: string, password: string) {
const { data, error } = await supabase.auth.signUp({
email: email,
password: password,
});


if (error) {
  throw new Error(error.message);
}

return data;


}

async iniciarSesion(email: string, password: string) {
const { data, error } = await supabase.auth.signInWithPassword({
email: email,
password: password,
});


if (error) {
  throw new Error(error.message);
}

return data;


}

async cerrarSesion(): Promise<void> {
const { error } = await supabase.auth.signOut();


if (error) {
  throw new Error(error.message);
}


}

async obtenerSesion() {
const { data, error } = await supabase.auth.getSession();


if (error) {
  throw new Error(error.message);
}

return data.session;


}
}
