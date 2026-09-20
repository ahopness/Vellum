<div align="center">
  <p><h2>Vellum</h2></p>
  <p><h3>Sua solução para publicação & credenciamento acadêmico.</h3></p>
  <img width="256" height="256" alt="logo" src="https://github.com/user-attachments/assets/b4b19ced-37bf-4b95-905f-26d48a8eeeda" />
  <br><br>
</div>

**TRIVIA**: Eu fiz esse app a pedido pessoal da minha mãe, ela ia fazer uma palestra pros servidores da área da saúde da nossa cidade mas estava sem uma forma fácil e rápida de emitir a lista de presença e os certificados da palestra, então coloquei as mãos a obra e montei o Vellum e + ou - 4 horas usando o Gemini 3.8. A modelagem de dados, as escolhas técnicas, o DevOps e o QA ficaram por minha conta mas o código em si ficou por conta da LLM, um dia eu devo refazer esse app eu mesmo escrevendo o código na mão, mas por enquanto o site ta funcionando perfeitamente e sem gastar um tostão sequer (obrigado cloudflare, obrigado resend).

## Screenshots
<div align="center">
  <img width="400" alt="Screenshot 2026-09-19 at 18-25-32 " src="https://github.com/user-attachments/assets/23fb1821-55d4-4b5d-85a6-ce263c7266a5" />
  <img width="400" alt="Screenshot 2026-09-19 at 18-34-24 " src="https://github.com/user-attachments/assets/c9a0398d-bd37-4568-964c-d2ed2b8d0c8f" />
  <img width="400" alt="Screenshot 2026-09-19 at 18-28-23 " src="https://github.com/user-attachments/assets/6f8ca616-e311-4de7-a9e6-298ceb52b5f3" />
  <img width="400" alt="Screenshot 2026-09-19 at 18-31-56 " src="https://github.com/user-attachments/assets/53826de4-7792-466f-a3e7-8beb856d1ed2" />
  <img width="400" alt="Screenshot 2026-09-19 at 18-31-10 " src="https://github.com/user-attachments/assets/aec37587-3d18-4e2a-8705-8e39ff11ce07" />
  <img width="400" alt="Screenshot 2026-09-19 at 18-31-40 " src="https://github.com/user-attachments/assets/e6424985-6d73-4123-9cc1-10edd9e8629a" />
</div>



## Funções Principais
- **LGPD por Design (Zero Retenção de CPF)**: O CPF do participante nunca trafega nem é armazenado nos servidores. O hash unidirecional SHA-256 é computado para garantir a unicidade de presença de forma anônima e irreversível.
- **Emissão Instantânea de Certificados via Cliente**: Renderização de PDFs em alta fidelidade diretamente no navegador via `pdf-lib`, fundindo metadados do evento, código de autenticidade e dados do participante instantaneamente sem sobrecarga no servidor.
- **Calibração Visual com Mira Reticular**: Ferramenta interativa de ajuste milimétrico para posicionar campos (nome do participante, data, autenticação e carga horária) sobre o template PDF do certificado.
- **Credenciamento Ágil via QR Code**: Validação pontual de presenças para eventos presenciais com controle de janela temporal de tolerância (±15 minutos em relação ao horário do evento).
- **Autenticação Passwordless Segura (Magic Links)**: Acesso administrativo sem senhas via tokens criptográficos descartáveis de uso único enviados por e-mail com a API do Resend e sessões assinadas com HMAC via cookies `HttpOnly`.
- **Exportação Segura de Listas de Presença**: Download de relatórios em formato CSV sanitizado contra vulnerabilidades de injeção de fórmulas (*CSV Formula Injection*).
- **Arquitetura Serverless de Custo Zero**: Implementação nativa sobre a infraestrutura da Cloudflare (Pages, Cloudflare D1 SQLite e Cloudflare R2 Object Storage), com suporte a fallback local via Node 24 SQLite.

## Diretórios do Projeto
```
Vellum/
├── migrations/                  # Definição do schema relacional
├── static/                      # Ícones  da interface
├── src/
│   ├── lib/
│   │   ├── components/          # Componentes visuais Svelte 5 (Header, FormField, etc.)
│   │   ├── server/              # Módulos de infraestrutura e regras de backend
│   │   └── utils/               # Utilitários de negócio e formatação
│   └── routes/                  # Rotas e páginas do SvelteKit
│       ├── admin/               # Módulos de gestão restrita
│       │   ├── login/           # Solicitação e disparo do Magic Link
│       │   ├── auth/verify/     # Validação e consumo do token de acesso
│       │   ├── logout/          # Encerramento de sessão
│       │   └── events/          # Criação, edição, exclusão e calibração de eventos
│       ├── api/                 # Endpoints REST e streaming de arquivos
│       │   ├── attendance/      # Registro de presença (anônimo via SHA-256)
│       │   ├── export-csv/      # Download de relatório seguro de participantes
│       │   └── files/           # Proxy de entrega de logos e templates do R2
│       ├── e/[id]/              # Interface de credenciamento do participante (QR Code)
│       └── politica-de-privacidade/ # Termos de privacidade e conformidade LGPD
```

## Tecnologias e Bibliotecas

| Tecnologia / Biblioteca | Finalidade no Vellum |
|---|---|
| **SvelteKit 2 & Svelte 5 (Runes)** | Framework reativo de alta performance com arquitetura baseada em Runes (`$state`, `$derived`, `$props`). |
| **Tailwind CSS v4** | Estilização utilitária de última geração configurada para a estética editorial *anti-card*. |
| **Cloudflare Pages & Workers** | Hospedagem *edge serverless* de latência ultrabaixa e escalabilidade sob demanda com custo zero. |
| **Cloudflare D1 (SQLite)** | Banco de dados relacional distribuído com suporte a migrações automáticas e fallback para `node:sqlite`. |
| **Cloudflare R2 Storage** | Armazenamento de objetos compatível com S3 para logos institucionais e templates de certificados. |
| **pdf-lib** | Manipulação e desenho de vetores e tipografia sobre PDFs diretamente na memória do cliente (*client-side*). |
| **qrcode** | Geração vetorial de códigos QR para leitura rápida de links de credenciamento. |
| **Resend API** | Serviço transacional de entrega de e-mails para autenticação passwordless (*Magic Links*). |
| **Zod** | Validação rigorosa de esquemas de dados de entrada e formulários em tempo de compilação e execução. |
| **Lucide Svelte** | Pacote de ícones minimalistas em formato SVG. |

## Ambiente e Execução Local

### Pré-requisitos
- **Node.js**: v24.x ou superior
- **NPM**: v10.x ou superior

## Configuração do Ambiente e Variáveis

Para a execução local e publicação na Cloudflare Pages, configure as variáveis de ambiente necessárias. Em ambiente de desenvolvimento local, crie um arquivo `.env` na raiz do projeto baseado no exemplo abaixo:

```env
# URL base da aplicação
PUBLIC_APP_URL=http://localhost:5173

# Chave secreta de no mínimo 32 caracteres para assinatura HMAC dos cookies de sessão
SESSION_SECRET=vellum-dev-session-secret-key-32-chars-long!

# Credenciais do Resend (Opcional em ambiente local; se omitido, os Magic Links serão exibidos no terminal)
RESEND_API_KEY=re_sua_chave_aqui
RESEND_FROM_EMAIL=Vellum <onboarding@resend.dev>
```

### Variáveis no Cloudflare Pages (Produção)
No painel da Cloudflare (*Settings > Environment Variables* do projeto Pages):
- `NODE_VERSION`: `24`
- `PUBLIC_APP_URL`: URL oficial da sua aplicação (ex: `https://vellum.lucasangelo.dev/`)
- `SESSION_SECRET`: Chave criptográfica aleatória e secreta (adicionada como *Secret*)
- `RESEND_API_KEY`: Chave de API da sua conta Resend (adicionada como *Secret*)
- `RESEND_FROM_EMAIL`: E-mail de remetente validado no Resend (ex: `Vellum <eventos@seudominio.com>`)

As configurações de banco de dados (`d1_databases`) e bucket de arquivos (`r2_buckets`) estão declaradas no arquivo `wrangler.toml`.
