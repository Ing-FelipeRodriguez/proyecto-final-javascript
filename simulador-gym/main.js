// Gimnasio Natural Human

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const historialInscripciones = [];

  Swal.fire({
    title: "¡Bienvenido a Natural Human!",
    text: "Comencemos tu inscripción",
    icon: "success",
    confirmButtonText: "¡Vamos!",
    confirmButtonColor: "#ff6f00",
    background: "#fff8f0",
    color: "#bf360c"
  }).then(() => {
    pedirDatos();
  });

  function pedirDatos() {
    Swal.fire({
      title: "Datos personales",
      html: `
        <input id="nombre" class="swal2-input" placeholder="Tu nombre">
        <input id="edad" class="swal2-input" type="number" placeholder="Tu edad">`,
      focusConfirm: false,
      confirmButtonText: "Continuar",
      confirmButtonColor: "#ff6f00",
      background: "#fff8f0",
      color: "#bf360c",
      preConfirm: () => {
        const nombre = document.getElementById("nombre").value.trim();
        const edad = parseInt(document.getElementById("edad").value);

        if (!nombre || isNaN(edad) || edad < 12) {
          Toastify({
            text: "Nombre válido y edad (mínimo 12) requerida ❌",
            duration: 3000,
            style: { background: "#d32f2f", color: "#fff" }
          }).showToast();
          return false;
        }

        return { nombre, edad };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { nombre, edad } = result.value;

        const titulo = document.createElement("h2");
        titulo.textContent = `¡Hola, ${nombre}! Edad: ${edad} años. Bienvenido/a al simulador de costos de inscripción del gimnasio.`;
        app.appendChild(titulo);

        fetch("actividades.json")
          .then(res => res.json())
          .then(data => mostrarFormulario(data, nombre))
          .catch(err => {
            console.error("Error al cargar actividades:", err);
            Toastify({
              text: "No se pudieron cargar las actividades",
              duration: 3000,
              style: { background: "#d32f2f", color: "#fff" }
            }).showToast();
          });
      }
    });
  }

  function mostrarFormulario(actividades, nombre) {
    const form = document.createElement("form");

    const select = document.createElement("select");
    select.id = "actividad";
    actividades.forEach(act => {
      const option = document.createElement("option");
      option.value = act.precio;
      option.textContent = `${act.nombre} - $${act.precio}/mes`;
      select.appendChild(option);
    });

    const inputMeses = document.createElement("input");
    inputMeses.type = "number";
    inputMeses.placeholder = "¿Cuántos meses querés pagar?";
    inputMeses.id = "meses";
    inputMeses.min = 1;

    const boton = document.createElement("button");
    boton.textContent = "Calcular total";
    boton.type = "submit";

    form.appendChild(select);
    form.appendChild(document.createElement("br"));
    form.appendChild(inputMeses);
    form.appendChild(document.createElement("br"));
    form.appendChild(boton);

    app.appendChild(form);

    // Contenedor para historial
    const contHistorial = document.createElement("div");
    contHistorial.id = "historial";
    contHistorial.style.marginTop = "30px";
    app.appendChild(contHistorial);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const precio = Number(select.value);
      const meses = Number(inputMeses.value);
      const actividadSeleccionada = select.options[select.selectedIndex].textContent;

      if (meses > 0) {
        const total = precio * meses;

        Swal.fire({
          title: "Elegí tu método de pago",
          input: "select",
          inputOptions: {
            efectivo: "Efectivo",
            tarjeta: "Tarjeta de crédito",
            debito: "Débito",
            mercadoPago: "Mercado Pago"
          },
          inputPlaceholder: "Seleccioná uno",
          confirmButtonText: "Confirmar",
          confirmButtonColor: "#ff6f00",
          background: "#fff8f0",
          color: "#bf360c",
          preConfirm: (metodo) => {
            if (!metodo) {
              Toastify({
                text: "Seleccioná un método de pago ❌",
                duration: 3000,
                style: { background: "#d32f2f", color: "#fff" }
              }).showToast();
              return false;
            }
            return metodo;
          }
        }).then(result => {
          if (result.isConfirmed) {
            const metodoPago = result.value;

            // Guardar inscripción
            const nuevaInscripcion = {
              nombre: nombre,
              actividad: actividadSeleccionada,
              meses: meses,
              total: total,
              metodoPago: metodoPago,
              fecha: new Date().toLocaleString()
            };

            historialInscripciones.push(nuevaInscripcion);
            localStorage.setItem("historialInscripciones", JSON.stringify(historialInscripciones));

            Swal.fire({
              title: "Resumen de inscripción",
              html: `
                <p><strong>Actividad:</strong> ${actividadSeleccionada}</p>
                <p><strong>Meses:</strong> ${meses}</p>
                <p><strong>Total:</strong> $${total}</p>
                <p><strong>Método de pago:</strong> ${metodoPago}</p>
              `,
              icon: "success",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#ff6f00",
              background: "#fff8f0",
              color: "#bf360c"
            });

            Toastify({
              text: "¡Inscripción registrada con éxito! 🎉",
              duration: 3000,
              style: { background: "#4caf50", color: "#fff" }
            }).showToast();

            mostrarHistorial();
            inputMeses.value = "";
          }
        });
      } else {
        Toastify({
          text: "Ingresá una cantidad válida de meses ❌",
          duration: 3000,
          style: { background: "#d32f2f", color: "#fff" }
        }).showToast();
      }
    });
  }

  function mostrarHistorial() {
    const contHistorial = document.getElementById("historial");
    contHistorial.innerHTML = "<h3>Historial de Inscripciones:</h3>";

    historialInscripciones.forEach((inscripcion) => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ff6f00";
      div.style.borderRadius = "8px";
      div.style.padding = "10px";
      div.style.marginTop = "8px";
      div.style.backgroundColor = "#fff8f0";
      div.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

      div.innerHTML = `
        <p><strong>Inscripción de ${inscripcion.nombre}</strong></p>
        <p><span style="font-weight: bold;">Actividad:</span> ${inscripcion.actividad}</p>
        <p><span style="font-weight: bold;">Meses:</span> ${inscripcion.meses}</p>
        <p><span style="font-weight: bold;">Total:</span> $${inscripcion.total}</p>
        <p><span style="font-weight: bold;">Método de pago:</span> ${inscripcion.metodoPago}</p>
        <p><span style="font-weight: bold;">Fecha:</span> ${inscripcion.fecha}</p>
      `;
      contHistorial.appendChild(div);
    });
  }
});
