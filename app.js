document.addEventListener('DOMContentLoaded', () => {
    // ================= BASE DE DATOS: TODA COLOMBIA (API OFICIAL) =================
    const listaCiudades = document.getElementById('lista-ciudades');

    async function cargarCiudadesColombia() {
        try {
            // 1. Nos conectamos a la API del gobierno (límite 1200 para traer todos los municipios)
            const respuesta = await fetch('https://www.datos.gov.co/resource/xdk5-pm3f.json?$select=departamento,municipio&$limit=1200');
            const datos = await respuesta.json();
            
            // 2. Ordenamos las ciudades alfabéticamente para mayor orden
            datos.sort((a, b) => a.municipio.localeCompare(b.municipio));

            // 3. Inyectamos los más de 1,100 municipios en la lista oculta
            datos.forEach(lugar => {
                const opcion = document.createElement('option');
                // El formato visual será "Ciudad, Departamento"
                opcion.value = `${lugar.municipio}, ${lugar.departamento}`;
                listaCiudades.appendChild(opcion);
            });
            
        } catch (error) {
            console.error("No se pudieron cargar las ciudades:", error);
            // Fallback: Si el usuario no tiene buen internet, cargamos algunas por defecto
            if (listaCiudades) {
                listaCiudades.innerHTML = `
                    <option value="Miranda, Cauca">
                    <option value="Bogotá, Cundinamarca">
                    <option value="Medellín, Antioquia">
                    <option value="Cali, Valle del Cauca">
                    <option value="Cartagena, Bolívar">
                `;
            }
        }
    }

    // Ejecutamos la magia apenas carga el archivo
    cargarCiudadesColombia();
    // ================= 1. MENÚ HAMBURGUESA (MÓVILES) =================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ================= 2. CONTROL DE FECHAS MÍNIMAS =================
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    if (checkinInput && checkoutInput) {
        const today = new Date().toISOString().split('T')[0];
        checkinInput.setAttribute('min', today);

        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            checkinDate.setDate(checkinDate.getDate() + 1);
            
            const minCheckout = checkinDate.toISOString().split('T')[0];
            checkoutInput.setAttribute('min', minCheckout);
            
            if(checkoutInput.value && checkoutInput.value < minCheckout) {
                checkoutInput.value = minCheckout;
            }
        });
    }
// ================= LÓGICA DE HUÉSPEDES AVANZADA =================
    const btnHuespedes = document.getElementById('btn-huespedes');
    const panelHuespedes = document.getElementById('panel-huespedes');
    const btnCerrarPanel = document.getElementById('btn-cerrar-panel');
    const textoHuespedes = document.getElementById('texto-huespedes');
    
    // Contadores
    window.valAdultos = 2; // Usamos window para poder usarlo luego en WhatsApp
    window.valNinos = 0;

    // Mostrar / Ocultar panel
    if (btnHuespedes && panelHuespedes) {
        btnHuespedes.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que se cierre instantáneamente
            panelHuespedes.classList.toggle('mostrar');
        });

        btnCerrarPanel.addEventListener('click', (e) => {
            e.stopPropagation();
            panelHuespedes.classList.remove('mostrar');
        });

        // Si hacen click dentro del panel, que no se cierre
        panelHuespedes.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Si hacen click en cualquier otro lado de la página, se cierra
        document.addEventListener('click', () => {
            panelHuespedes.classList.remove('mostrar');
        });
    }

    // Actualizar texto
    function actualizarTexto() {
        document.getElementById('cant-adultos').innerText = window.valAdultos;
        document.getElementById('cant-ninos').innerText = window.valNinos;
        
        let txt = `${window.valAdultos} ${window.valAdultos === 1 ? 'adulto' : 'adultos'}`;
        if(window.valNinos > 0) {
            txt += `, ${window.valNinos} ${window.valNinos === 1 ? 'niño' : 'niños'}`;
        }
        textoHuespedes.innerText = txt;
    }

    // Funcionalidad botones + y -
    document.getElementById('sumar-adultos').addEventListener('click', () => { 
        if(window.valAdultos < 10) { window.valAdultos++; actualizarTexto(); }
    });
    document.getElementById('restar-adultos').addEventListener('click', () => { 
        if(window.valAdultos > 1) { window.valAdultos--; actualizarTexto(); }
    });
    document.getElementById('sumar-ninos').addEventListener('click', () => { 
        if(window.valNinos < 5) { window.valNinos++; actualizarTexto(); }
    });
    document.getElementById('restar-ninos').addEventListener('click', () => { 
        if(window.valNinos > 0) { window.valNinos--; actualizarTexto(); }
    });
    // ================= 3. CALCULADORA DE PRECIOS Y NOCHES =================
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const llegada = new Date(checkinInput.value);
            const salida = new Date(checkoutInput.value);

            const diferenciaTiempo = salida.getTime() - llegada.getTime();
            const totalNoches = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

            if (totalNoches > 0) {
                const etiquetasTotal = document.querySelectorAll('.total-estadia');

                etiquetasTotal.forEach(etiqueta => {
                    const precioBase = parseInt(etiqueta.getAttribute('data-base'));
                    const precioTotalCalculado = precioBase * totalNoches;

                    const precioFormateado = new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0
                    }).format(precioTotalCalculado);

                    etiqueta.innerHTML = `✨ Total por ${totalNoches} ${totalNoches === 1 ? 'noche' : 'noches'}: <strong>${precioFormateado} COP</strong>`;
                    etiqueta.classList.add('activo');
                });

                const sectionHabitaciones = document.getElementById('habitaciones');
                if (sectionHabitaciones) {
                    sectionHabitaciones.scrollIntoView({ behavior: 'smooth' });
                }

            } else {
                alert("Por favor, selecciona fechas válidas.");
            }
        });
    }

    // ================= 4. ANIMACIÓN AL HACER SCROLL =================
    const elementosAnimados = document.querySelectorAll('.fade-in-scroll');

    const opciones = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Bajamos el umbral para que se activen más rápido al asomarse
    };

    const observador = new Intersection; Observer((entradas, observador) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('is-visible');
                observador.unobserve(entrada.target); 
            }
        });
    }, opciones);

    elementosAnimados.forEach(elemento => {
        observador.observe(elemento);
    });

});
// ================= CONEXIÓN DE RESERVAS A WHATSAPP =================
    const botonesReserva = document.querySelectorAll('.btn-reserva-directa');

    botonesReserva.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault(); // Evita que la página salte hacia arriba al dar clic

            // 1. Capturamos los datos de la NUEVA Barra Premium
            const selectUbicacion = document.getElementById('ubicacion');
            const ubicacionSeleccionada = selectUbicacion ? selectUbicacion.value : "";
            
            const fechaLlegada = document.getElementById('checkin').value;
            const fechaSalida = document.getElementById('checkout').value;
            const nombreHabitacion = this.getAttribute('data-room');

            // 2. Tu número de WhatsApp (Recuerda cambiar este número por el tuyo)
            const telefonoHotel = "573146083386"; 

            // 3. Validamos que el usuario haya llenado el buscador
            if (!ubicacionSeleccionada || !fechaLlegada || !fechaSalida) {
                alert("Por favor, selecciona tu Ubicación y las Fechas en el buscador primero para cotizar.");
                document.getElementById('inicio').scrollIntoView({ behavior: 'smooth' });
                return;
            }

            // 4. Formateamos el texto de los huéspedes usando las nuevas variables del panel
            let textoHuespedesWp = `${window.valAdultos} Adultos`;
            if (window.valNinos > 0) {
                textoHuespedesWp += ` y ${window.valNinos} Niños`;
            }

            // 5. Construimos el mensaje elegante
            const mensajeText = `✨ *Nueva Solicitud de Reserva* ✨\n\n` +
                                `📍 *Destino:* ${ubicacionSeleccionada}\n` +
                                `🏨 *Habitación:* ${nombreHabitacion}\n` +
                                `📅 *Llegada:* ${fechaLlegada}\n` +
                                `📅 *Salida:* ${fechaSalida}\n` +
                                `👥 *Huéspedes:* ${textoHuespedesWp}\n\n` +
                                `¿Me podrían confirmar disponibilidad y métodos de pago? ¡Muchas gracias!`;

            // 6. Codificamos el texto y abrimos WhatsApp
            const mensajeCodificado = encodeURIComponent(mensajeText);
            const urlWhatsApp = `https://api.whatsapp.com/send?phone=${telefonoHotel}&text=${mensajeCodificado}`;

            window.open(urlWhatsApp, '_blank');
        });
    });