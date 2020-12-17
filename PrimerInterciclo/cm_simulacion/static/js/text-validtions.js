/**
 * Inicializacion de validacion de los inputs
 */
$(document).ready(function () {
    $('input.txt').each(function () {
        $(this).attr('onkeypress', 'validacionInputs.validarTexto(event)');
    });
    $('input.num').each(function () {
        $(this).attr('onkeypress', 'validacionInputs.validarNumero(event)');
    });
    $('input.dec').each(function () {
        $(this).attr('onkeypress', 'validacionInputs.validarDecimal(value)');
    });
});


/**
 * Metodos para la validacion de inputs
 * @type {{validarValidar, refrescar, validarTexto, validarDecimal, validarNumero}}
 */
let validacionInputs = (function () {

    return {

        validarVacios: function (prefijo, mensaje=true) {
            let inputs = $('input.requerido'+ '-' + prefijo)
            if (inputs.length){
                let vacios = [];
                inputs.removeClass('invalid');
                $('input.requerido'+ '-' + prefijo).each(function () {
                    if (!this.value.trim()) {
                        vacios.push(this.name);
                        $(this).addClass('invalid')
                    }
                });
                if(vacios.length){
                    if(mensaje) this.mostrarMensajes(vacios);
                    return false
                }else{
                    return true
                }
            }
        },
        refrescarInpust: function (prefijo) {
            $('input.requerido'+ '-' + prefijo).removeClass('invalid')
        },

        mostrarMensajes: function(inputs){
            let mensaje = '';
            inputs.forEach((input) => {
                mensaje += `El campo [ ${input} ] es requerido. <br>`
            });
            // muestra el mensaje
            showToast.error(mensaje)
        },

        /**
         * Metodo que valida que un field tenga solo letras
         * @param event
         */
        validarTexto: function (event) {
            if (event.key >= '0' && event.key <= '9') {
                event.preventDefault();
            }
        },

        /***
         * Metodo que valida que un field tenga solo decimales
         * @param
         */
        validarDecimal: function () {
            let value = event.target.value;
            if (!(event.key >= '0' && event.key <= '9')) {
                if (event.key === '.') {
                    value = (value).match(/\./g);
                    if ((value ? value : []).length > 0) {
                        event.preventDefault();
                    }
                } else {
                    event.preventDefault();
                }
            }
        },

        /**
         * Metodo que valida que un field tenga solo numeros
         */
        validarNumero: function () {
            if (!(event.key >= '0' && event.key <= '9')) {
                event.preventDefault();
            }
        },
        /**
         * Metodo que valida que un field tenga solo numeros
         */
        validarFormato: function () {
            let value = event.target.value;
            if(event.target.value){
                event.target.value = parseFloat(value).toFixed(2);
            }
        }
    }

})();
