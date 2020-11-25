import random
import matplotlib.pyplot as plt


def simular_lanzamiento(casos):
	dado1 = 0
	dado2 = 0
	resultados = []
	valorRepetido = False
	
	for turno in range(1, casos + 1):
		dado1 = random.randrange(1,7)
		dado2 = random.randrange(1,7)
		suma = dado1 + dado2
		
		for datos in resultados:
			if datos["suma"] == suma:
				datos["frecuencia"] += 1
				valorRepetido = True
				break
		
		if not valorRepetido:
			resultados.append({"suma": suma, "frecuencia": 1})
		valorRepetido = False
	
	# Retorna los resultados
	return resultados
	
if __name__ == "__main__":
	# llamamos el metodo con 80 casos
	casos = 80
	resultados = simular_lanzamiento(casos)
	# imprimimos la lista
	for datos in resultados:
		print(datos["suma"], "\t\t", datos["frecuencia"], "\t\t", (datos["frecuencia"] /casos))
	# imprimios lo demas
	plt.hist(datos["suma"])
	plt.title("Casos: " + str(casos))
	plt.xlabel("Suma")
	plt.ylabel("Frecuencia")
	plt.show()