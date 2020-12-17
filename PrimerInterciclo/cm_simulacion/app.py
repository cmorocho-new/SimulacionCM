import io
import base64
import matplotlib.pyplot as plt
import pandas as pd
from flask import Flask, render_template, json, request
from response_utils import ResponseJSON

app = Flask(__name__, static_url_path='/')


@app.route('/')
def index_pagina():
    return render_template("index.html")


@app.route('/obetener_imagenes/', methods=['POST'])
def generar_imagen_estadistica():
    """
        Genera la imagen estadistica
    :return:
    """
    # Obtiene los datos de la simulacion
    datos_recursos = json.loads(request.values['recursos'])
    datos_pacientes = json.loads(request.values['pacientes'])

    pic_reporte_iobytes = io.BytesIO()
    fig, (ax1, ax2) = plt.subplots(1, 2)

    if len(datos_recursos):
        ambulancias = pd.DataFrame(datos_recursos['ambulancias'])
        if len(ambulancias):
            ax1.plot(ambulancias['tiempo'].map(float), ambulancias['cantidad'].map(float), color='b', label='Ambulancias')
        enfermeras = pd.DataFrame(datos_recursos['enfermeras'])
        if len(enfermeras):
            ax1.plot(enfermeras['tiempo'].map(float), enfermeras['cantidad'].map(float), color='k', label='Enfermeras')
        camas = pd.DataFrame(datos_recursos['camas'])
        if len(camas):
            ax1.plot(camas['tiempo'].map(float), camas['cantidad'].map(float), color='g', label='Camas')
        respiradores = pd.DataFrame(datos_recursos['respiradores'])
        if len(respiradores):
            ax1.plot(respiradores['tiempo'].map(float), respiradores['cantidad'].map(float), color='y', label='Respiradores')
        ax1.legend(loc='lower right')
        ax1.grid(True)

    if len(datos_pacientes):
        ingresados = pd.DataFrame(datos_pacientes['ingresados'])
        if len(ingresados):
            ax2.plot(ingresados['tiempo'].map(float), ingresados['cantidad'], color='b', label='Ingresados')
        internados = pd.DataFrame(datos_pacientes['internados'])
        if len(internados):
            ax2.plot(internados['tiempo'].map(float), internados['cantidad'], color='k', label='Internados')
        recuperados = pd.DataFrame(datos_pacientes['recuperados'])
        if len(recuperados):
            ax2.plot(recuperados['tiempo'].map(float), recuperados['cantidad'], color='g', label='Recuperados')
        fallecidos = pd.DataFrame(datos_pacientes['fallecidos'])
        if len(fallecidos):
            ax2.plot(fallecidos['tiempo'].map(float), fallecidos['cantidad'], color='r', label='Rallecidos')
        ax2.legend(loc='lower right')
        ax2.grid(True)

    fig.savefig(pic_reporte_iobytes, format='png')
    pic_reporte_iobytes.seek(0)
    plt.close()
    # resultado
    reporte = {
        'imagen_reporte': base64.b64encode(pic_reporte_iobytes.read()).decode("utf-8")
    }
    # Retorna el reporte
    return ResponseJSON(response=reporte, status=200)


if __name__ == '__main__':
    app.run()
