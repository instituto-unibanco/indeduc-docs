---
icon: lucide/chart-bar
---

# Relatórios de Execução

Ao final de cada execução, o **indeduc** gera automaticamente um relatório consolidando o resultado de todas as etapas da pipeline. O relatório é apresentado em dois formatos: uma tabela exibida no log ao término da execução, e um arquivo JSON salvo em disco para consulta posterior. Além disso, o log completo da execução é salvo como `pipeline.log` no mesmo diretório do relatório.

## Linha de Comando

Ao executar uma pipeline com o **indeduc**, um relatório é exibido ao final da execução, conforme exemplificado abaixo:

```console
$ indeduc -c config.yaml
 ────────────────────────────────────────────────────────────────────────                                
  Etapa     Resultado    Descrição                                                             
 ──────────────────────────────────────────────────────────────────────── 
  First     ✅ Sucesso   value1 and value2                                
                                         
  Second    ✅ Sucesso                                                                        
                    
  Fourth    ⏭️  Pulado   Etapa `Fourth` foi desabilitada no arquivo de    
                         configuração                                     
                               
  Seventh   ❌ Falha     Etapa `Seventh` falhou                     
                                             
  Eighth    ✅ Sucesso                                                    
                         
  Tudo      ⌛️ Tempo     `Tudo` durou 0.12 minutos                        
 ──────────────────────────────────────────────────────────────────────── 
```

## Arquivos

Ao término da execução, dois arquivos são gerados em `output_folder`:

- `report_file` — relatório JSON com o resultado de cada etapa (padrão: `report.json`)
- `log_file` — log completo da execução (padrão: `pipeline.log`)

!!! tip "Destino dos Arquivos"
    `report_file` e `log_file` são caminhos relativos e serão concatenados com `output_folder`.

Veja um exemplo de configuração:

```yaml title="config.yaml" hl_lines="2 3 4"
pipeline: minha_pipeline
output_folder: s3://bucket-name/resultados
report_file: relatorio.json
log_file: execucao.log
```

### JSON com Sumário

Consiste em um relatório que consolida o resultado de todas as etapas da pipeline:

```json title="report.json"
[
  {
    "step": "First",
    "status": "SUCCESS",
    "details": "value1 and value2"
  },
  {
    "step": "Second",
    "status": "SUCCESS",
    "details": ""
  },
  {
    "step": "Fourth",
    "status": "SKIPPED",
    "details": "Etapa `Fourth` foi desabilitada no arquivo de configuração"
  },
  {
    "step": "Seventh",
    "status": "FAILURE",
    "details": "Etapa `Seventh` falhou"
  },
  {
    "step": "Eighth",
    "status": "SUCCESS",
    "details": ""
  },
  {
    "step": "Tudo",
    "status": "TIME",
    "details": "`Tudo` durou 0.12 minutos"
  }
]
```

### LOG de Execução

Registra cada evento da execução com timestamp, nível e origem. Um log típico tem a seguinte estrutura:

```text title="pipeline.log"
2026-04-25 08:53:13 | INFO     | indeduc.main:run:169
Running pipeline minha_pipeline with configuration in s3://bucket-name/config.yaml

2026-04-25 08:53:16 INFO worker.py -- Started a local Ray instance.

2026-04-25 08:53:18 | INFO     | indeduc.steps.step:wrapper:33
Running step_success...

2026-04-25 08:53:18 | INFO     | indeduc.steps.step:wrapper:33
Running step_second...

2026-04-25 08:53:18 | INFO     | indeduc.reporting.summarize_pipeline:summarize_pipeline:20

 ──────────────────────────────────────────────────────────── 
  Step      Status        Details                             
 ──────────────────────────────────────────────────────────── 
  First     ✅ Success    value1 and value2                   
  Second    ✅ Success    value1 and value2 | value3          
 ──────────────────────────────────────────────────────────── 

2026-04-25 08:53:18 | SUCCESS  | indeduc.main:run:247
Pipeline minha_pipeline executed successfully!
```
