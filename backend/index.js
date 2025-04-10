const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando");
});

// 🚀 Ruta de login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Simulación de usuario válido (esto después se reemplaza por base de datos)
  const userDemo = {
    email: "usuario@demo.com",
    password: "123456",
  };

  if (email === userDemo.email && password === userDemo.password) {
    res.status(200).json({ message: "Login exitoso", token: "fake-jwt-token" });
  } else {
    res.status(401).json({ message: "Credenciales inválidas" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
