/* 
	Copyright © 2019 Willian Gabriel Cerqueira da Rocha

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
	All rights reserved.

	Willian Gabriel Cerqueira da Rocha
	hello[at]willgcr[dot]me
	https://willgcr.me
*/

document.addEventListener ("DOMContentLoaded", () => {
	//Quantidade de cidades que serão geradas para otimização de rota
	const quantidadeCidades = 30;
	//Quantidade de indivíduos (ou cromossomos) que irão compor cada geração
	const quantidadeIndividuos = 10000;
	//Quantidade limite de gerações em que o algoritmo irá iterar
	const quantidadeGeracoes = 50;
	//Taxa de sobrevivência, é a porcentagem de indivíduos que irá sobreviver de uma geração para outra
	const taxaDeSobrevivencia = 0.3;
	//Probabilidade de determinado gene sofrer mutação
	const taxaDeMutacao = 0.1;
	//Variável que irá armazenar os pontos do mapa, cada ponto é uma cidade
	var pontos;

	//Variáveis do canvas
	var canvas = document.getElementById("canvas0");
	var ctx = canvas.getContext("2d");length
	canvas.width = 285;
	canvas.height = 285;

	//Variáveis dos elementos HTML
	var melhorDistancia = document.getElementById ("melhor-distancia");
	var geracaoAtual = document.getElementById ("geracao-atual");
	var maiorDistancia = document.getElementById ("maior-distancia");
	var distanciaMedia = document.getElementById ("distancia-media");

	//Função que serve para limpar o canvas, apagando possíveis cidades de uma execução anterior e desenha o grid
	function limparCanvas () {		
		//Limpa o canvas
		ctx.clearRect (0, 0, canvas.width, canvas.height);
		//Configuração das linhas pontilhadas
		ctx.beginPath();
		ctx.lineWidth = "0.1";
		ctx.strokeStyle = "gray";
		ctx.setLineDash([1, 1]);
		//Linhas verticais do mapa
		for (let i = 0; i < 20;  i++) {
			ctx.moveTo(15*i, 0);
			ctx.lineTo(15*i, 285);
			ctx.stroke();
		}
		//Linhas horizontais do mapa
		for (let i = 0; i < 20;  i++) {
			ctx.moveTo(0, 15*i);
			ctx.lineTo(285, 15*i);
			ctx.stroke();
		}
		ctx.fill();
	}

	//Função que desenha a trajetória e atualiza o canvas
	function desenharTrajetoria (pontoAX, pontoAY, pontoBX, pontoBY)  {
		ctx.beginPath ();
		ctx.lineWidth = "3";
		ctx.strokeStyle = "purple";
		ctx.moveTo (pontoAX, pontoAY);
		ctx.lineTo (pontoBX, pontoBY);
		ctx.stroke ();
		ctx.fillStyle = "green";
		ctx.arc(pontoBX, pontoBY, 4, 0, 2*Math.PI);
		return;
	}

	function desenharCidades () {
		//Reinicia o layout do canvas
		limparCanvas();
		//Desenha as cidades no mapa, exceto a cidade de partida e a de chegada
		ctx.fillStyle = "blue";
		for (let i = 1; i < quantidadeCidades-1; i++) {
			ctx.beginPath();
			ctx.arc(pontos.getCidade(i).getX(), pontos.getCidade(i).getY(), 4, 0, 2*Math.PI);
			ctx.fill();
		}
		//Desenha a cidade 0 no mapa, essa cidade será a origem
		ctx.beginPath();
		ctx.fillStyle = "green";
		ctx.arc(pontos.getCidade(0).getX(), pontos.getCidade(0).getY(), 6, 0, 2*Math.PI);
		ctx.fill();
		//Desenha a cidade de destino
		ctx.beginPath();
		ctx.fillStyle = "red";
		ctx.arc (pontos.getCidade(quantidadeCidades-1).getX(), pontos.getCidade(quantidadeCidades-1).getY(), 6, 0, 2*Math.PI);
		ctx.fill();
		return;
	}

	//Gera a lista de cidades e desenha elas no mapa
	document.getElementById("gerar-cidades").addEventListener ("click", gerarCidades = () => {
		//Limpa os elementos HTML
		melhorDistancia.innerHTML  = "-";
		geracaoAtual.innerHTML  = "-";
		maiorDistancia.innerHTML = "-";
		distanciaMedia.innerHTML = "-";
		//Gera os pontos de entrega
		pontos = new pontosDeEntrega(quantidadeCidades);
		//Desenha as cidades no mapa
		desenharCidades ();
		return;
	});

	document.getElementById("iniciar-otimizacao").addEventListener ("click", iniciarOtimizacao = () => {
		if (pontos == undefined) {
			alert("É necessário gerar uma lista de cidades primeiro!");
			return;
		}
		document.getElementById("iniciar-otimizacao").disabled = true;
		document.getElementById("gerar-cidades").disabled = true;
		//Cria uma população inicial
		let populacaoPrincipal = new populacao();
		
		let contadorGeracao = 0;
		let maiorNota = 0;
		let notaMedia = 0;

		//A parte principal do algoritmo
		setTimeout (main = () => {
			setTimeout(()=> {
				if (quantidadeGeracoes <= contadorGeracao) {
					document.getElementById("iniciar-otimizacao").disabled = false;
					document.getElementById("gerar-cidades").disabled = false;
					return;
				}
				notas = avaliarPopulacao(populacaoPrincipal);
				if (maiorNota <= (Math.max (...notas))) {
					maiorNota = Math.max (...notas);
				}
				let sum = 0;
				for (let i = 0; i < notas.length; i++)
					sum+=notas[i];
				notaMedia = sum/notas.length;
				melhorDistancia.innerHTML  = Math.min(...notas);
				geracaoAtual.innerHTML  = contadorGeracao;
				maiorDistancia.innerHTML = maiorNota;
				distanciaMedia.innerHTML = notaMedia;

				populacaoPrincipal = realizarCruzamento(populacaoPrincipal, notas);
				populacaoPrincipal = realizarMutacoes(populacaoPrincipal);	
				contadorGeracao++;

				//Calcula-se a menor nota e mapea-se o indivíduo para desenhar a melhor trajetória da geração atual
				let menorNota = Math.min (...notas);
				let posicaoMenor = notas.indexOf (menorNota);
				//Array contendo a melhor trajetória da geração atual
				desenharCidades();
				let mmm = populacaoPrincipal[posicaoMenor];
				for (let i = 0; i < quantidadeCidades-1; i++) {
					desenharTrajetoria(pontos.getCidade(mmm[i]).getX(), pontos.getCidade(mmm[i]).getY(), pontos.getCidade(mmm[i+1]).getX(), pontos.getCidade(mmm[i+1]).getY());	
				}

				main();
			}, 10);
		}, 0);
		return;
	});

	//Todos os pontos de entrega, gera uma lista de 30 cidades
	function pontosDeEntrega(quantidade) {
		let cidades = new Array ();
		for (let i = 0; i < quantidade; i++) {
			let novaCidade = new cidade();
			while (cidades.includes (novaCidade)) {
				novaCidade = new cidade();
			}
			cidades.push (novaCidade);
		}
		this.getCidade = (x) => {
			return(cidades[x]);
		}
		return;
	}

	//Cria uma nova cidade com coordenadas múltiplas de 15, para que fique sobre as linhas e mais fácil de visualizar
	//O valor randômico (entre 0 e 1) é multiplicado por 19 pois são 20 linhas (0 a 19) e depois multiplicado por 15 (pois cada linha está a 15 pixels de distância da outra)
	function cidade() {
		this.x = Math.round (Math.random()*19)*15;
		this.y = Math.round (Math.random()*19)*15;
		this.getX = () => {
			return(this.x);
		};
		this.getY = () => {
			return(this.y);
		};
	}

	//Cria um indivíduo, mantendo a cidade de partida no início do cromossomo e a cidade de chegada ao final, gerando diversos percursos possíveis
	function populacao() {
		let novaPopulacao = new Array();
		//Itera, criando a quantidade de indivíduos definida anteriormente
		while (novaPopulacao.length < quantidadeIndividuos) {
			let cromossomo = new Array();
			//O primeiro gene será sempre a cidade de partida 0
			cromossomo.push(0);
			//Gera valores aleatórios e preenche no cromossomo, exceto dois (a cidade de partida e a cidade de chegada)
			for (let i = 0; i < quantidadeCidades-2; i++) {
				let novoGene = Math.round(Math.random()*quantidadeCidades);
				while (cromossomo.includes(novoGene) || novoGene <= 0 || novoGene >= quantidadeCidades-1){
					novoGene = Math.round(Math.random()*quantidadeCidades);
				}
				cromossomo.push(novoGene);
			}
			//Coloca a cidade de chegada ao fim do array que representa o cromossomo
			cromossomo.push(quantidadeCidades-1);
			//Verifica se o cromossomo gerado já existe na lista para evitar cromossomos gêmeos
			if (!novaPopulacao.includes (cromossomo)) {
				novaPopulacao.push (cromossomo);
			}
		}
		return (novaPopulacao);
	}

	//Avalia a população calculando a distância que seria percorrida em cada percurso gerado
	//Retorna as notas na mesma sequência em que os indivíduos correpondentes aparecem na população
	function avaliarPopulacao (pop) {
		let notas = new Array();
		pop.forEach ((ind) => {
			let distancia = 0;
			for (let i = 1; i < ind.length; i++) {
				let x1 = pontos.getCidade(ind[i-1]).getX();
				let x2 = pontos.getCidade(ind[i]).getX();
				let y1 = pontos.getCidade(ind[i-1]).getY();
				let y2 = pontos.getCidade(ind[i]).getY();
				distancia += Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
			}
			notas.push(distancia);
		});
		return (notas);
	}

	//Realiza o cruzamento baseado em ranking
	function realizarCruzamento(pop, notas) {
		let quantidadeNovosIndividuos = pop.length - (pop.length*taxaDeSobrevivencia);
		let quantidadeIndividuosSobreviventes = pop.length-quantidadeNovosIndividuos;
		//Cria um ranking dos indivíduos, baseado nas notas deles
		let notasOrdenadas = notas.slice ().sort ((a, b) => {
			return (a - b);
		});
		let ranking = notas.slice ().map ((v) => { 
			return (notasOrdenadas.indexOf(v));
		});
		//Seleciona os indivíduos sobreviventes e separa eles em um array novo
		let novosCromossomos = new Array ();
		for (let i = 0; i < pop.length; i++) {
			if (ranking[i] < quantidadeIndividuosSobreviventes) {
				novosCromossomos.push (pop[i]);
			}
		}
		//Seleciona o ponto de cruzamento entre 3 e 26 e faz o cruzamento
		while (novosCromossomos.length < quantidadeIndividuos) {
			let pontoCrossover = getRandom (3, 26);
			let pai = getRandom (0, quantidadeIndividuosSobreviventes-1);
			let mae = getRandom (0, quantidadeIndividuosSobreviventes-1);
			let filho = novosCromossomos[pai].slice (0, pontoCrossover);
			novosCromossomos[mae].forEach ((gene) => {
				if (!filho.includes(gene)) {
					filho.push (gene);
				}
			});
			if (!novosCromossomos.includes (filho)) {
				novosCromossomos.push (filho);
			}
		}
		return (novosCromossomos);
	}

	//Percorre gene por gene de cada indivíduo e com base na probabilidade de mutações faz as mudanças
	function realizarMutacoes (pop) {
		pop.forEach ((individuo) => {
			for (let i = 0; i < individuo.length; i++) {
				let prob = Math.random ();
				if (prob <= taxaDeMutacao) {
					let gene0 = i;
					let gene1 = getRandom (0, individuo.length-1);
					while (gene1 != gene0) {
						gene1 = getRandom (0, individuo.length);
					}
					individuo[gene0] = individuo[gene1];
					individuo[gene1] = individuo[gene0];
				}
			}
		});
		return (pop);
	}

	//Retorna um valor aleatório inteiro entre min e max, incluindos eles
	function getRandom (min, max) { 
		min = Math.ceil (min);
		max = Math.floor (max);
		return (Math.floor(Math.random() * (max - min + 1)) + min);
	}
});
