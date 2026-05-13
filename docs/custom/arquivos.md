---
icon: lucide/file-spreadsheet
---
<!-- markdownlint-disable MD033 MD046 -->

# Interação com Arquivos

<!-- markdownlint-disable MD038 -->
???+ abstract "load_step [:fontawesome-brands-github:](https://github.com/org/indeduc/blob/main/src/indeduc/steps/load_step.py "código-fonte")"
    ```
    load_step(path, format=None, **kwargs)

    path     : str              arquivo ou diretório (local, s3:// ou gs://)

    -- opcionais
    format   : str              formato do arquivo
                                - inferido pela extensão se omitido
                                - assume "parquet" como padrão se for um diretório
    **kwargs :                  repassados à função de leitura do Ray
    ```

???+ abstract "save_step [:fontawesome-brands-github:](https://github.com/org/indeduc/blob/main/src/indeduc/steps/save_step.py "código-fonte")"
    ```
    save_step(ds, path, format=None)

    ds     : IndeducDataset     resultado a ser salvo
    path   : str                arquivo ou diretório (local, s3:// ou gs://)

    -- opcionais
    format : str                formato do arquivo
                                - inferido pela extensão se omitido
                                - assume "parquet" como padrão se for um diretório
    ```
<!-- markdownlint-enable MD038 -->

O **indeduc** oferece utilitários para a leitura e escrita de datasets: `load_step` e `save_step`. Ambos detectam automaticamente o formato do arquivo pela extensão do caminho, suportam armazenamento local, AWS S3 (`s3://`) e Google Cloud Storage (`gs://`), e integram-se ao fluxo de resultados da pipeline como qualquer outro `@step`.

## Leitura de Arquivos

A função `load_step` carrega um arquivo e retorna um dataset distribuído pronto para processamento.

```python
from indeduc.steps import load_step

results["Dataset Original"] = load_step(config.input_dataset)
```

O formato é inferido automaticamente pela extensão do arquivo. Os formatos suportados são os disponíveis no [Ray Data](https://docs.ray.io/en/latest/data/api/input_output.html): `csv`, `parquet`, `json`, entre outros.

Quando a extensão não for suficiente — por exemplo, num arquivo sem extensão — use o parâmetro `format`:

```python
results["Dataset"] = load_step(config.input_dataset, format="csv")
```

Argumentos adicionais são repassados diretamente à função de leitura do Ray. Por exemplo, para definir o delimitador de um CSV:

```python
import pyarrow.csv as pa_csv

results["Dataset"] = load_step(
    config.input_dataset,
    parse_options=pa_csv.ParseOptions(delimiter=";")
)
```

## Escrita de Arquivos

A função `save_step` persiste um dataset em disco ou em armazenamento remoto.

```python
from indeduc.steps import save_step

results["Dataset Salvo"] = save_step(results["Dataset Transformado"], config.output_dataset)
```

O formato é inferido pela extensão do caminho de destino. Quando o caminho não tiver extensão, o formato padrão é `parquet`. Use o parâmetro `format` para forçar um formato específico:

```python
results["Dataset Salvo"] = save_step(
    results["Dataset Transformado"],
    config.output_dataset,
    format="csv"
)
```
