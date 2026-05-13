---
icon: lucide/cloud
---

# Execução na Nuvem

O Indeduc foi projetado para processar grandes volumes de dados de forma distribuída usando **Ray sobre Kubernetes**. Toda a infraestrutura é provisionada e destruída automaticamente via Terraform — você só precisa configurar alguns parâmetros e executar três comandos.

!!! warning "Suporte a provedores"
    Por enquanto, apenas **AWS** é suportada. O suporte a outros provedores está planejado para versões futuras.

---

## Visão Geral do Fluxo

O fluxo completo, do zero ao resultado, ocorre em **três etapas principais**:

**1. Você configura** → Define o bucket com os dados e a pipeline a ser executada em dois arquivos Terraform.

**2. O Terraform provisiona** → Cria a rede, o cluster Kubernetes e as permissões necessárias, instala o KubeRay e submete o RayJob automaticamente.

**3. O Ray executa e encerra** → Um RayCluster temporário é criado, o Indeduc processa os dados e o cluster é finalizado.

```text
Você                  Terraform              Cloud / Kubernetes
──────                ──────────             ──────────────────
Configura         →   Provisiona rede   →    Cluster Kubernetes
terraform.tfvars      Provisiona cluster →   KubeRay instalado
main.tf               Submete RayJob    →    Indeduc executa
                                        →    Cluster encerrado
```

!!! info "Infraestrutura como Código"
    Todo o provisionamento é gerenciado pelo módulo Terraform [indeduc](https://registry.terraform.io/modules/instituto-unibanco/indeduc). Você não precisa gerenciar Kubernetes diretamente.

---

## Pré-requisitos

Antes de iniciar, confirme que você possui tudo o que é necessário:

- [x] **Terraform ≥ 1.9** instalado ([instalação](https://developer.hashicorp.com/terraform/install))
- [x] **AWS CLI** instalada e configurada (`aws configure`) *(cloud atual)*
- [x] Permissões para criar os recursos necessários na cloud: rede, cluster Kubernetes, IAM e armazenamento
- [x] Um **bucket de armazenamento existente** com os arquivos de configuração e dados de entrada *(no caso da AWS, S3)*

!!! warning "O bucket de armazenamento não é criado pelo Terraform"
    O módulo assume que o bucket já existe. Crie-o antes de executar o `terraform apply`.

---

## Passo a Passo

### 1. Prepare seu bucket S3

O bucket precisa conter o arquivo de configuração da pipeline e os dados de entrada:

```text
s3://meu-bucket-indeduc/
├── config.yaml        ← configuração da pipeline
└── dados/             ← dados de entrada
```

### 2. Crie o `main.tf`

Crie um arquivo `main.tf` referenciando o módulo do Indeduc:

```hcl title="main.tf"
module "indeduc" {
  source = "instituto-unibanco/indeduc"

  project_name   = var.project_name
  entrypoint     = var.entrypoint
  s3_bucket_name = var.s3_bucket_name
}
```

Apenas as variáveis obrigatórias precisam ser declaradas explicitamente — as demais usam os valores-padrão do módulo. Consulte a [referência completa das variáveis](#referencia-das-variaveis) no final desta página.

### 3. Crie o `terraform.tfvars`

Crie um arquivo `terraform.tfvars` com os parâmetros da execução:

```hcl title="terraform.tfvars"
project_name   = "meu-projeto-indeduc"
s3_bucket_name = "meu-bucket-indeduc"
entrypoint     = "indeduc -c s3://meu-bucket-indeduc/config.yaml"
```

### 4. Inicialize o Terraform

Execute uma única vez para baixar o módulo e os providers:

```sh
terraform init
```

### 5. Valide e aplique

Revise o plano antes de criar qualquer recurso:

```sh
terraform plan
```

Se o plano estiver correto, aplique:

```sh
terraform apply
```

O Terraform irá, nesta ordem:

1. Criar a rede (VPC, subnets e security groups)
2. Provisionar o cluster Kubernetes
3. Instalar o KubeRay
4. Submeter o RayJob com o Indeduc
5. Aguardar a conclusão do processamento

### 6. Destrua a infraestrutura

!!! danger "Obrigatório após cada execução"
    O cluster Kubernetes gera custos enquanto estiver ativo. Execute `terraform destroy` assim que o processamento terminar.

```sh
terraform destroy
```

O comando remove, nesta ordem:

1. RayJob do cluster
2. Cluster Kubernetes
3. Rede (VPC, subnets e security groups)
4. Roles e policies IAM
5. Recursos de observabilidade

---

## Referência das Variáveis { #referencia-das-variaveis }

### Obrigatórias

Estas variáveis não possuem valor-padrão e **devem** ser definidas no `terraform.tfvars`:

| Variável | Tipo | Descrição |
| --- | --- | --- |
| `project_name` | `string` | Prefixo usado na nomenclatura e tagging dos recursos |
| `s3_bucket_name` | `string` | Nome do bucket S3 para os Ray jobs |
| `entrypoint` | `string` | Comando de entrada do RayJob (ex: `indeduc -c s3://bucket/config.yaml`) |

### Opcionais

Estas variáveis possuem valores-padrão e só precisam ser definidas para override:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `aws_profile` | `default` | Profile da AWS CLI usado pelo Terraform |
| `cluster_version` | `1.30` | Versão do Kubernetes no EKS |
| `compute_type` | `fargate` | Tipo de compute do EKS: `fargate` ou `ec2` |
| `container_image` | `ghcr.io/instituto-unibanco/indeduc:latest` | URI da imagem do Indeduc para os nós Ray |
| `fargate_log_stream_prefix` | `fargate-pod-` | Prefixo dos log streams do log router do Fargate |
| `head_cpu` | `1` | CPU do nó head do Ray |
| `head_memory` | `4Gi` | Memória do nó head do Ray |
| `kms_deletion_window_in_days` | `7` | Dias até a exclusão da chave KMS após agendamento |
| `kuberay_version` | `1.4.0` | Versão do KubeRay a ser instalada no cluster |
| `log_retention_in_days` | `365` | Dias de retenção dos logs no CloudWatch |
| `log_stream_prefix` | `rayjob-logs-` | Prefixo dos log streams do Fluent Bit |
| `node_instance_types` | `["m5.xlarge"]` | Tipos de instância EC2 para os node groups *(apenas `ec2`)* |
| `ray_job_template_path` | `null` | Caminho absoluto para um template `.yaml.tftpl` customizado. Quando definido, substitui os templates built-in de fargate/ec2 |
| `ray_version` | `2.48.0` | Versão do Ray usada pelo cluster e pelo RayJob |
| `region` | `us-east-1` | Região AWS onde os recursos serão criados |
| `vpc_cidr` | `10.0.0.0/16` | CIDR block da VPC |
| `worker_cpu` | `1` | CPU de cada worker do Ray |
| `worker_max_replicas` | `20` | Máximo de workers para autoscaling |
| `worker_memory` | `4Gi` | Memória de cada worker do Ray |
| `worker_min_replicas` | `1` | Mínimo de workers para autoscaling |
| `worker_replicas` | `1` | Número inicial de workers |
