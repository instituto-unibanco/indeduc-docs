---
icon: lucide/list-ordered
---
<!-- markdownlint-disable MD033 MD046 -->

# Pipelines Combinadas

O parâmetro `pipeline` aceita um único nome de módulo ou uma lista de módulos Python. Quando informada como lista, as pipelines são executadas em sequência e o dicionário `results` é acumulado de uma para a outra.

## Configuração

Em arquivo YAML:

```yaml title="config.yaml"
pipeline:
  - pipeline_um
  - pipeline_dois
```

Ou via linha de comando:

```console
$ indeduc run pipeline=[pipeline_um,pipeline_dois] ...
```

## Encadeamento de Resultados

A segunda pipeline recebe o `results` produzido pela primeira, e assim por diante. Isso permite que cada pipeline consuma os resultados das anteriores:

```python title="etapa_dois/main.py"
def main(config: Schema, results: Results) -> Results:
    dataset = results["Dataset Original"]  # produzido por pipeline_um
    ...
    return results
```

## Schemas Combinados

Os `Schema` de todos os módulos informados são combinados automaticamente em um único schema de validação. Portanto, todos os parâmetros de todas as pipelines devem estar presentes na configuração.

```python title="pipeline_um/schema.py"
from indeduc import BaseSchema

class Schema(BaseSchema):
    input_dataset: str
```

```python title="pipeline_dois/schema.py"
from indeduc import BaseSchema

class Schema(BaseSchema):
    output_dataset: str
```

```yaml title="config.yaml"
pipeline:
  - pipeline_um
  - pipeline_dois

input_dataset: s3://bucket/dados.parquet
output_dataset: s3://bucket/resultado.parquet
```
