(function ($) {

    $.fn.scrollTable = function (opciones) {
        this.each((index, child)=> {
            let _child = $(child)
            // Obtiene el header y footer dinamico
            let header = _child.find('div.table-header')
            let body = _child.find('div.table-body')
            let footer = _child.find('div.table-footer')
            // Agrega el overflow scroll
            body.css({'overflow': 'auto', 'height':
                (opciones.height - (header.length ? header.height() : 0) - (footer.length ? footer.height() : 0)) +
                'px'});
            // Agrega agrega la dimension
            _child.find('table').css('width', opciones.width + 'px')
            let scroll_header = header.find('div.table-header-dinamic')
            let scroll_footer = footer.find('div.table-footer-dinamic')
            // Agrega agrega el sincronize
            $([scroll_header.length ? scroll_header[0] : {},
               body.length ? body[0] : {},
               scroll_footer.length ? scroll_footer[0] : {}]).scrollsync();
        });

        this.actualizarTabla = function (){

        }
    };


})(jQuery);