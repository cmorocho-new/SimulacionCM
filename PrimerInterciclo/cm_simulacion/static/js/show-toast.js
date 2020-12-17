/**
 * Retorna la plantilla de mensajes
 * @param {*} tipo
 * @param {*} parametro
 */
function plantilla(tipo, parametro){
    let clase = ""
    switch(tipo){
        case 1:
            clase = "done-msg";
            break;
        case 2:
            clase = "error-msg";
            break;
        case 3:
            clase = "info-msg";
            break;
        default:
            clase = "info-msg"
    }
    return `<div class="${clase}"> ${parametro} </div>`;
}

/**
 * Muestra los mensajes de error
 */
const showToast = (function () {
    return {
        success: function (msg) {
            showToast.show(plantilla(1, msg));
        },
        error: function (msg) {
            showToast.show(plantilla(2, msg));
        },
        info: function (msg) {
            showToast.show(plantilla(3, msg));
        },
        show: function (html) {
            M.toast({html: html});
        }
    }
})();