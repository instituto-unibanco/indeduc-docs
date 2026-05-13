---
icon: lucide/square-function
---
<!-- markdownlint-disable MD033 -->

# Etapas

???+ abstract "@step [:fontawesome-brands-github:](https://github.com/org/indeduc/blob/main/src/indeduc/steps/step.py "código-fonte")"

O decorador `@step` é o bloco central de construção de uma pipeline no **indeduc**. Ele transforma qualquer função Python em uma etapa gerenciada: integra-a ao fluxo de resultados, propaga falhas de etapas anteriores e orquestra automaticamente a execução distribuída sobre datasets do [Ray Data](https://docs.ray.io/en/latest/data/index.html).

## Definindo uma Etapa

Basta decorar uma função com `@step`:

```python
from indeduc import step

@step
def minha_etapa(df, coluna: str) -> ...:
    ...
```

A função pode receber qualquer número de parâmetros. O primeiro parâmetro é tratado como o dado principal — os demais são parâmetros de configuração da transformação.

## Formatos Suportados

O **indeduc** suporta quatro formatos para o primeiro parâmetro de uma etapa. Basta declarar o tipo na assinatura da função — o **indeduc** faz o resto.

### Pandas DataFrame

A função recebe e retorna um `DataFrame`. O **indeduc** converte automaticamente cada batch do dataset distribuído para Pandas antes de chamar a função.

```python
from pandas import DataFrame
from indeduc import step

@step
def normalizar(df: DataFrame, coluna: str) -> DataFrame:
    df[coluna] = (df[coluna] - df[coluna].mean()) / df[coluna].std()
    return df
```

### PyArrow Table

A função recebe e retorna uma `pa.Table`. Indicado para transformações que aproveitam as otimizações de colunas do Arrow.

```python
import pyarrow as pa
import pyarrow.compute as pc
from indeduc import step

@step
def filtrar(table: pa.Table, coluna: str, valor: float) -> pa.Table:
    mask = pc.greater(table[coluna], valor)
    return table.filter(mask)
```

### NumPy Array

A função recebe e retorna um `np.ndarray`. Útil para transformações numéricas que operam sobre arrays.

```python
import numpy as np
from indeduc import step

@step
def escalar(batch: np.ndarray, fator: float) -> np.ndarray:
    return batch * fator
```

### Ray Dataset

A função recebe e retorna um `rd.Dataset` diretamente, sem conversão de formato. Indicado para transformações que exigem controle total sobre o dataset distribuído.

```python
import ray.data as rd
from indeduc import step

@step
def remover_duplicatas(ds: rd.Dataset) -> rd.Dataset:
    return ds.unique()
```

## Detalhes de Implementação

### Conversão de Formato

Ao decorar uma função com `@step`, a sua assinatura é inspecionada com o objetivo de identificar o formato utilizado. Quando `DataFrame`, `Table` ou `ndarray` estão declarados, o **indeduc** utiliza a função [`Dataset.map_batches()`](https://docs.ray.io/en/latest/data/api/doc/ray.data.Dataset.map_batches.html) do [Ray Data](https://docs.ray.io/en/latest/data/data.html) para executar a transformação de dados de forma distribuída nos workers do cluster.

Como comparação, uma transformação de dados utilizando diretamente o Ray teria o seguinte formato:

```python
from pandas import DataFrame
import ray.data as rd

def dobrar(df: DataFrame, coluna: str) -> DataFrame:
    df[coluna] = df[coluna] * 2
    return df

ds: rd.Dataset = rd.load_csv("file.csv")
ds_dobrado: rd.Dataset = ds.map_batches(
    dobrar, 
    batch_format="pandas", 
    fn_kwargs={"coluna": "valor"}
)
```

### Propagação de Resultados

O `@step` utiliza a biblioteca [`returns`](https://returns.readthedocs.io) para capturar o resultado da execução de uma etapa em um container tipado: `Success` em caso de sucesso ou `Failure` em caso de erro.

Antes de invocar a função, o `@step` inspeciona todos os argumentos recebidos. Caso algum seja um container `Failure` — resultado de uma etapa anterior com erro — a execução é interrompida e a falha é propagada sem que a função seja chamada. Isso garante que etapas dependentes de dados inválidos sejam automaticamente ignoradas:

```python
results["A"] = etapa_a(...)           # Failure("algo deu errado")
results["B"] = etapa_b(results["A"])  # não executada — propaga Failure de A
results["C"] = etapa_c(results["B"])  # não executada — propaga Failure de A
```

O relatório final registra cada etapa como `SUCCESS`, `SKIPPED` ou `FAILURE`, refletindo o estado do container retornado.
