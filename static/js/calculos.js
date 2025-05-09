/**
 * ZeloCalc - Módulo de cálculos técnicos para o Zelopack
 * Versão 2.1 - Atualizado com todos os cálculos do CALCULOS_LAB_RAFA.xlsx
 * 
 * Este arquivo contém as funções para os cálculos técnicos do sistema Zelopack,
 * focando em cálculos laboratoriais e de produção.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('ZeloCalc: Inicializando módulo de cálculos técnicos 2.0...');
    
    // Funções auxiliares de interface
    function setupCalculoNavigation() {
        // Expandir/colapsar categorias
        document.querySelectorAll('.calculo-category').forEach(category => {
            category.addEventListener('click', function() {
                const items = document.querySelectorAll('.calculo-item[data-target^="' + this.dataset.category + '"]');
                items.forEach(item => {
                    item.classList.toggle('collapsed');
                });
                this.querySelector('.fa-chevron-down').classList.toggle('fa-rotate-180');
            });
        });
        
        // Troca de cálculos ao clicar
        document.querySelectorAll('.calculo-item').forEach(item => {
            item.addEventListener('click', function() {
                // Remover classe ativa de todos os itens
                document.querySelectorAll('.calculo-item').forEach(i => i.classList.remove('active'));
                // Adicionar classe ativa ao item clicado
                this.classList.add('active');
                
                // Esconder todas as áreas de cálculo
                document.querySelectorAll('.calculo-area').forEach(area => area.classList.remove('active'));
                
                // Mostrar a área correspondente ao item clicado
                const targetArea = document.getElementById(this.dataset.target + '-area');
                if (targetArea) {
                    targetArea.classList.add('active');
                } else {
                    console.warn('Área de cálculo não encontrada para: ' + this.dataset.target);
                    // Fallback para empty state - mostra uma mensagem de área em construção
                    const emptyState = document.getElementById('calculo-empty-state');
                    if (emptyState) {
                        emptyState.innerHTML = `
                            <div class="empty-state-content">
                                <i class="fas fa-tools fa-3x mb-3 text-primary"></i>
                                <h4>Cálculo em Implementação</h4>
                                <p>O cálculo "${this.textContent.trim()}" está sendo desenvolvido e estará disponível em breve.</p>
                            </div>
                        `;
                        emptyState.classList.add('active');
                    }
                }
            });
        });
        
        // Busca de cálculos
        const searchInput = document.getElementById('searchCalculo');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                
                document.querySelectorAll('.calculo-item').forEach(item => {
                    const name = item.textContent.toLowerCase();
                    if (name.includes(query)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Mostrar todas as categorias se a busca estiver vazia
                if (query === '') {
                    document.querySelectorAll('.calculo-category').forEach(cat => {
                        cat.style.display = '';
                    });
                } else {
                    // Esconder categorias que não têm itens visíveis
                    document.querySelectorAll('.calculo-category').forEach(category => {
                        const categoryName = category.dataset.category;
                        const hasVisibleItems = Array.from(
                            document.querySelectorAll(`.calculo-item[data-target^="${categoryName}"]`)
                        ).some(item => item.style.display !== 'none');
                        
                        category.style.display = hasVisibleItems ? '' : 'none';
                    });
                }
            });
        }
    }
    
    // Catálogo de todos os cálculos disponíveis para busca
    const calculosDisponiveis = [
        { 
            id: 'producao-200g', 
            nome: 'Produção 200g', 
            categoria: 'Produção', 
            descricao: 'Determinação de peso líquido de embalagens de 200g, subtraindo a tara (peso da embalagem) do peso bruto', 
            icon: 'fas fa-balance-scale', 
            favorito: true,
            frequencia: 60,
            formula: 'Peso Líquido = Peso Bruto - Tara'
        },
        { 
            id: 'producao-litro', 
            nome: 'Produção Litro', 
            categoria: 'Produção', 
            descricao: 'Calcula o volume final de produção com base no peso e densidade do produto', 
            icon: 'fas fa-tint', 
            favorito: true,
            frequencia: 58,
            formula: 'Volume Produzido (L) = Peso / Densidade'
        },
        { 
            id: 'abaixar-brix', 
            nome: 'Abaixar Brix', 
            categoria: 'Laboratório', 
            descricao: 'Estima quanto de água é necessário adicionar para reduzir o Brix de uma solução até o valor desejado', 
            icon: 'fas fa-water', 
            favorito: true,
            frequencia: 55,
            formula: 'Água a Adicionar (L) = Volume Inicial × [(Brix Atual / Brix Desejado) - 1]'
        },
        { 
            id: 'brix-corrigido', 
            nome: 'Brix Corrigido', 
            categoria: 'Laboratório', 
            descricao: 'Aplica uma correção ao Brix medido levando em conta temperatura ou densidade', 
            icon: 'fas fa-thermometer-half', 
            favorito: true,
            frequencia: 52,
            formula: 'Brix Corrigido = Brix Medido × Fator'
        },
        { 
            id: 'peso-bruto', 
            nome: 'Peso Bruto', 
            categoria: 'Produção', 
            descricao: 'Soma do peso líquido do produto e a tara (embalagem)', 
            icon: 'fas fa-weight', 
            favorito: false,
            frequencia: 50,
            formula: 'Peso Bruto = Peso Líquido + Tara'
        },
        { 
            id: 'corantes', 
            nome: 'Corantes', 
            categoria: 'Laboratório', 
            descricao: 'Quantifica a quantidade de corante a ser adicionado por litro ou por lote', 
            icon: 'fas fa-fill-drip', 
            favorito: false,
            frequencia: 48,
            formula: 'Corante a Adicionar = Volume Total × Dosagem'
        },
        { 
            id: 'densidade', 
            nome: 'Densidade', 
            categoria: 'Laboratório', 
            descricao: 'Calcula a densidade com base na razão entre massa e volume', 
            icon: 'fas fa-atom', 
            favorito: true,
            frequencia: 47,
            formula: 'Densidade = Massa / Volume'
        },
        { 
            id: 'ratio', 
            nome: 'Ratio', 
            categoria: 'Laboratório', 
            descricao: 'Relação simples entre Brix e Acidez', 
            icon: 'fas fa-calculator', 
            favorito: true,
            frequencia: 45,
            formula: 'Ratio = Brix / Acidez'
        },
        { 
            id: 'acidez', 
            nome: 'Acidez', 
            categoria: 'Laboratório', 
            descricao: 'Cálculo padrão da acidez de um produto', 
            icon: 'fas fa-eye-dropper', 
            favorito: true,
            frequencia: 44,
            formula: 'Acidez (%) = (Volume NaOH × Fator × 100) / Volume da Amostra'
        },
        { 
            id: 'calcular-soda', 
            nome: 'Cálculo de Soda', 
            categoria: 'Laboratório', 
            descricao: 'Estima a quantidade de soda (NaOH) necessária para ajustar o pH ou neutralizar a acidez', 
            icon: 'fas fa-flask', 
            favorito: true,
            frequencia: 42,
            formula: 'Soda a Adicionar = (Acidez Final - Acidez Inicial) × Volume × Fator'
        },
        { 
            id: 'vitamina-c', 
            nome: 'Vitamina C', 
            categoria: 'Laboratório', 
            descricao: 'Determina o teor de vitamina C por titulação', 
            icon: 'fas fa-apple-alt', 
            favorito: true,
            frequencia: 40,
            formula: 'Vitamina C = (Volume × Fator) / Volume da amostra'
        },
        { 
            id: 'perda-base', 
            nome: 'Perda de Base', 
            categoria: 'Produção', 
            descricao: 'Verifica perda de produto durante o processo', 
            icon: 'fas fa-chart-line', 
            favorito: false,
            frequencia: 38,
            formula: 'Perda (%) = ((Peso Inicial - Peso Final) / Peso Inicial) × 100'
        },
        { 
            id: 'acucar-puxar', 
            nome: 'Quantidade de Açúcar Puxar', 
            categoria: 'Produção', 
            descricao: 'Calcula o açúcar necessário para atingir determinado Brix em um lote', 
            icon: 'fas fa-cubes', 
            favorito: false,
            frequencia: 37,
            formula: 'Açúcar = (Brix Desejado - Brix Atual) × Volume × 10'
        },
        { 
            id: 'aumentar-acidez', 
            nome: 'Aumentar Acidez', 
            categoria: 'Laboratório', 
            descricao: 'Quantifica quanto ácido adicionar para alcançar uma acidez desejada', 
            icon: 'fas fa-plus-circle', 
            favorito: false,
            frequencia: 36,
            formula: 'Ácido = (Acidez Desejada - Acidez Atual) × Volume'
        },
        { 
            id: 'diminuir-acidez', 
            nome: 'Diminuir Acidez', 
            categoria: 'Laboratório', 
            descricao: 'Quantifica quanta água ou base neutralizante deve ser adicionada para reduzir a acidez', 
            icon: 'fas fa-minus-circle', 
            favorito: false,
            frequencia: 35,
            formula: 'Volume a adicionar = fórmula baseada no fator de diluição'
        },
        { 
            id: 'conversao-acucar', 
            nome: 'Conversão Cristal ⇄ Líquido', 
            categoria: 'Produção', 
            descricao: 'Converte massa de açúcar cristal em líquido e vice-versa', 
            icon: 'fas fa-exchange-alt', 
            favorito: false,
            frequencia: 33,
            formula: 'Açúcar líquido = Cristal × Fator (ou o inverso)'
        },
        { 
            id: 'zeragem-embalagem', 
            nome: 'Zeragem de Embalagem', 
            categoria: 'Produção', 
            descricao: 'Verifica e corrige o valor da tara de embalagens na linha de produção', 
            icon: 'fas fa-box', 
            favorito: false,
            frequencia: 31,
            formula: 'Tara Média = Média dos pesos vazios'
        },
        { 
            id: 'ratio-brix', 
            nome: 'Ratio - Brix', 
            categoria: 'Laboratório', 
            descricao: 'Compara o Brix de duas amostras diferentes ou de um mesmo produto em etapas diferentes', 
            icon: 'fas fa-balance-scale-right', 
            favorito: false,
            frequencia: 30,
            formula: 'Ratio Brix = Brix 1 / Brix 2'
        },
        { 
            id: 'ratio-acidez', 
            nome: 'Ratio - Acidez', 
            categoria: 'Laboratório', 
            descricao: 'Relação entre duas medições de acidez (ex: antes e depois de um ajuste)', 
            icon: 'fas fa-balance-scale-left', 
            favorito: false,
            frequencia: 28,
            formula: 'Ratio Acidez = Acidez 1 / Acidez 2'
        },
        { 
            id: 'soda-diversey', 
            nome: 'Soda - Diversey', 
            categoria: 'Laboratório', 
            descricao: 'Cálculo de dosagem de soda baseado em concentração (método Diversey)', 
            icon: 'fas fa-tint', 
            favorito: false,
            frequencia: 20
        }
    ];
    
    // Configurações dos cálculos e fatores de conversão
    const configuracoes = {
        // Produção 200g
        producao_200g: {
            toleranciaPadrao: 2.5,
            valorEspecificado: 200.0,
            taraMedia: 19.0
        },
        
        // Brix
        brix: {
            temperaturaRef: 20.0,
            fatores: {
                standard: 1.0,
                citrus: 0.98,
                nectars: 1.02,
                concentrate: 0.95
            }
        },
        
        // Finalização Tanque
        finalizacaoTanque: {
            brixPadrao: {
                suco: 11.2,
                nectar: 13.5,
                refresco: 8.5
            },
            fatores: {
                densidade: 1.045
            }
        }
    };
    
    // Inicializa a navegação e os cálculos
    setupCalculoNavigation();
    setupEventHandlers();
    
    // Carrega os tooltips do Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Setup dos handlers de eventos para os cálculos
    function setupEventHandlers() {
        // Produção 200g
        const btnCalculaPeso200g = document.getElementById('calculaPeso200g');
        if (btnCalculaPeso200g) {
            btnCalculaPeso200g.addEventListener('click', function() {
                const pesoBruto = parseFloat(document.getElementById('peso_bruto').value) || 0;
                const tara = parseFloat(document.getElementById('peso_tara').value) || 0;
                const pesoEspecificado = parseFloat(document.getElementById('peso_especificado').value) || 200;
                const tolerancia = parseFloat(document.getElementById('tolerancia').value) || 2.5;
                
                if (pesoBruto <= 0 || tara <= 0) {
                    alert('Por favor, preencha o peso bruto e a tara corretamente.');
                    return;
                }
                
                // Calcula o peso líquido
                const pesoLiquido = window.calculoProducao200g.calcularPesoLiquido(pesoBruto, tara);
                
                // Verifica a tolerância
                const resultado = window.calculoProducao200g.verificarTolerancia(pesoLiquido, pesoEspecificado, tolerancia);
                
                // Exibe os resultados
                document.getElementById('valor-peso-liquido').textContent = pesoLiquido.toFixed(2) + ' g';
                document.getElementById('status-peso').textContent = resultado.status;
                document.getElementById('desvio-peso').textContent = resultado.desvio.toFixed(2) + '%';
                
                // Atualiza a fórmula
                document.getElementById('formula-bruto').textContent = pesoBruto.toFixed(2);
                document.getElementById('formula-tara').textContent = tara.toFixed(2);
                document.getElementById('formula-liquido').textContent = pesoLiquido.toFixed(2);
                
                // Atualiza os detalhes
                document.getElementById('tolerancia-min').textContent = resultado.limiteInferior.toFixed(2) + ' g';
                document.getElementById('tolerancia-max').textContent = resultado.limiteSuperior.toFixed(2) + ' g';
                document.getElementById('diferenca-abs').textContent = resultado.diferencaAbsoluta.toFixed(2) + ' g';
                
                // Exibe a área de resultado
                document.getElementById('resultado-peso200g').style.display = 'block';
                
                // Aplica estilo conforme status
                const pesoStatus = document.querySelector('.peso-status');
                pesoStatus.className = 'alert peso-status';
                pesoStatus.classList.add(resultado.statusClass);
            });
        }
        
        // Botões para limpar formulários
        document.querySelectorAll('.btn-clear').forEach(btn => {
            btn.addEventListener('click', function() {
                const area = this.closest('.calculo-area');
                const inputs = area.querySelectorAll('input:not([type="hidden"])');
                inputs.forEach(input => {
                    if (input.classList.contains('preserve-on-clear')) {
                        return;
                    }
                    input.value = '';
                });
                
                // Esconde o resultado
                const resultadoArea = area.querySelector('.resultado-area');
                if (resultadoArea) {
                    resultadoArea.style.display = 'none';
                }
            });
        });
    }
    
    console.log('ZeloCalc: Módulo de cálculos técnicos carregado com sucesso!');
    
    /**
     * Funções para cálculo de produção 200g
     */
    window.calculoProducao200g = {
        /**
         * Calcula o peso líquido da embalagem
         * @param {number} pesoBruto - Peso bruto medido em gramas
         * @param {number} tara - Peso da embalagem vazia em gramas
         * @returns {number} Peso líquido em gramas
         */
        calcularPesoLiquido: function(pesoBruto, tara) {
            return pesoBruto - tara;
        },
        
        /**
         * Verifica se o peso está dentro da tolerância
         * @param {number} pesoLiquido - Peso líquido calculado
         * @param {number} pesoEspecificado - Peso que deveria ter
         * @param {number} tolerancia - Percentual de tolerância permitido
         * @returns {object} Status e desvio do peso
         */
        verificarTolerancia: function(pesoLiquido, pesoEspecificado, tolerancia) {
            const limiteInferior = pesoEspecificado * (1 - (tolerancia / 100));
            const limiteSuperior = pesoEspecificado * (1 + (tolerancia / 100));
            const desvio = ((pesoLiquido - pesoEspecificado) / pesoEspecificado) * 100;
            
            let status, statusClass;
            
            if (pesoLiquido < limiteInferior) {
                status = 'Abaixo da tolerância';
                statusClass = 'alert-danger';
            } else if (pesoLiquido > limiteSuperior) {
                status = 'Acima da tolerância';
                statusClass = 'alert-warning';
            } else {
                status = 'Dentro da tolerância';
                statusClass = 'alert-success';
            }
            
            return {
                status,
                statusClass,
                desvio,
                limiteInferior,
                limiteSuperior,
                diferencaAbsoluta: pesoLiquido - pesoEspecificado
            };
        }
    };
    
    /**
     * Funções para cálculo de Brix Padrão
     */
    window.calculoBrix = {
        /**
         * Corrige o Brix de acordo com a temperatura
         * @param {number} brixMedido - Brix medido no refratômetro
         * @param {number} temperatura - Temperatura da amostra em °C
         * @param {string|number} fatorCorrecao - Fator de correção a aplicar
         * @returns {number} Brix corrigido
         */
        calcularBrixCorrigido: function(brixMedido, temperatura, fatorCorrecao) {
            // Determinar o fator de correção de temperatura
            const deltaTempRef = temperatura - configuracoes.brix.temperaturaRef;
            
            // Fator aproximado: a cada 1°C acima de 20°C, adicionar 0.06 ao Brix
            const correcaoTemp = deltaTempRef * 0.06;
            
            // Aplicar correção de temperatura
            let brixCorrigidoTemp = brixMedido;
            
            if (temperatura !== configuracoes.brix.temperaturaRef) {
                brixCorrigidoTemp = temperatura > configuracoes.brix.temperaturaRef 
                    ? brixMedido - correcaoTemp 
                    : brixMedido + Math.abs(correcaoTemp);
            }
            
            // Aplicar fator de correção do tipo de produto
            let fator = 1.0;
            
            if (typeof fatorCorrecao === 'string') {
                fator = configuracoes.brix.fatores[fatorCorrecao] || 1.0;
            } else if (typeof fatorCorrecao === 'number') {
                fator = fatorCorrecao;
            }
            
            const brixFinal = brixCorrigidoTemp * fator;
            
            return {
                brixOriginal: brixMedido,
                brixCorrigidoTemp: brixCorrigidoTemp,
                brixFinal: brixFinal,
                correcaoAplicada: correcaoTemp,
                fatorAplicado: fator
            };
        }
    };
    
    /**
     * Funções para cálculo de Finalização de Tanque
     */
    window.calculoFinalizacaoTanque = {
        /**
         * Calcula a quantidade de água para diluição
         * @param {number} brixAtual - Brix atual do tanque
         * @param {number} brixDesejado - Brix final desejado
         * @param {number} volumeAtual - Volume atual no tanque em litros
         * @returns {number} Volume de água a adicionar
         */
        calcularDiluicao: function(brixAtual, brixDesejado, volumeAtual) {
            // Se brixAtual ≤ brixDesejado, não é possível diluir
            if (brixAtual <= brixDesejado) {
                return {
                    possivel: false,
                    mensagem: "O Brix atual já é menor ou igual ao desejado. Não é possível diluir.",
                    formula: "Não aplicável"
                };
            }
            
            // Fórmula: V2 = V1 * (B1 / B2 - 1)
            // Onde: V2 = volume de água a adicionar, V1 = volume atual, 
            // B1 = brix atual, B2 = brix desejado
            const volumeAgua = volumeAtual * (brixAtual / brixDesejado - 1);
            const volumeFinal = volumeAtual + volumeAgua;
            
            return {
                possivel: true,
                volumeAgua: volumeAgua,
                volumeFinal: volumeFinal,
                reducaoBrix: brixAtual - brixDesejado,
                formula: `V2 = ${volumeAtual} × (${brixAtual} / ${brixDesejado} - 1) = ${volumeAgua.toFixed(2)} L`
            };
        },
        
        /**
         * Calcula a quantidade de concentrado para aumentar o Brix
         * @param {number} brixAtual - Brix atual do tanque
         * @param {number} brixDesejado - Brix final desejado
         * @param {number} volumeAtual - Volume atual no tanque em litros
         * @param {number} brixConcentrado - Brix do concentrado a adicionar
         * @returns {object} Resultados do cálculo
         */
        calcularConcentracao: function(brixAtual, brixDesejado, volumeAtual, brixConcentrado) {
            // Se brixAtual ≥ brixDesejado, não é necessário concentrar
            if (brixAtual >= brixDesejado) {
                return {
                    possivel: false,
                    mensagem: "O Brix atual já é maior ou igual ao desejado. Não é necessário adicionar concentrado.",
                    formula: "Não aplicável"
                };
            }
            
            // Se brixConcentrado ≤ brixDesejado, não é possível atingir o Brix desejado
            if (brixConcentrado <= brixDesejado) {
                return {
                    possivel: false,
                    mensagem: "O Brix do concentrado deve ser maior que o Brix desejado.",
                    formula: "Não aplicável"
                };
            }
            
            // Fórmula: V2 = V1 * (B2 - B1) / (B3 - B2)
            // Onde: V2 = volume de concentrado, V1 = volume atual, 
            // B1 = brix atual, B2 = brix desejado, B3 = brix concentrado
            const volumeConcentrado = volumeAtual * (brixDesejado - brixAtual) / (brixConcentrado - brixDesejado);
            const volumeFinal = volumeAtual + volumeConcentrado;
            
            return {
                possivel: true,
                volumeConcentrado: volumeConcentrado,
                volumeFinal: volumeFinal,
                aumentoBrix: brixDesejado - brixAtual,
                formula: `V2 = ${volumeAtual} × (${brixDesejado} - ${brixAtual}) / (${brixConcentrado} - ${brixDesejado}) = ${volumeConcentrado.toFixed(2)} L`
            };
        }
    };
    
    console.log('ZeloCalc: Módulo de cálculos técnicos carregado com sucesso!');
});