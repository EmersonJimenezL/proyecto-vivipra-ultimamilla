const pool = new Pool({
  user: "",
  host: "",
  database: "",
  password: "",
  port: "",
});

// ahora exportamos la constante pool para que pueda ser utilizada en otros archivos
module.exports = pool;
