---
icon: lucide/container
---

# Execução em Containers

Ao invés de instalar todas as dependências localmente como descrito na [**seção anterior**](execucao-local.md), podemos executar pipelines em containers. Note que as pipelines da [**Biblioteca de Pipelines**](../pipelines/biblioteca.md) informam o endereço de uma imagem Docker para sua utilização. Assim, para executar, por exemplo, a pipeline de [**Privacidade de Dados**](../pipelines/privacidade.md), podemos começar baixando a sua imagem Docker com:

```sh
docker pull ghcr.io/instituto-unibanco/privacidade
```

## Armazenamento Local

Para executá-la, precisamos que os arquivos necessários estejam visíveis de dentro do container. Uma alterntiva é mapear o diretório local para o diretório `/indeduc` dentro do container. A mesma lógica de parâmetros da execução local é válida neste caso:

```sh
docker run -v "$(pwd)":/indeduc \
  ghcr.io/instituto-unibanco/privacidade -c config.yaml
```

## Armazenamento na Nuvem

Para lidar com arquivos armazenados na nuvem, passos adicionais de autenticação são necessários.

### AWS S3

No [Console da AWS](https://console.aws.amazon.com/iam) em **IAM → Usuários → Credenciais de segurança → Criar chave de acesso**. Crie um arquivo `aws.env` com as credenciais de acesso ao bucket:

```env title="aws.env"
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=...
```

Passe o arquivo ao container com `--env-file`:

```sh
docker run --env-file aws.env \
  ghcr.io/instituto-unibanco/privacidade \
  input_folder=s3://bucket-name/input.csv \
  output_folder=s3://bucket-name/output.parquet
```

!!! warning "Na nuvem"
    Em ambientes AWS prefira **IAM Roles**. O container herda automaticamente as permissões da instância — sem credenciais explícitas em `aws.env`.

### Google Cloud Storage

No [Console do Google Cloud](https://console.cloud.google.com/iam-admin/serviceaccounts) gere e baixe uma chave no formato JSON (**Contas de serviço → Chaves → Adicionar chave → JSON**).

Monte o arquivo no container e informe seu caminho via variável de ambiente:

```sh
docker run \
  -v $(pwd)/gcp-key.json:/indeduc/gcp-key.json \
  -e GOOGLE_APPLICATION_CREDENTIALS="/indeduc/gcp-key.json" \
  ghcr.io/instituto-unibanco/privacidade \
  input_folder=gs://bucket-name/input.csv \
  output_folder=gs://bucket-name/output.parquet
```
