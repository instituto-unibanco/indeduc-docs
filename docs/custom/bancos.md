---
icon: lucide/database
---
<!-- markdownlint-disable MD033 MD038 MD046 -->

# Interação com Bancos de Dados

<!-- markdownlint-disable MD038 -->
???+ abstract "query_step [:fontawesome-brands-github:](https://github.com/org/indeduc/blob/main/src/indeduc/steps/query_step.py "código-fonte")"
    ```
    query_step(spark, database, query)

    spark    : SparkSession (pyspark)       sessão Spark ativa (results["Spark"])
    database : Database (indeduc)           configuração da base de dados
    query    : str                          consulta SQL a ser executada
    ```

???+ abstract "insert_step [:fontawesome-brands-github:](https://github.com/org/indeduc/blob/main/src/indeduc/steps/insert_step.py "código-fonte")"
    ```
    insert_step(sdf, database, table, spark_params=SparkParameters())

    sdf          : DataFrame (pyspark)          DataFrame Spark a ser inserido
    database     : Database (indeduc)           configuração da base de dados
    table        : str                          nome da tabela de destino

    -- opcionais
    spark_params : SparkParameters (indeduc)    parâmetros Spark
                                                - batchsize (padrão: 1000)
                                                - mode (padrão: "ErrorIfExists")
    ```
<!-- markdownlint-enable MD038 -->

O **indeduc** oferece utilitários para leitura e escrita em bases de dados relacionais via JDBC: `query_step` e `insert_step`. Ambos requerem uma sessão Spark ativa — inicializada automaticamente quando `spark` está configurado no schema — e uma configuração de banco do tipo `Database`.

## Sessão Spark

O **indeduc** inicializa automaticamente uma sessão Spark em `results["Spark"]` quando o parâmetro `spark` está presente no schema da pipeline.

```py title="schema.py"
from indeduc import BaseSchema
from indeduc.schemas import SparkParameters

class Schema(BaseSchema):
    spark: SparkParameters
```

```yaml title="config.yaml"
spark:
  num_executors: 2
  executor_cores: 2
  executor_memory: 4g
```

Veja como utilizar o `results["Spark"]` em [Leitura de Banco de Dados](bancos.md#leitura-de-banco-de-dados).

## Configuração do Banco

O parâmetro `database` segue o schema `Database`, que pode ser declarado diretamente no schema da pipeline:

```py title="schema.py"
from indeduc import BaseSchema
from indeduc.schemas import Database

class Schema(BaseSchema):
    database: Database
```

E configurado via YAML ou parâmetros de execução:

```yaml title="config.yaml"
database:
  name: meu_banco
  type: postgresql
  url: postgresql://host:5432/meu_banco
  user: usuario
  password: senha
```

## Leitura de Banco de Dados

A função `query_step` executa uma consulta SQL e retorna um Spark DataFrame.

```python
results["Dados"] = query_step(
    results["Spark"],
    config.database,
    "SELECT * FROM tabela WHERE ativo = true",
)
```

## Escrita em Banco de Dados

A função `insert_step` insere um DataFrame em uma tabela.

O modo de escrita é controlado pelo parâmetro `mode` de `SparkParameters` (case-insensitive):

- `ErrorIfExists` — lança erro se a tabela já existir **(padrão)**
- `Append` — insere os dados ao final da tabela existente
- `Overwrite` — substitui o conteúdo da tabela
- `Ignore` — não faz nada se a tabela já existir

```python
results["Salvo"] = insert_step(
    results["Dados"],
    config.database,
    "tabela_destino",
)
```
