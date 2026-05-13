---
icon: lucide/timer
---
<!-- markdownlint-disable MD033 MD046 -->

# Tempo de Execução

<!-- markdownlint-disable MD038 -->
???+ abstract "checkpoint [:fontawesome-brands-github:](https://github.com/org/indeduc/blob/main/src/indeduc/reporting/checkpoint.py "código-fonte")"
    ```
    checkpoint(previous_t=None, *, results={}, name=None)

    -- sem argumentos
    t = checkpoint()
    → float

    -- com nome e tempo de referência
    t, results = checkpoint(t, results=results, name="Carregamento")
    → tuple[float, dict]
    ```
<!-- markdownlint-enable MD038 -->

A função `checkpoint` contabiliza e reporta o tempo decorrido entre dois pontos da pipeline.

## Iniciando o Cronômetro

Sem argumentos, `checkpoint` captura o instante atual e retorna um valor de referência para o próximo checkpoint:

```python
t = checkpoint()
```

## Registrando uma Duração

Passando o tempo de referência e um nome, `checkpoint` calcula a duração desde o ponto anterior, registra no log e armazena o resultado em `results`:

```python
t, results = checkpoint(t, results=results, name="Carregamento de Dados")
```

A duração fica disponível em `results["Carregamento de Dados"]` como um objeto `Duration` e é exibida no log em minutos. O novo `t` retornado serve de referência para o próximo checkpoint.

## Exemplo Completo

```python title="main.py" hl_lines="1 6 9 14 17"
from indeduc import checkpoint, BaseSchema
from indeduc.steps import load_step, save_step
from .steps import multiplicar

def main(config: BaseSchema, results: dict) -> dict:
    t = checkpoint()

    results["Dataset Original"] = load_step(config.input_dataset)
    t, results = checkpoint(t, results=results, name="Carregamento de Dados")

    results["Dataset Multiplicado"] = multiplicar(
        results["Dataset Original"], config.coluna, config.multiplicador
    )
    t, results = checkpoint(t, results=results, name="Transformação")

    results["Dataset Salvo"] = save_step(results["Dataset Multiplicado"], config.output_dataset)
    t, results = checkpoint(t, results=results, name="Salvamento")

    return results
```
