let dimHeadFooter = 0;

/**
 * Inicializa cuando se carga el documento
 */
$(document).ready(() => {
    dimHeadFooter = $('#cm-header').height() + $('#cm-footer').height();
    // Agrega la altura a la tabla
    $('#tbl-log-simulacion').scrollTable({'height': 300});
    actualizarHeightContent();
});

$(window).resize(() => {
    actualizarHeightContent();
});

function actualizarHeightContent() {
    let dimHeadFooterChat = $('#chatbot-header').height() + $('#chatbot-footer').height();
    let heightMainContent = $(window).height() - dimHeadFooterChat - dimHeadFooter - 16;
    $('#chatbot-content').css({
        'overflow': 'auto',
        'height': heightMainContent + 'px'
    });
}

/**
 * Crea la configurcion de la simulacion
 * @param configuracion
 * @returns {Sim}
 * @constructor
 */
function atencionPacientesCovidSimulation(configuracion) {
    // Inicializmos la simulacion
    let simulador = new Sim();
    let random = new Random(configuracion.generadorRandomico);
    let status = new Sim.Population("Pasientes infectados por COVID");

    // Agrega los servicios del centro
    let modoAtencion = Sim.Facility.FCFS // primero en entrar primero en salir
    let enfermeras = new Sim.Facility('Enfermeras', modoAtencion, configuracion.enfermeras);
    let ambulancias = new Sim.Facility('Ambulancias', modoAtencion, configuracion.ambulancias);

    // Agrega los recuros de centro
    let totalCamas = configuracion.camas
    let camas = new Sim.Buffer('Camas', totalCamas, totalCamas)
    let totalRespiradores = configuracion.respiradores
    let respiradores = new Sim.Buffer('Respiradores', totalRespiradores, totalRespiradores)

    // Creamos las entidades
    let HospitalControler = {

        start: function () {
            if (camas.available < totalCamas) {
                this.asistirPasiente();
            }
            // Tiempo en hacer los contorles los pasientes
            this.setTimer(configuracion.tiempoControl).done(this.start);
        },

        asistirPasiente: function () {
            // La enferma realiza la asistencia rutinaria del pasiente
            let tiempoServicio = random.uniform(1, configuracion.tiempoAsistencia);
            this.useFacility(enfermeras, tiempoServicio).done(function () {
                let tiempoActual = this.time()
                // libera los recursos del centro
                this.putBuffer(camas, 1);
                this.putBuffer(respiradores, 1);
                let probabilidadMuerte = Math.random()
                let mensaje = 'El pasiente '
                if (probabilidadMuerte >= configuracion.tasaVulneravilidad){
                    mensaje += `fallece en el centro hospitalario y libera los recursos`;
                    vueSimulacion.agregarEstadoPasiente(4, tiempoActual, 1)
                }else{
                    mensaje += `se recupera en el centro hospitalario y libera los recursos`;
                    vueSimulacion.agregarEstadoPasiente(3, tiempoActual, 1)
                }
                // Agrea los registro de log
                vueSimulacion.agregarEstadoLogs(tiempoActual, mensaje)
                status.leave(this.callbackData, tiempoActual);
            }).setData(this.time())
        },

    };


    let PasienteControler = {

        numero: 0,

        start: function () {
            // Aumenta el identificador
            this.numero ++;
            let tiempoEntrar = this.time()
            status.enter(tiempoEntrar);
            let pacientes = Math.round(random.uniform(1, configuracion.generadorPasientes));
            // Agrega los pacientes de ingreso
            vueSimulacion.agregarEstadoPasiente(1, tiempoEntrar,  pacientes)
            vueSimulacion.agregarEstadoRecursos(1, tiempoEntrar, ambulancias.free)
            vueSimulacion.agregarEstadoRecursos(2, tiempoEntrar, enfermeras.free)
            vueSimulacion.agregarEstadoRecursos(3, tiempoEntrar, camas.available)
            vueSimulacion.agregarEstadoRecursos(4, tiempoEntrar, respiradores.available)
            for (let i=0; i<pacientes; i++){
                let idPasiente = `P${this.numero}.${i+1}`
                // Probibilidad de llegar al centro por emerbulancia
                let probabilidadEmergencia = Math.random()
                if (probabilidadEmergencia < configuracion.tasaEmergencia){
                    // Lanza el evento de llegar al centro
                    this.llegarAlCentro(idPasiente)
                }else{
                    // Lanza el evento de llamar a emergencia para llegar al centro
                    this.llamarAEmergencia(idPasiente)
                }
            }
            // Tiempo en asistir a otro pasiente
            let siguientePasiente = random.uniform(1, configuracion.tiempoLlegada);
            this.setTimer(siguientePasiente).done(this.start);
        },

        llamarAEmergencia: function (idPasiente){
            // Agrega los datos de log
            let mensaje = `Pasiente ${idPasiente} llama a emergencias`;
            vueSimulacion.agregarEstadoLogs(this.time(), mensaje)
            // Espera que la ambulancia valla a su ubicacion y lo traslade al centor medico
            let tiempoServicio = random.uniform(1, configuracion.tiempoTraslado);
            this.useFacility(ambulancias, tiempoServicio).done(function () {
                let mensaje = `Pasiente ${idPasiente} es retirado de la ambulancia`;
                vueSimulacion.agregarEstadoLogs(this.time(), mensaje)
                // el pasiente llega al centro medico
                this.llegarAlCentro(idPasiente)
            }).setData(this.time());
        },

        llegarAlCentro: function (idPasiente){
            // Agrega los datos de log
            let mensaje = `Pasiente ${idPasiente} llega al centro hospitalario`;
            vueSimulacion.agregarEstadoLogs(this.time(), mensaje)
            // La emfermara estabiliza al pasiente cuando llega a emergencia
            let tiempoServicio = random.uniform(1, configuracion.tiempoEstabilizar);
            this.useFacility(enfermeras, tiempoServicio).done(function () {
                let mensaje = `Pasiente ${idPasiente} esta esperando la cama y respirador`;
                vueSimulacion.agregarEstadoLogs(this.time(), mensaje)
                // El pasiente espera una cama disponible
                this.getBuffer(camas, 1).done(function () {
                    // El pasiente espera un respirador disponible
                    this.getBuffer(respiradores, 1).done(function () {
                        // La emfermara asiste al pasiente para dejarlo internado
                        let tiempoServicio = random.uniform(1, configuracion.tiempoAsistencia);
                        this.useFacility(enfermeras, tiempoServicio).done(function () {
                            let tiempoAcutal = this.time()
                            let mensaje = `Pasiente ${idPasiente} queda internado en el centro hospitalario`;
                            // Agrega los pacientes que se internaron
                            vueSimulacion.agregarEstadoLogs(tiempoAcutal, mensaje)
                            vueSimulacion.agregarEstadoPasiente(2, tiempoAcutal, 1)
                        }).setData(this.callbackData);
                    }).setData(this.callbackData);
                }).setData(this.callbackData);
            }).setData(this.time());
        }
    }

    // Agrego las entidades
    simulador.addEntity(HospitalControler);
    simulador.addEntity(PasienteControler);

    // Retorna el simulador
    return [simulador, status];

}

let vueSimulacion = new Vue({
    el: '#app-simulacion',
    data: {
        cargar: false,

        // datos de vista
        tipoSimulacion: 'T',
        simulador: null,
        logsSimulacion: [],

        listaEstadoRecursos: {
            ambulancias: [],
            enfermeras: [],
            camas: [],
            respiradores: []
        },

        listaEstadoPasientes: {
            ingresados: [],
            internados: [],
            recuperados: [],
            fallecidos: [],
        },

        datosSimulacion: {
            // recursos
            ambulancias: 10,
            enfermeras: 20,
            camas: 200,
            respiradores: 250,

            // tiempos
            tiempoLlegada: 30.0,
            tiempoTraslado: 10.0,
            tiempoEstabilizar: 15.0,
            tiempoAsistencia: 10.0,

            // otros
            tasaEmergencia: 0.5,
            tasaVulneravilidad: 0.8,
            tiempoControl: 10,

            // configuracion
            generadorPasientes: 5,
            generadorRandomico: 48695,
            tiempoSimulacion: 100

        },

        resultados: {
            tiempoPromedio: 0.0,
            pasientesPromedio: 0.0,
            pasientesInternados: 0.0,
            pasientesFallecidos: 0.0,
            pasientesRecuperados: 0.0,
        }
    },
    watch: {
        datosSimulacion(){
            setTimeout(M.updateTextFields, 1)
        },
        tipoSimulacion() {
            // verifica el tiempo de simulaicon
            switch (this.tipoSimulacion){
                case 'D':
                    this.datosSimulacion.tiempoSimulacion = 1440
                    break;
                case 'S':
                    this.datosSimulacion.tiempoSimulacion = 10080
                    break;
                case 'M':
                    this.datosSimulacion.tiempoSimulacion = 43800
                    break;
                default:
                    this.datosSimulacion.tiempoSimulacion = ''
            }
            // actualiza los fields
            setTimeout(M.updateTextFields, 1)
        }
    },
    methods: {

        restObtenerReporteImagen(){
            return $.post('obetener_imagenes/', {
                recursos: JSON.stringify(this.listaEstadoRecursos),
                pacientes: JSON.stringify(this.listaEstadoPasientes)
            }).done((resultado)=> {
                // Agrega la imagen a la vista
                $('#img-reporte').attr('src', "data:image/png;base64," + resultado.imagen_reporte)
                this.cargar = false
            })
        },

        mostrarImgenReporte(){
            this.restObtenerReporteImagen()
        },

        agregarEstadoLogs(tiempo, mensaje){
           // Agrega los datos de log.
            this.logsSimulacion.push({'tiempo': tiempo, 'mensaje': mensaje})
        },

        agregarEstadoRecursos(recurso, tiempo, cantidad){
            let nombreRecurso = ''
            switch (recurso){
                case 1:
                    nombreRecurso = 'ambulancias'
                    break
                case 2:
                    nombreRecurso = 'enfermeras'
                    break
                case 3:
                    nombreRecurso = 'camas'
                    break
                case 4:
                    nombreRecurso = 'respiradores'
            }
            // obtiene la lista
            let listaEstados = this.listaEstadoRecursos[nombreRecurso]
            // Agrega el nuevo registro
            listaEstados.push({tiempo: tiempo, cantidad: cantidad})
            // Actualiza la lista
            this.listaEstadoRecursos[nombreRecurso] = listaEstados
        },

        agregarEstadoPasiente(estado, tiempo, cantidad){
            let nombreEstado = ''
            switch (estado){
                case 1:
                    nombreEstado = 'ingresados'
                    break
                case 2:
                    nombreEstado = 'internados'
                    break
                case 3:
                    nombreEstado = 'recuperados'
                    break
                case 4:
                    nombreEstado = 'fallecidos'
            }
            // obtiene la lista
            let listaEstados = this.listaEstadoPasientes[nombreEstado]
            let cantidadA = 0
            if (listaEstados.length > 0){
                cantidadA = listaEstados[listaEstados.length - 1].cantidad
            }
            // Agrega el nuevo registro
            listaEstados.push({tiempo: tiempo, cantidad: cantidadA + cantidad})
            // Actualiza la lista
            this.listaEstadoPasientes[nombreEstado] = listaEstados
        },

        correrSimulacion(){
            // Obtiene la simulacion
            if (this.cargar){
                showToast.info("Existe una simulacion en curso")
            }else{
                 if (validacionInputs.validarVacios('CLI')){
                     this.cargar = true
                     this.limpiarListas()
                     new Promise((resolve) => {
                        // Ejecuta la simulacion
                         let [ simulador, status ] = atencionPacientesCovidSimulation(this.datosSimulacion)
                         simulador.simulate(this.datosSimulacion.tiempoSimulacion)
                         this.resultados.tiempoPromedio = status.durationSeries.average().toFixed(4)
                         this.resultados.pasientesPromedio = status.sizeSeries.average().toFixed(4)
                         let totalInternados = this.listaEstadoPasientes['internados']
                         this.resultados.pasientesInternados =  totalInternados[totalInternados.length -1].cantidad
                         let totalRecuperados = this.listaEstadoPasientes['recuperados']
                         this.resultados.pasientesRecuperados =  totalRecuperados[totalRecuperados.length - 1].cantidad
                         let totalFallecidos = this.listaEstadoPasientes['fallecidos']
                         this.resultados.pasientesFallecidos =  totalFallecidos[totalFallecidos.length - 1].cantidad
                         resolve()
                     }).then(() => {
                         console.log("termino")
                        this.restObtenerReporteImagen()
                     })
                }
            }
        },

        limpiarListas(){
            // limpia lista de logs
            this.logsSimulacion= []
            // limpia lista de recursos
            this.listaEstadoRecursos = {
                ambulancias: [],
                enfermeras: [],
                camas: [],
                respiradores: []
            }
            // limpia lista de pasiente
            this.listaEstadoPasientes = {
                ingresados: [],
                internados: [],
                recuperados: [],
                fallecidos: [],
            }
        },

        validarCampos(){
            let mensaje = ""

        },

        finalizarSimulacion(){
            this.simulador.finalize()
        }

    },
    mounted(){
       $('#mod-crear-contacto').modal({dismissible: false});
    },

});