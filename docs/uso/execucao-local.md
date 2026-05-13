---
icon: lucide/terminal
---

# Execução Local

## 1. Instalando o indeduc

A execução do **indeduc** localmente se dá através de sua interface de linha de comando (CLI). Para isto, instale-o via `pip`:

```sh
pip install indeduc
```

Verifique o sucesso da instalação com o comando `indeduc -v`:

```console
$ indeduc -v
  indeduc version 0.1.0
```

## 2. Instalando uma pipeline

As pipelines **indeduc** são expressas em módulos Python que também podemos instalar via `pip`. Confira nossa [**Biblioteca de Pipelines**](../pipelines/biblioteca.md) para conhecer algumas das pipelines disponíveis ou siga nosso guia para a [**Criar sua própria Pipeline**](../custom/construcao.md).

```console
$ pip install <pacote-de-pipelines>
Successfully installed <pacote-de-pipelines>-0.14.2
```

## 3. Executando uma pipeline

Em qualquer execução do **indeduc** devemos informar o argumento `pipeline`, indicando o módulo a ser executado:

=== "Pipeline simples"

    ```console
    $ indeduc run pipeline=<pacote-de-pipelines>.<alpha>
    Pipeline <pacote-de-pipelines>.<alpha> executed successfully!
    ```

=== "Pipelines combinadas"

    ```console
    $ indeduc run pipeline=[<pacote-de-pipelines>.<alpha>,<pacote-de-pipelines>.<beta>]
    Pipeline <pacote-de-pipelines>.<alpha> & <pacote-de-pipelines>.<beta> executed successfully!
    ```

## 4. Configurando uma pipeline

Normalmente, uma pipeline é definida de forma parametrizada. Ou seja, é necessário customizar parâmetros no momento da execução. Podemos fazer isto de duas formas:

- [Linha de Comando](#linha-de-comando) — parâmetros informados diretamente no comando de execução
- [Arquivo de Configuração](#arquivos-de-configuracao) — parâmetros definidos em um arquivo YAML ou JSON

### Linha de Comando

Qualquer argumento no formato `param=valor` adicionado ao comando `indeduc run` é repassado diretamente para a configuração da pipeline.

Considere uma pipeline `<pacote-de-pipelines>.<alpha>` que espera os parâmetros `coluna`, `multiplicador`, `input_dataset` e `output_dataset`. Para que a coluna `nota` do arquivo `input.csv` seja multiplicada por `2` e o resultado seja salvo em `output.parquet`, podemos executar:

```sh
indeduc run pipeline=<pacote-de-pipelines>.<alpha> \
  coluna=nota multiplicador=2 \
  input_dataset=input.csv output_dataset=output.parquet
```

### Arquivos de Configuração { #arquivos-de-configuracao }

A quantidade de parâmetros de uma pipeline pode crescer rapidamente. Por isto,  é preferível definir parâmetros em um arquivo de configuração. Neste caso, podemos utilizar a opção `--config` ou `-c` com o caminho para o arquivo de configuração em formato `json` ou `yaml`. Desta forma, o comando de execução acima é equivalente a:

```sh
indeduc run -c config.yaml
```

Onde o arquivo de configuração tem o seguinte conteúdo:

=== "Pipeline simples"

    ```yaml title="config.yaml"
    pipeline: <pacote-de-pipelines>.<alpha>
    coluna: nota
    multiplicador: 2
    input_dataset: input.csv
    output_dataset: output.parquet
    ```

=== "Pipelines combinadas"

    ```yaml title="config-combinada.yaml"
    pipeline:
      - <pacote-de-pipelines>.<alpha>
      - <pacote-de-pipelines>.<beta>
    coluna: nota
    multiplicador: 2
    input_dataset: input.csv
    output_dataset: output.parquet
    ```

    !!! warning "Schemas combinados"
        Ao utilizar pipelines combinadas, todos os parâmetros são mesclados em um único schema de validação. Saiba mais em [Pipelines Combinadas](../custom/combinadas.md).

=== "Pipeline simple em JSON"

    ```json title="config.json"
    {
      "pipeline": "<pacote-de-pipelines>.<alpha>",
      "coluna": "nota",
      "multiplicador": 2,
      "input_dataset": "input.csv",
      "output_dataset": "output.parquet"
    }
    ```

!!! info "Localização do arquivo de configuração"
    O arquivo de configuração pode estar em uma pasta local, em um bucket S3 (`s3://`) ou no Google Cloud Storage (`gs://`).

!!! tip "Sobrescrita de parâmetros do arquivo de configuração"
    Parâmetros definidos via linha de comando sobrescrevem os parâmetros do arquivo de configuração.
    Por exemplo, para atualizar o valor do parâmetro `multiplicador` de 2 para 3:

    ```sh
    indeduc run -c config.yaml multiplicador=3
    ```
