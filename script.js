// Datos iniciales (simulación de una base de datos)
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
let doctores = JSON.parse(localStorage.getItem("doctores")) || [];
let recetas = JSON.parse(localStorage.getItem("recetas")) || [];

// Función para guardar datos en localStorage
function guardarDatos() {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("pacientes", JSON.stringify(pacientes));
    localStorage.setItem("doctores", JSON.stringify(doctores));
    localStorage.setItem("recetas", JSON.stringify(recetas));
}

// Borrar datos al cerrar el navegador
window.addEventListener("beforeunload", function () {
    localStorage.removeItem("usuarios");
    localStorage.removeItem("pacientes");
    localStorage.removeItem("doctores");
    localStorage.removeItem("recetas");
});

// Mostrar/ocultar secciones de registro y login
document.getElementById("show-register").addEventListener("click", function () {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("register-section").classList.remove("hidden");
});

document.getElementById("show-login").addEventListener("click", function () {
    document.getElementById("register-section").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
});

// Mostrar campo de especialidad solo para doctores
document.getElementById("register-role").addEventListener("change", function () {
    const especialidadField = document.getElementById("especialidad-field");
    if (this.value === "doctor") {
        especialidadField.classList.remove("hidden");
    } else {
        especialidadField.classList.add("hidden");
    }
});

// Registro de usuarios
document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const role = document.getElementById("register-role").value;
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const especialidad = role === "doctor" ? document.getElementById("especialidad").value : null;

    // Verificar si el usuario ya existe
    const usuarioExistente = usuarios.find(u => u.username === username);
    if (usuarioExistente) {
        alert("El usuario ya existe.");
        return;
    }

    // Registrar nuevo usuario
    usuarios.push({ role, username, password, especialidad });
    if (role === "doctor") {
        doctores.push({ username, especialidad });
    }
    guardarDatos();
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    document.getElementById("register-section").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
});

// Login
document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const role = document.getElementById("role").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Validar usuario y contraseña
    const usuario = usuarios.find(u => u.role === role && u.username === username && u.password === password);
    if (usuario) {
        alert(`Bienvenido, ${username}`);
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById(`${role}-section`).classList.remove("hidden");
        document.getElementById("logout-btn").classList.remove("hidden");
        if (role === "doctor") {
            cargarPacientes();
        } else if (role === "secretaria") {
            cargarRecetas();
        } else if (role === "paciente") {
            verReceta();
        }
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
});

// Cerrar sesión
document.getElementById("logout-btn").addEventListener("click", function () {
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("paciente-section").classList.add("hidden");
    document.getElementById("doctor-section").classList.add("hidden");
    document.getElementById("secretaria-section").classList.add("hidden");
    document.getElementById("logout-btn").classList.add("hidden");
});

// Paciente: Enviar dolencias
document.getElementById("molestias-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const especialidad = document.getElementById("especialidad-paciente").value;
    const explicacion = document.getElementById("explicacion").value;
    const username = document.getElementById("username").value;

    // Asignar paciente a un doctor de la misma especialidad
    const doctor = doctores.find(d => d.especialidad === especialidad);
    if (doctor) {
        pacientes.push({ username, especialidad, explicacion, doctor: doctor.username });
        guardarDatos();
        alert("Tus dolencias han sido enviadas. Un doctor te asignará una receta.");
    } else {
        alert("No hay doctores disponibles para esta especialidad.");
    }
});

// Doctor: Cargar pacientes
function cargarPacientes() {
    const listaPacientes = document.getElementById("lista-pacientes");
    const doctorUsername = document.getElementById("username").value;
    const doctorEspecialidad = doctores.find(d => d.username === doctorUsername).especialidad;
    const pacientesDoctor = pacientes.filter(p => p.especialidad === doctorEspecialidad);

    listaPacientes.innerHTML = pacientesDoctor.map(p => `
        <div class="paciente-info">
            <strong>Paciente:</strong> ${p.username}<br>
            <strong>Dolencias:</strong> ${p.explicacion}<br>
            <button onclick="mostrarFormularioReceta('${p.username}')">Recetar</button>
        </div>
    `).join("");
}

// Doctor: Mostrar formulario de receta
function mostrarFormularioReceta(pacienteUsername) {
    document.getElementById("receta-form").classList.remove("hidden");
    document.getElementById("receta-form").onsubmit = function (e) {
        e.preventDefault();
        const receta = document.getElementById("receta").value;
        const doctorUsername = document.getElementById("username").value;
        recetas.push({ paciente: pacienteUsername, receta, doctor: doctorUsername });
        guardarDatos();
        alert("Receta enviada a la secretaria.");
        document.getElementById("receta-form").classList.add("hidden");
    };
}

// Secretaria: Cargar recetas
function cargarRecetas() {
    const listaRecetas = document.getElementById("lista-recetas");
    listaRecetas.innerHTML = recetas.map(r => `
        <div class="receta-info">
            <strong>Paciente:</strong> ${r.paciente}<br>
            <strong>Doctor:</strong> ${r.doctor}<br>
            <strong>Receta:</strong> ${r.receta}<br>
        </div>
    `).join("");
}

// Paciente: Ver receta
function verReceta() {
    const pacienteUsername = document.getElementById("username").value;
    const recetaPaciente = recetas.find(r => r.paciente === pacienteUsername);
    if (recetaPaciente) {
        document.getElementById("receta-paciente").classList.remove("hidden");
        document.getElementById("receta-texto").textContent = recetaPaciente.receta;
    } else {
        document.getElementById("receta-paciente").classList.add("hidden");
    }
}