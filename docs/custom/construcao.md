---
icon: lucide/hammer
---

# Construção

As pipelines de transformação de dados do **indeduc** são módulos Python independentes. Para criar módulos de pipelines, o **indeduc** oferece o comando `new`. Nesta seção, vamos explorar a estrutura de arquivos que servirão de ponto de partida para a definição de uma pipeline totalmente customizada.

## Criando uma Pipeline

Vamos criar uma pipeline chamada `minha-pipeline` com o comando `new`:

```console
$ indeduc new minha-pipeline
Creating new pipeline: minha-pipeline...
Created pipeline: minha-pipeline.
```

!!! tip "Pré-requisito"
    O comando `new` utiliza o [uv](https://docs.astral.sh/uv) internamente. Instale-o seguindo as instruções em: [docs.astral.sh/uv/getting-started/installation](https://docs.astral.sh/uv/getting-started/installation)

O comando criará a seguinte estrutura de arquivos dentro da pasta `minha-pipeline`:

```sh hl_lines="3 8 9 12"
minha-pipeline/
  README.md
  pyproject.toml
  src/
    minha_pipeline/
      __init__.py
      py.typed
      main.py
      schema.py
      steps/
        __init__.py
        multiplicar.py
```

## Estrutura dos Arquivos

A estrutura gerada é um ponto de partida funcional: a pipeline já executa do início ao fim. Os quatro arquivos destacados definem as responsabilidades centrais — configuração do pacote, parâmetros de execução, lógica de transformação e orquestração do fluxo.

### pyproject.toml

O `pyproject.toml` é o manifesto do pacote Python: define seu nome, versão e dependências. O comando `new` já configura o **indeduc** como dependência, de forma que a pipeline possa ser instalada e distribuída como qualquer biblioteca Python.

```toml title="pyproject.toml" hl_lines="4"
[project]
name = "minha-pipeline"
version = "0.1.0"
dependencies = ["indeduc"]
```

### multiplicar.py

Contém um exemplo de transformação de dados: uma função `multiplicar` decorada com `@step` que recebe e retorna um `DataFrame` do [Pandas](https://pandas.pydata.org/docs), aplicando um fator multiplicador a uma coluna específica.

```py title="steps/multiplicar.py" hl_lines="4"
from pandas import DataFrame
from indeduc import step

@step
def multiplicar(df: DataFrame, coluna: str, multiplicador: float) -> DataFrame:
    df[coluna] = df[coluna] * multiplicador
    return df
```

!!! tip "@step"
    O decorador `@step` é responsável por integrar a função com o **indeduc**, gerenciando o fluxo de dados entre as etapas da pipeline. Sempre decore as etapas da sua pipeline com ele. Saiba mais em [Etapas](etapas.md).

### schema.py

Define os parâmetros de execução da pipeline através de uma classe `Schema` que estende `BaseSchema`. Cada atributo corresponde a um parâmetro configurável pelo usuário.

```py title="schema.py" hl_lines="3"
from indeduc import BaseSchema

class Schema(BaseSchema):
    input_dataset: str
    output_dataset: str
    coluna: str
    multiplicador: float
```

!!! warning "Importante"
    É obrigatório que esta classe se chame `Schema` e esteja definida em um arquivo `schema.py`. Saiba mais em [Schemas](schemas.md).

### main.py

Define o fluxo principal da pipeline, combinando os passos de carregamento, transformação e salvamento dos dados.

```py title="main.py" hl_lines="7 19"
from indeduc import Results
from indeduc.steps import load_step, save_step

from .schema import Schema
from .steps import multiplicar

def main(config: Schema, results: Results) -> Results:
    # Carregar o dataset
    results["Dataset Original"] = load_step(config.input_dataset)

    # Multiplicar a coluna do dataset
    results["Dataset Multiplicado"] = multiplicar(
        results["Dataset Original"], config.coluna, config.multiplicador
    )

    # Salvar o dataset multiplicado
    results["Dataset Salvo"] = save_step(config.output_dataset)

    return results
```

!!! warning "Importante"
    O nome e assinatura da função `main` não devem ser alterados.

A função `main` recebe a configuração tipada via `config` e retorna o dicionário `results` com os resultados de cada etapa. As funções `load_step` e `save_step` são utilitários do **indeduc** para carregamento e persistência de datasets. Para saber mais, consulte [Interação com Arquivos](arquivos.md).
