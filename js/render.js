const API = "https://gestor-incidencias-js.onrender.com";

async function cargarIncidencias() {
  try {
    const response = await fetch(`${API}/api/incidencias`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    const incidencias = await response.json();

    const contenedor = document.getElementById("lista-incidencias");
    contenedor.innerHTML = "";

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    incidencias.forEach(inc => {
      const div = document.createElement("div");
      div.classList.add("incidencia");

      // 🧠 BOTONES DINÁMICOS (NO MOSTRAR EL ACTUAL)
      let botones = "";

      if (inc.estado !== "pendiente") {
        botones += `<button onclick="cambiarEstado(${inc.id}, 'pendiente')">Pendiente</button>`;
      }

      if (inc.estado !== "proceso") {
        botones += `<button onclick="cambiarEstado(${inc.id}, 'proceso')">Proceso</button>`;
      }

      if (inc.estado !== "resuelta") {
        botones += `<button onclick="cambiarEstado(${inc.id}, 'resuelta')">Resuelta</button>`;
      }

      // 🔒 SOLO ADMIN VE ELIMINAR
      if (usuario && usuario.rol === "admin") {
        botones += `<button onclick="eliminar(${inc.id})">Eliminar</button>`;
      }

      div.innerHTML = `
        <h4>${inc.titulo}</h4>
        <p>${inc.descripcion}</p>
        <span class="estado ${inc.estado}">${inc.estado}</span>
        <div class="botones">${botones}</div>
      `;

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("Error cargando incidencias:", error);
  }
}