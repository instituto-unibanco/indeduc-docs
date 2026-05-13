---
icon: lucide/play
---

# Preparação para Execução

Uma pipeline **indeduc** pode ser executada de duas formas:

- **[Pacote Python](#pacote-python)** — execução direta no ambiente local, ideal para desenvolvimento e testes.
- **[Imagem Docker](#imagem-docker)** — execução em container, recomendada para produção e integração com outros sistemas.

## Pacote Python

Para executar uma pipeline com o **indeduc**, é preciso que ela esteja disponível como um pacote Python no seu ambiente de execução.

Caso a execução seja feita no contexto do ambiente virtual criado pelo `uv` na seção anterior, ela já está pronta para o uso, sob o nome de `seu_projeto`.

Para confirmar que tanto o pacote **indeduc** quanto o pacote `seu_projeto` estejam disponíveis, execute o seguinte comando:

```console
$ uv pip show indeduc seu_projeto
Name: indeduc
Version: 0.1.0
Location: ...
Editable project location: ...
Requires: ...
Required-by: ...
---
Name: seu_projeto
Version: 0.1.0
Location: ...
Requires: ...
Required-by: ...
```

Caso a biblioteca não esteja disponível no seu ambiente, o retorno será semelhante ao seguinte:

```console
$ uv pip show indeduc seu_projeto
warning: Package(s) not found for: seu-projeto
...
```

Neste caso, revise as instruções de uso de ambientes virtuais do `uv` em: [docs.astral.sh/uv/concepts/projects/run/](https://docs.astral.sh/uv/concepts/projects/run/)

Para a execução da pipeline em produção, recomendamos que considere a publicação da sua biblioteca em um repositório como o [PyPI](https://pypi.org/). Siga a documentação do `uv` para saber mais sobre a publicação de pacotes Python: [docs.astral.sh/uv/guides/package](https://docs.astral.sh/uv/guides/package/).

## Imagem Docker

Para executar a sua pipeline utilizando containers, devemos criar um arquivo `Dockerfile` na raíz do projeto:

```sh hl_lines="4"
seu-projeto/
  README.md
  pyproject.toml
  Dockerfile
  src/
    seu_projeto/
      ...
```

A partir da imagem oficial do **indeduc**, incluímos e instalamos a biblioteca recém-criada:

```dockerfile title="Dockerfile"
FROM ghcr.io/instituto-unibanco/indeduc:latest
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY README.md ./
COPY pyproject.toml ./pyproject.toml
COPY src/seu_projeto ./src/seu_projeto

RUN uv sync

ENTRYPOINT ["uv", "run", "indeduc", "pipeline=seu_projeto"]
```

Prosseguimos com o build da imagem, executando o seguinte comando na raíz do projeto:

```sh
docker build -t seu-projeto .
```

Sua imagem docker estará então pronta para execução com o seguinte comando:

```sh
docker run seu-projeto -c config.yaml
```
