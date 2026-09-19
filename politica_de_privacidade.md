# Política de Privacidade - Vellum

*Última atualização: Setembro de 2026*

A presente Política de Privacidade descreve como a plataforma **Vellum** ("nós", "sistema" ou "plataforma") trata as informações e dados pessoais coletados ao gerenciar listas de presença e emissão de certificados em eventos, seminários e aulas, em conformidade com a Lei Geral de Proteção de Dados Pessoais do Brasil (**LGPD - Lei nº 13.709/2018**).

---

## 1. Princípio da Minimização e Privacidade por Design (*Privacy by Design*)

Nossa arquitetura foi intencionalmente projetada para coletar e armazenar o **mínimo estritamente necessário** de dados pessoais para cumprir a finalidade de validação de presença acadêmica/profissional.

> **Importante para Participantes:** O seu **CPF NÃO é armazenado** nos servidores ou bancos de dados da plataforma. Ele é processado única e exclusivamente de forma temporária na memória do navegador do seu dispositivo (celular ou computador) para desenhar o texto do certificado que você baixa imediatamente.

---

## 2. Dados Pessoais Tratados e Finalidades

### 2.1. Administradores (Organizadores do Evento)

| Dado Coletado | Onde fica armazenado? | Finalidade | Base Legal (LGPD) |
| :--- | :--- | :--- | :--- |
| **Nome Completo** | Banco de dados | Identificação como organizador e emissor responsável do evento | Execução de contrato / Legítimo interesse |
| **E-mail** | Banco de dados | Envio de links de acesso seguro (*Magic Link*) e contato de suporte | Execução de contrato |
| **CPF** | Banco de dados | Validação cadastral e responsabilidade pela emissão de certificados | Cumprimento de obrigação legal / Legítimo interesse |

### 2.2. Participantes (Alunos e Convidados)

| Dado Coletado | Onde fica armazenado? | Finalidade | Base Legal (LGPD) |
| :--- | :--- | :--- | :--- |
| **Nome Completo** | Banco de dados | Registro nominal na lista de presença do evento e preenchimento do certificado | Execução de contrato / Procedimentos preliminares |
| **E-mail** | Banco de dados | Identificador para evitar presenças duplicadas no mesmo evento | Legítimo interesse / Prevenção a fraudes |
| **Data e Hora** | Banco de dados | Comprovação temporal do momento em que a presença foi registrada | Legítimo interesse / Auditoria |
| **CPF** | **Não armazenado** (Apenas local no navegador) | Inserção do número no arquivo visual do certificado (PDF/Imagem) emitido no ato | Consentimento / Execução do pedido do titular |

---

## 3. Segurança e Prevenção a Fraudes

Adotamos medidas técnicas adequadas para garantir a segurança dos dados:
1. **Comunicação Criptografada:** Todo o tráfego de dados entre o navegador e nossos servidores é realizado obrigatoriamente sob protocolo HTTPS com TLS.
2. **Autenticação Segura (*Magic Links*):** Administradores acessam o painel por links únicos enviados por e-mail, válidos por 15 minutos, eliminando riscos associados a senhas fracas ou vazadas.
3. **Janela Temporal de Presença:** O registro de presença é restrito ao período de realização do evento (com margem de tolerância de ±15 minutos), evitando registros indevidos fora de hora.
4. **Disponibilização do Certificado:** O download do certificado só é liberado no encerramento do evento (com tolerância máxima de 15 minutos antes do término).
5. **Sanitização de Entradas:** Verificação de caracteres e padrões que possam configurar injeção de fórmulas ou comandos em planilhas e exportações.

---

## 4. Compartilhamento de Dados

- **Com o Organizador do Evento:** O administrador responsável pelo evento tem acesso à lista com **Nome, E-mail e Horário de Presença** dos participantes, podendo exportar esses dados em formato `.csv` para fins de relatório acadêmico ou corporativo.
- **Com Terceiros:** Não vendemos, não alugamos e não compartilhamos dados pessoais com intermediários, parceiros comerciais ou empresas de publicidade.
- **Provedores de Infraestrutura:** Os serviços de infraestrutura em nuvem (hospedagem de páginas e banco de dados serverless) atuam estritamente como operadores técnicos sob termos de confidencialidade e segurança.

---

## 5. Retenção e Descarte de Dados

- O Vellum é uma **solução temporária** voltada a eventos pontuais.
- As listas de presença e os dados dos eventos ficam disponíveis pelo período de duração da atividade e subsequente exportação pelo organizador.
- O organizador pode excluir o evento e a lista de presença a qualquer momento através do painel.
- O participante pode solicitar formalmente a exclusão do seu registro de presença ao organizador do evento.

---

## 6. Direitos do Titular de Dados (Art. 18 da LGPD)

Em conformidade com a LGPD, os titulares de dados pessoais têm o direito de:
1. Confirmar a existência de tratamento de seus dados pessoais;
2. Acessar os dados que constam na lista de presença;
3. Solicitar a correção de dados incompletos, inexatos ou desatualizados;
4. Solicitar a eliminação dos dados tratados;
5. Revogar o consentimento, quando aplicável.

Para exercer seus direitos relativos a uma lista de presença específica, o participante poderá contatar diretamente o organizador responsável pelo evento ou a equipe de suporte do sistema.
