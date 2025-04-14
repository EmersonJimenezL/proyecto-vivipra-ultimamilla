// la constante pool es una instancia de la clase Pool de la libreria pg
// esto quiere decir que pool es una variable que almacena una instancia de la clase Pool
const { Pool } = require("pg");

// en este punto, la constante pool es una instancia de la clase Pool
// la cual se encarga de manejar la conexion a la base de datos
// en esta parte inicializamos la constante pool con los datos de la base de datos
// esto quiere decir que pool es una variable que almacena una instancia de la clase Pool
// la cual se encarga de manejar la conexion a la base de datos
// esto es necesario para que la aplicacion pueda conectarse a la base de datos
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "vivipra_db",
  password: "##vivipra.2025",
  port: 5432,
});

// ahora exportamos la constante pool para que pueda ser utilizada en otros archivos
module.exports = pool;
