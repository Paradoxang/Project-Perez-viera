/* Pérez Viera Asesores — propuesta de Dox (31-10-2026). Código propio.
   El movimiento del canon (DESIGN.md) adaptado: titular que sube palabra a palabra, títulos que se descubren, barra que
   se vuelve sólida, paralaje, seguros por pestañas, bloque fijo que cambia a mitad de camino y foco de luz en el mapa.
   Es el mismo archivo para todas las páginas: cada pieza solo corre si la página la tiene.
   Con «reducir movimiento» no se mueve nada y todo se ve desde el principio. */
(function () {
  "use strict";

  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WHATSAPP = "573156123453"; // línea comercial de su web (315 612 3453): confirmarla con ella

  /* ---- Titular: cada palabra en su máscara, con su retraso ---- */
  var titular = document.querySelector("[data-palabras]");
  if (titular) {
    var cuenta = 0;
    var partir = function (nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (hijo) {
        if (hijo.nodeType === 3) {
          var trozo = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach(function (pedazo) {
            if (!pedazo) return;
            if (/^\s+$/.test(pedazo)) {
              trozo.appendChild(document.createTextNode(" "));
              return;
            }
            var caja = document.createElement("span");
            caja.className = "palabra";
            var dentro = document.createElement("span");
            dentro.style.setProperty("--i", cuenta++);
            dentro.textContent = pedazo;
            caja.appendChild(dentro);
            trozo.appendChild(caja);
          });
          nodo.replaceChild(trozo, hijo);
        } else if (hijo.nodeType === 1) {
          partir(hijo);
        }
      });
    };
    titular.setAttribute("aria-label", titular.textContent.trim());
    partir(titular);
    var portada = titular.closest(".portada");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        portada.classList.add("lista");
      });
    });
  }

  /* ---- Barra: transparente arriba, sólida al bajar; menú del celular ---- */
  var barra = document.getElementById("barra");
  var revisarBarra = function () {
    barra.classList.toggle("solida", window.scrollY > 40 || barra.classList.contains("abierta"));
  };
  var botonMenu = barra.querySelector(".menu-boton");
  var menuMovil = document.getElementById("menuMovil");
  if (botonMenu && menuMovil) {
    botonMenu.addEventListener("click", function () {
      var abrir = botonMenu.getAttribute("aria-expanded") !== "true";
      botonMenu.setAttribute("aria-expanded", String(abrir));
      botonMenu.setAttribute("aria-label", abrir ? "Cerrar el menú" : "Abrir el menú");
      menuMovil.hidden = !abrir;
      barra.classList.toggle("abierta", abrir);
      revisarBarra();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menuMovil.hidden) {
        botonMenu.click();
        botonMenu.focus();
      }
    });
  }

  /* ---- Secciones que se revelan al llegar ---- */
  var revelar = document.querySelectorAll("[data-revelar]");
  if (quieto || !("IntersectionObserver" in window)) {
    revelar.forEach(function (s) {
      s.classList.add("visto");
    });
  } else {
    var vigia = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visto");
            vigia.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revelar.forEach(function (s) {
      vigia.observe(s);
    });
  }

  /* ---- Seguros por pestañas (portada) ---- */
  var SEGUROS = [
    {
      nivel: "01 · Personal · Vida",
      titulo: "Seguro de vida",
      texto: "Protección que lo cuida hoy a usted y a su familia, y le brinda tranquilidad para el mañana.",
      imagen: "img/vida.webp",
      pagina: "seguro-de-vida.html",
    },
    {
      nivel: "02 · Personal · Salud",
      titulo: "Salud y medicina prepagada",
      texto:
        "Planes de salud y medicina prepagada para cuidar su bienestar y el de su familia, con atención oportuna.",
      imagen: "img/salud.webp",
      pagina: "seguro-de-salud.html",
    },
    {
      nivel: "03 · Patrimonial · Autos",
      titulo: "Seguro de autos",
      texto:
        "Soluciones de protección para sus vehículos. Le acompañamos en la elección del plan que mejor se adapte a usted.",
      imagen: "img/autos.webp",
      pagina: "seguro-de-autos.html",
    },
    {
      nivel: "04 · Patrimonial · Hogar",
      titulo: "Seguro de hogar",
      texto: "Su hogar representa seguridad y estabilidad para su familia. Lo protegemos con un plan a su medida.",
      imagen: "img/hogar.webp",
      pagina: "seguro-de-hogar.html",
    },
    {
      nivel: "05 · Patrimonial · Empresas",
      titulo: "Seguro para empresas",
      texto:
        "Protección integral para la operación, los activos y la continuidad de su empresa ante riesgos patrimoniales.",
      imagen: "img/empresas.webp",
      pagina: "seguro-de-empresas.html",
    },
  ];
  var ficha = document.getElementById("ficha");
  var numeral = document.querySelector(".numeral");
  var principal = document.getElementById("pilaPrincipal");
  if (ficha && numeral && principal) {
    document.querySelectorAll(".pastilla").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var n = +boton.dataset.seguro;
        var s = SEGUROS[n];
        document.querySelectorAll(".pastilla").forEach(function (b) {
          b.setAttribute("aria-selected", String(b === boton));
        });
        var poner = function () {
          document.getElementById("fichaNivel").textContent = s.nivel;
          document.getElementById("fichaTitulo").textContent = s.titulo;
          document.getElementById("fichaTexto").textContent = s.texto;
          document.getElementById("fichaCuenta").textContent = "0" + (n + 1) + " / 05";
          document.getElementById("fichaEnlace").href = s.pagina;
          numeral.textContent = "0" + (n + 1);
          principal.src = s.imagen;
          ficha.classList.remove("cambiando");
          principal.style.opacity = "1";
        };
        if (quieto) {
          poner();
          return;
        }
        ficha.classList.add("cambiando");
        principal.style.opacity = "0";
        setTimeout(poner, 320);
      });
    });
  }

  /* ---- Cotizador: abre WhatsApp con el mensaje escrito, solo con la autorización de datos ---- */
  var formulario = document.getElementById("cotizador");
  if (formulario) {
    var campoSeguro = document.getElementById("campoSeguro");
    var campoNombre = document.getElementById("campoNombre");
    var campoCelular = document.getElementById("campoCelular");
    var aviso = document.getElementById("avisoCotizador");
    document.addEventListener("click", function (e) {
      var enlace = e.target.closest("[data-seguro-cotizar]");
      if (!enlace) return;
      campoSeguro.value = enlace.dataset.seguroCotizar;
      setTimeout(function () {
        campoNombre.focus({ preventScroll: true });
      }, quieto ? 0 : 600);
    });
    formulario.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = campoNombre.value.trim();
      var celular = campoCelular.value.replace(/\D/g, "");
      if (!nombre) {
        aviso.textContent = "Escriba su nombre, por favor.";
        campoNombre.focus();
        return;
      }
      if (!/^3\d{9}$/.test(celular)) {
        aviso.textContent = "Escriba un celular de 10 dígitos que empiece por 3.";
        campoCelular.focus();
        return;
      }
      if (!document.getElementById("campoPermiso").checked) {
        aviso.textContent = "Para escribirle, necesitamos su autorización de datos.";
        document.getElementById("campoPermiso").focus();
        return;
      }
      var texto =
        "Hola, soy " + nombre + ". Quiero cotizar un seguro de " + campoSeguro.value.toLowerCase() +
        ". Mi celular es " + celular + ".";
      aviso.textContent = "Abriendo WhatsApp con su mensaje…";
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    });
  }

  /* ---- Acompañamiento: bloque fijo que cambia de panel pasada la mitad (portada) ---- */
  var acompana = document.querySelector(".acompana");
  var enB = false;
  var revisarAcompana = function () {
    if (!acompana || window.innerWidth <= 1000) return;
    var caja = acompana.getBoundingClientRect();
    var recorrido = caja.height - window.innerHeight;
    var avance = recorrido > 0 ? Math.min(1, Math.max(0, -caja.top / recorrido)) : 0;
    var ahora = avance > 0.5;
    if (ahora === enB) return;
    enB = ahora;
    document.getElementById("panelA").classList.toggle("activo", !enB);
    document.getElementById("panelB").classList.toggle("activo", enB);
    document.getElementById("imagenA").style.opacity = enB ? "0" : "1";
    document.getElementById("imagenB").style.opacity = enB ? "1" : "0";
    document.getElementById("progreso0").classList.toggle("activo", !enB);
    document.getElementById("progreso1").classList.toggle("activo", enB);
  };

  /* ---- Paralaje suave, con tope: lejos de la pantalla no se desplaza más de 60 px ---- */
  var TOPE = 60;
  var flotan = document.querySelectorAll("[data-paralaje]");
  var revisarParalaje = function () {
    if (quieto) return;
    var medio = window.innerHeight / 2;
    flotan.forEach(function (el) {
      var caja = el.getBoundingClientRect();
      var centro = caja.top + caja.height / 2;
      var d = (centro - medio) * parseFloat(el.dataset.paralaje);
      el.style.setProperty("--desplazar", Math.max(-TOPE, Math.min(TOPE, d)).toFixed(1) + "px");
    });
  };

  var pendiente = false;
  var alBajar = function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      pendiente = false;
      revisarBarra();
      revisarAcompana();
      revisarParalaje();
    });
  };
  window.addEventListener("scroll", alBajar, { passive: true });
  window.addEventListener("resize", alBajar);
  alBajar();

  /* ---- Mapa: el foco de luz sigue al cursor (en táctil, se pasea solo) ---- */
  var mapa = document.getElementById("mapa");
  if (mapa) {
    var luz = mapa.querySelector(".mapa-luz");
    var mover = function (x, y) {
      luz.style.setProperty("--mx", x + "%");
      luz.style.setProperty("--my", y + "%");
    };
    mapa.addEventListener("mousemove", function (e) {
      var caja = mapa.getBoundingClientRect();
      mover(((e.clientX - caja.left) / caja.width) * 100, ((e.clientY - caja.top) / caja.height) * 100);
    });
    if (window.matchMedia("(hover: none)").matches && !quieto) {
      var t = 0;
      var pasear = function () {
        t += 0.012;
        mover(52 + Math.cos(t) * 24, 46 + Math.sin(t * 1.3) * 20);
        requestAnimationFrame(pasear);
      };
      requestAnimationFrame(pasear);
    }
  }
})();
