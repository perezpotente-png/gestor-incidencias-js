const API = "https://gestor-incidencias-js.onrender.com";
// ==========================
// INICIO APP
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  cargarIncidencias();

  const lista = document.getElementById("lista-incidencias");
  if (lista) {
    lista.addEventListener("click", manejarClicksIncidencias);
  }

  document.addEventListener("click", manejarClicksGlobal);
});

// ==========================
// EVENTOS GLOBALES
// ==========================
function manejarClicksGlobal(e) {

  if (e.target.matches("#loginBtn")) {
    document.getElementById("loginBox").style.display = "block";
  }

  if (e.target.matches("#btn-login")) {
    login();
  }

  if (e.target.matches("#nav-dashboard")) {
    mostrarVista("dashboardView");
  }

  if (e.target.matches("#nav-incidencias")) {
    mostrarVista("incidenciasView");
    cargarIncidencias();
  }

  if (e.target.matches("#nav-estadisticas")) {
    mostrarVista("estadisticasView");
    cargarIncidencias();
  }
}

// ==========================
// EVENTOS INCIDENCIAS
// ==========================
function manejarClicksIncidencias(e) {
  const id = e.target.dataset.id;

  if (!id) return;

  if (e.target.classList.contains("btn-delete")) {
    eliminarIncidencia(id);
  }

  if (e.target.classList.contains("btn-proceso")) {
    cambiarEstado(id, "proceso");
  }

  if (e.target.classList.contains("btn-resuelta")) {
    cambiarEstado(id, "resuelta");
  }

  if (e.target.classList.contains("btn-pendiente")) {
    cambiarEstado(id, "pendiente");
  }
}

// ==========================
// LOGIN
// ==========================
async function login() {
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(API + "/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuario, password })
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      alert("Credenciales incorrectas");
      return;
    }

    localStorage.setItem("token", data.token);

    const userData = data.user || {
      usuario: data.usuario,
      rol: data.rol
    };

    localStorage.setItem("usuario", JSON.stringify(userData));

    document.getElementById("userStatus").innerText =
      "Logueado como " + (userData.usuario || "usuario");

    document.getElementById("loginBox").style.display = "none";

    cargarIncidencias();

  } catch (error) {
    console.error("Error login:", error);
    alert("Error de conexión");
  }
}

// ==========================
// ELIMINAR
// ==========================
async function eliminarIncidencia(id) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Debes iniciar sesión");
    return;
  }

  if (!confirm("¿Eliminar incidencia?")) return;

  const res = await fetch(API + "/api/incidencias/" + id, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  if (res.status === 401) {
    alert("Sesión expirada");
    localStorage.removeItem("token");
    return;
  }

  if (!res.ok) {
    alert("Error al eliminar");
    return;
  }

  cargarIncidencias();
}

// ==========================
// CAMBIAR ESTADO
// ==========================
async function cambiarEstado(id, estado) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Debes iniciar sesión");
    return;
  }

  const res = await fetch(API + "/api/incidencias/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ estado })
  });

  if (res.status === 401) {
    alert("Sesión expirada");
    localStorage.removeItem("token");
    return;
  }

  cargarIncidencias();
}

// ==========================
// CARGAR INCIDENCIAS
// ==========================
async function cargarIncidencias() {
  const token = localStorage.getItem("token");

  const url = token
    ? API + "/api/incidencias"
    : API + "/api/incidencias/public";

  const res = await fetch(url, {
    headers: token
      ? { "Authorization": "Bearer " + token }
      : {}
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    return;
  }

  const data = await res.json();

  let pendientes = 0;
  let proceso = 0;
  let resueltas = 0;

  data.forEach(i => {
    if (i.estado === "pendiente") pendientes++;
    if (i.estado === "proceso") proceso++;
    if (i.estado === "resuelta") resueltas++;
  });

  document.getElementById("pendientes").textContent = pendientes;
  document.getElementById("proceso").textContent = proceso;
  document.getElementById("resueltas").textContent = resueltas;

  document.getElementById("pendientes2").textContent = pendientes;
  document.getElementById("proceso2").textContent = proceso;
  document.getElementById("resueltas2").textContent = resueltas;

  const lista = document.getElementById("lista-incidencias");
  if (!lista) return;

  lista.innerHTML = "";

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  data.forEach(i => {
    const div = document.createElement("div");
    div.className = "incidencia";

    let botones = "";

    if (i.estado !== "pendiente") {
      botones += `<button class="btn-pendiente" data-id="${i.id}">Pendiente</button>`;
    }

    if (i.estado !== "proceso") {
      botones += `<button class="btn-proceso" data-id="${i.id}">Proceso</button>`;
    }

    if (i.estado !== "resuelta") {
      botones += `<button class="btn-resuelta" data-id="${i.id}">Resuelta</button>`;
    }

    if (usuario && usuario.rol === "admin") {
      botones += `<button class="btn-delete" data-id="${i.id}" style="background:red;color:white;">Eliminar</button>`;
    }

    div.innerHTML = `
      <strong>${i.titulo}</strong>
      <p>${i.descripcion}</p>
      <span class="estado ${i.estado}">${i.estado}</span>
      <div class="actions">${botones}</div>
    `;

    lista.appendChild(div);
  });
}

// ==========================
// CAMBIO DE VISTAS
// ==========================
function mostrarVista(id) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active-view");
  });

  document.getElementById(id).classList.add("active-view");
}

// ==========================
// CREAR INCIDENCIA (PROTEGIDO 🔐)
// ==========================
document.addEventListener("submit", async (e) => {

  if (e.target.matches("#formIncidencia")) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión");
      return;
    }

    try {
      const res = await fetch(API + "/api/incidencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ titulo, descripcion })
      });

      if (res.status === 401) {
        alert("Sesión expirada");
        localStorage.removeItem("token");
        return;
      }

      if (!res.ok) {
        alert("Error al crear incidencia");
        return;
      }

      alert("Incidencia creada correctamente");

      document.getElementById("formIncidencia").reset();

      mostrarVista("incidenciasView");
      cargarIncidencias();

    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  }

});