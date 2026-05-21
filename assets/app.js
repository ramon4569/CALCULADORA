// ===============================================
// QUISQUEYA PAYROLL - Validacion de empleados
// ===============================================

// Algoritmo oficial JCE para validar cedula dominicana
const validarCedulaRD = (cedula) => {
  const clean = cedula.replace(/[-\s]/g, '');
  if (!/^\d{11}$/.test(clean)) return false;
  
  const mult = [1,2,1,2,1,2,1,2,1,2];
  let suma = 0;
  
  for (let i = 0; i < 10; i++) {
    let p = parseInt(clean[i]) * mult[i];
    if (p >= 10) p = Math.floor(p/10) + (p%10);
    suma += p;
  }
  
  const digEsp = (10 - (suma % 10)) % 10;
  return digEsp === parseInt(clean[10]);
};

// Validar email
const validarEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Validar telefono RD (809, 829, 849)
const validarTelefonoRD = (t) => /^(809|829|849)-?\d{3}-?\d{4}$/.test(t);

// Probar en consola con la consola del navegador (F12):
console.log(validarCedulaRD('402-1234567-8')); // true
console.log(validarCedulaRD('001-0001000-1')); // false
console.log(validarEmail('maria@empresa.com')); // true
console.log(validarTelefonoRD('809-555-1234')); // true

// ===============================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ===============================================
const form       = document.getElementById('formEmpleado');
const inpNombre  = document.getElementById('nombre');
const inpCedula  = document.getElementById('cedula');
const inpEmail   = document.getElementById('email');
const inpTel     = document.getElementById('telefono');
const inpSalario = document.getElementById('salario');

// Helper: marca un input como valido/invalido y muestra mensaje
const marcar = (input, errId, ok, mensaje = '') => {
  input.classList.remove('valido', 'invalido');
  const err = document.getElementById(errId);
  if (input.value.trim() === '') {
    err.textContent = '';
    return;
  }
  if (ok) {
    input.classList.add('valido');
    err.textContent = '';
  } else {
    input.classList.add('invalido');
    err.textContent = mensaje;
  }
};

// NOMBRE - valida en tiempo real (input)
inpNombre.addEventListener('input', (e) => {
  const v = e.target.value.trim();
  if (v.length < 3) return marcar(inpNombre, 'errNombre', false, 'Minimo 3 caracteres');
  if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(v)) return marcar(inpNombre, 'errNombre', false, 'Solo letras y espacios');
  marcar(inpNombre, 'errNombre', true);
});

// CEDULA - valida en tiempo real
inpCedula.addEventListener('input', (e) => {
  const v = e.target.value;
  marcar(inpCedula, 'errCedula', validarCedulaRD(v), 'Cedula invalida segun JCE');
});

// EMAIL - valida al perder foco (blur)
inpEmail.addEventListener('blur', (e) => {
  const v = e.target.value.trim();
  marcar(inpEmail, 'errEmail', validarEmail(v), 'Formato de email invalido');
});

// TELEFONO - valida al perder foco
inpTel.addEventListener('blur', (e) => {
  const v = e.target.value.trim();
  marcar(inpTel, 'errTelefono', validarTelefonoRD(v), 'Formato: 809-555-1234');
});

// ===============================================
// CALCULADORA NOMINA RD 2026
// ===============================================
const TOPE_AFP = 464460;   // 4 SM cotizables
const TOPE_SFS = 232230;   // 10 SM cotizables (aprox)
const SM_MIN   = 23223;

const fmt = n => 'RD$ ' + n.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2});

const calcularNomina = (salario) => {
  const afp = Math.min(salario, TOPE_AFP) * 0.0287;
  const sfs = Math.min(salario, TOPE_SFS) * 0.0304;
  const neto = salario - afp - sfs;
  return { afp, sfs, neto };
};

// SALARIO - valida Y recalcula al instante
inpSalario.addEventListener('input', (e) => {
  const valor = Number(e.target.value) || 0;
  
  // 1. Validar
  if (e.target.value === '') {
    marcar(inpSalario, 'errSalario', true);
  } else if (valor < SM_MIN) {
    marcar(inpSalario, 'errSalario', false, `Minimo RD$ ${SM_MIN.toLocaleString()}`);
  } else if (valor > 10000000) {
    marcar(inpSalario, 'errSalario', false, 'Maximo RD$ 10,000,000');
  } else {
    marcar(inpSalario, 'errSalario', true);
  }
  
  // 2. Recalcular SIEMPRE (aunque sea invalido, mostramos el preview)
  const { afp, sfs, neto } = calcularNomina(valor);
  document.getElementById('resAFP').textContent  = fmt(afp);
  document.getElementById('resSFS').textContent  = fmt(sfs);
  document.getElementById('resNeto').textContent = fmt(neto);
});

// ===============================================
// SUBMIT DEL FORMULARIO
// ===============================================
form.addEventListener('submit', (e) => {
  e.preventDefault(); // CRITICO: evita que se recargue la pagina
  
  // Obtener valores limpios
  const nombre   = inpNombre.value.trim();
  const cedula   = inpCedula.value.trim();
  const email    = inpEmail.value.trim();
  const telefono = inpTel.value.trim();
  const salario  = Number(inpSalario.value) || 0;
  
  // Validacion final de TODO
  const errores = [];
  if (nombre.length < 3) errores.push('Nombre invalido');
  if (!validarCedulaRD(cedula)) errores.push('Cedula invalida');
  if (!validarEmail(email)) errores.push('Email invalido');
  if (!validarTelefonoRD(telefono)) errores.push('Telefono invalido');
  if (salario < SM_MIN) errores.push('Salario muy bajo');
  
  if (errores.length > 0) {
    alert('❌ Corrige estos errores:\n\n' + errores.join('\n'));
    return;
  }
  
  // TODO OK - calcular neto y agregar a la tabla
  const { neto } = calcularNomina(salario);
  const tbody = document.getElementById('tbodyEmpleados');
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${nombre}</td>
    <td>${cedula}</td>
    <td>${email}</td>
    <td>${fmt(salario)}</td>
    <td>${fmt(neto)}</td>
  `;
  tbody.appendChild(fila);
  
  // Limpiar formulario
  form.reset();
  document.querySelectorAll('input').forEach(inp => inp.classList.remove('valido', 'invalido'));
  document.querySelectorAll('.err').forEach(s => s.textContent = '');
  document.getElementById('resAFP').textContent = 'RD$ 0.00';
  document.getElementById('resSFS').textContent = 'RD$ 0.00';
  document.getElementById('resNeto').textContent = 'RD$ 0.00';
  
  alert(`✓ Empleado ${nombre} guardado con exito!`);
});