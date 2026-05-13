---
icon: lucide/shield
---

# Privacidade de Dados

A pipeline de Privacidade de Dados realiza anonimização real de dados tabulares através de um [auto encoder](https://pt.wikipedia.org/wiki/Autocodificador_variacional). O modelo aprende uma representação latente comprimida dos dados originais e, a partir dela, reconstrói registros sintéticos que preservam as distribuições estatísticas e correlações entre variáveis — sem armazenar ou expor os dados de entrada.

Ao contrário de técnicas de pseudoanonimização (como mascaramento ou substituição de campos), esta abordagem garante que nenhum registro sintético corresponda a um indivíduo real, eliminando o risco de reidentificação.

## Uso Imediato

Crie um arquivo de configuração:

```yaml title="config.yaml"
input_dataset: input.csv
output_dataset: output.csv
```

Execute:

```sh
docker run -v "$(pwd)":/indeduc ghcr.io/instituto-unibanco/privacidade -c config.yaml
```

## Uso Avançado

### Parâmetros de Configuração

## Formulação Teórica
