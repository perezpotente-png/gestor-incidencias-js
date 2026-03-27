document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formIncidencia");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = document.getElementById("titulo").value;
      const descripcion = document.getElementById("descripcion").value;
      const email = document.getElementById("email").value;

      try {
        const response = await fetch("http://localhost:3000/api/incidencias/public", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ titulo, descripcion, email })
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        alert("Incidencia creada correctamente");

        form.reset();

        // 🔥 RECARGAR INCIDENCIAS
        if (typeof cargarIncidencias === "function") {
          cargarIncidencias();
        }

      } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor");
      }
    });
  }

});