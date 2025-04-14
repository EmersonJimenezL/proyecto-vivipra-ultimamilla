// La constante express es una función que crea una aplicación Express
// esto quiere decir que express es una función que retorna una función
// que es la que se encarga de crear el servidor
const express = require("express");

// La constante cors es un middleware que permite habilitar CORS en la aplicación
// esto quiere decir que cors es una función que retorna otra función
// la funcion que retorna cors es la que se encarga de habilitar CORS
// CORS, es un mecanismo que permite restringir el acceso a recursos de un servidor
// desde un dominio diferente al del servidor, esto se puede configurar a gusto
const cors = require("cors");

// la constante app es la aplicación express que se va a crear
// esto quiere decir que app es una función que retorna otra función
// la funcion que retorna se encarga de crear el servidor
// y de manejar las peticiones que llegan al servidor
const app = express();

// la constante PORT es el puerto en el que se va a ejecutar el servidor
// esto quiere decir que PORT es una variable que almacena un número
const PORT = 3000;

// app.use(cors()) es un middleware que habilita CORS en la aplicación
// esto quiere decir que app.use(cors()) es una función que retorna otra función
// la cual se encarga de habilitar CORS en la aplicación
// esto es necesario para que la aplicación pueda recibir peticiones de otros dominios
app.use(cors());

// app.use(express.json()) es un middleware que permite parsear el cuerpo de las peticiones
// esto quiere decir que app.use(express.json()) es una función que retorna otra función
// la cual se encarga de parsear el cuerpo de las peticiones
// esto es necesario para que la aplicación pueda recibir peticiones con cuerpo en formato JSON
app.use(express.json());

// app.listener es es un middleware que permite manejar las peticiones que llegan al servidor
// esto quiere decir que app.listener es una función que retorna otra función
// la cual se encarga de manejar las peticiones que llegan al servidor
// esto es necesario para que la aplicación pueda recibir peticiones y responderlas
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// este archivo levanta e backend de nuestra aplicacion para que pueda ser utilizado por el frontend
// este archivo es el que se encarga de crear el la conexion con elservidor y manejar las peticiones que llegan al servidor
