---
icon: lucide/sliders-horizontal
---
<!-- markdownlint-disable MD033 MD038 MD046 -->

# Schemas

<!-- markdownlint-disable MD038 -->
???+ abstract "BaseSchema [:fontawesome-brands-github:](https://github.com/org/indeduc/blob/main/src/indeduc/schemas/base_schema.py "código-fonte")"
    ```
    class BaseSchema

    pipeline        : nome do módulo Python da pipeline
    input_folder    : diretório base para leitura de arquivos              = ""
    output_folder   : diretório base para escrita de arquivos e relatório  = ""
    report_file     : caminho do relatório, relativo a output_folder       = "report.json"
    locale          : idioma das mensagens de log                          = "pt"
    spark           : configuração do cluster Spark/RayDP                  = None
    ```
<!-- markdownlint-enable MD038 -->

## Definição de um Schema

O `Schema` de uma pipeline deve estender `BaseSchema`, que é a classe base do **indeduc** para definição de parâmetros de execução.

```py title="schema.py"
from indeduc import BaseSchema

class Schema(BaseSchema):
    input_dataset: str
    output_dataset: str
    coluna: str
    multiplicador: float
```

Neste exemplo, os atributos `input_dataset`, `output_dataset`, `coluna` e `multiplicador` são definidos pela pipeline. Os demais parâmetros — `pipeline`, `input_folder`, `output_folder`, `report_file`, `locale` e `spark` — são herdados de `BaseSchema` e podem ser configurados pelo usuário em tempo de execução sem nenhuma declaração adicional.

## Validação com Pydantic

`BaseSchema` é um `BaseModel` de [Pydantic](https://pydantic.dev/docs/validation/latest/get-started/) e portanto suporta validação declarativa de parâmetros. O **indeduc** levantará um erro de configuração antes de iniciar a pipeline caso algum valor seja inválido.

### Valores padrão

Atributos com valor padrão são opcionais na configuração — o usuário pode omiti-los e o valor definido no `Schema` será utilizado.

```python
class Schema(BaseSchema):
    coluna: str = "nota"
    multiplicador: float = 1.0
```

### Restrições de intervalo

Use `Field` para restringir valores numéricos com `gt` (maior que), `ge` (maior ou igual), `lt` (menor que) e `le` (menor ou igual). O Pydantic rejeitará valores fora do intervalo antes de a pipeline iniciar.

```python
from pydantic import Field

class Schema(BaseSchema):
    multiplicador: float = Field(default=1.0, gt=0, le=100)
    limite: int = Field(ge=0, le=1000)
```

### Validação de strings

`Field` também aceita `pattern` (expressão regular), `min_length` e `max_length` para validar strings. Útil para restringir formatos de arquivo, prefixos ou identificadores.

```python
from pydantic import Field

class Schema(BaseSchema):
    formato: str = Field(default="parquet", pattern=r"^(parquet|csv|json)$")
    prefixo: str = Field(min_length=1, max_length=50)
```

### Tipos literais e enums

`Literal` restringe o valor a um conjunto fixo de opções. É a forma mais simples de validar parâmetros categóricos sem definir um enum.

```python
from typing import Literal

class Schema(BaseSchema):
    ambiente: Literal["dev", "staging", "prod"] = "dev"
    modo: Literal["overwrite", "append"] = "overwrite"
```

### Validador customizado

Para regras que envolvem mais de um atributo, use `@model_validator`. Ele é executado após a validação individual de cada campo e tem acesso ao modelo completo.

```python
from pydantic import model_validator

class Schema(BaseSchema):
    data_inicio: str
    data_fim: str

    @model_validator(mode="after")
    def check_datas(self):
        if self.data_inicio >= self.data_fim:
            raise ValueError("data_inicio deve ser anterior a data_fim.")
        return self
```
