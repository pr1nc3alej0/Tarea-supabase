import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { Libro } from "./src/models/Libro";
import { LibroService } from "./src/services/LibroService";
import { AuthService } from "./src/services/AuthService";
import { supabase } from "./src/Lib/supabase";

const libroService = new LibroService();
const authService = new AuthService();

export default function App() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [anio, setAnio] = useState("");
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sesionActiva, setSesionActiva] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(true);

  useEffect(() => {
    let activo = true;

    authService
      .obtenerSesion()
      .then((sesion) => {
        if (activo) {
          setSesionActiva(!!sesion);
        }
      })
      .catch((error) => {
        if (activo) {
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "No se pudo comprobar la sesión."
          );
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setSesionActiva(!!sesion);
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  const cargarLibros = async () => {
    try {
      setCargando(true);
      const datos = await libroService.obtenerLibros();
      setLibros(datos);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los libros."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (sesionActiva) {
      cargarLibros();
    } else {
      setLibros([]);
    }
  }, [sesionActiva]);

  const autenticar = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Atención", "Ingresa tu correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Atención",
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    try {
      setCargando(true);

      if (modoRegistro) {
        const resultado = await authService.registrar(
          email.trim(),
          password
        );

        if (!resultado.session) {
          Alert.alert(
            "Registro realizado",
            "Revisa tu correo para confirmar la cuenta y después inicia sesión."
          );
          setModoRegistro(false);
        } else {
          Alert.alert("Éxito", "Tu cuenta fue creada.");
        }
      } else {
        await authService.iniciarSesion(email.trim(), password);
        Alert.alert("Éxito", "Has iniciado sesión.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación."
      );
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      setCargando(true);
      await authService.cerrarSesion();
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la sesión."
      );
    } finally {
      setCargando(false);
    }
  };

  const agregarLibro = async () => {
    if (!titulo.trim() || !autor.trim() || !anio.trim()) {
      Alert.alert("Atención", "Completa todos los campos.");
      return;
    }

    const anioNumero = Number(anio);

    if (!Number.isInteger(anioNumero) || anioNumero <= 0) {
      Alert.alert("Atención", "Escribe un año válido.");
      return;
    }

    try {
      setCargando(true);

      const nuevoLibro = new Libro(
        0,
        titulo.trim(),
        autor.trim(),
        anioNumero
      );

      await libroService.agregarLibro(nuevoLibro);

      setTitulo("");
      setAutor("");
      setAnio("");

      await cargarLibros();

      Alert.alert("Éxito", "El libro se guardó correctamente.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo guardar el libro."
      );
    } finally {
      setCargando(false);
    }
  };

  const eliminarLibro = async (id: number) => {
    try {
      setCargando(true);

      await libroService.eliminarLibro(id);
      await cargarLibros();

      Alert.alert("Éxito", "El libro se eliminó correctamente.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el libro."
      );
    } finally {
      setCargando(false);
    }
  };

  if (!sesionActiva) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Mis Libros</Text>

        <Text style={styles.subtitulo}>
          {modoRegistro ? "Crear cuenta" : "Iniciar sesión"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Button
          title={
            cargando
              ? "Procesando..."
              : modoRegistro
                ? "Registrarme"
                : "Iniciar sesión"
          }
          onPress={autenticar}
          disabled={cargando}
        />

        <View style={styles.espacio}>
          <Button
            title={
              modoRegistro
                ? "Ya tengo una cuenta"
                : "Crear una cuenta nueva"
            }
            onPress={() => setModoRegistro(!modoRegistro)}
            disabled={cargando}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi Biblioteca</Text>

      <View style={styles.espacio}>
        <Button
          title="Cerrar sesión"
          onPress={cerrarSesion}
          disabled={cargando}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre del libro"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={styles.input}
        placeholder="Escritor"
        value={autor}
        onChangeText={setAutor}
      />

      <TextInput
        style={styles.input}
        placeholder="Año de publicación"
        value={anio}
        onChangeText={setAnio}
        keyboardType="numeric"
      />

      <Button
        title={cargando ? "Procesando..." : "Añadir libro"}
        onPress={agregarLibro}
        disabled={cargando}
      />

      <Text style={styles.subtitulo}>Libros registrados</Text>

      {cargando && libros.length === 0 ? (
        <Text>Cargando libros...</Text>
      ) : (
        <FlatList
          data={libros}
          keyExtractor={(item) => item.getId().toString()}
          ListEmptyComponent={
            <Text>No hay libros registrados.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.libro}>
              <Text style={styles.nombre}>
                {item.obtenerTitulo()}
              </Text>

              <Text>Escritor: {item.obtenerAutor()}</Text>
              <Text>Publicado: {item.obtenerAnio()}</Text>

              <Button
                title="Quitar libro"
                onPress={() => eliminarLibro(item.getId())}
                disabled={cargando}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  subtitulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  libro: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  espacio: {
    marginBottom: 15,
  },
});