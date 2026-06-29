# 🌐 Língua — Plataforma de Idiomas com IA

Plataforma web de aprendizado de idiomas com IA, teste de nível, trilha personalizada e áudio.

---

## ✅ Funcionalidades

- **Teste de nível** automático (A1 → C1)
- **Trilha personalizada** por nível e tema
- **5 idiomas**: Inglês, Espanhol, Francês, Alemão, Italiano
- **8 temas**: Teologia, Negócios, Viagens, Acadêmico, Tech, Cotidiano, Saúde, Cultura
- **Correções gramaticais** com explicação em português
- **Tradução** de cada resposta
- **Vocabulário** destacado por sessão
- **Áudio**: fala por voz (microfone) e escuta a pronúncia correta (🔊)
- **XP e progresso** salvos no navegador

---

## 🚀 Como colocar no ar (passo a passo)

### 1. Crie sua conta na Anthropic (API key)

1. Acesse: https://console.anthropic.com
2. Crie uma conta (gratuito)
3. Vá em **API Keys** → **Create Key**
4. Copie a chave (começa com `sk-ant-...`)
5. Adicione créditos: mínimo $5 (dura meses para uso pessoal)

### 2. Instale o projeto localmente

```bash
# Clone ou baixe a pasta lingua-app
cd lingua-app

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.example .env.local

# Abra .env.local e cole sua chave:
# ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

### 3. Teste localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

### 4. Publique na Vercel (gratuito)

1. Crie conta em: https://vercel.com (gratuito)
2. Instale a CLI: `npm i -g vercel`
3. Na pasta do projeto: `vercel`
4. Siga as instruções (Enter em tudo)
5. No painel da Vercel, vá em **Settings → Environment Variables**
6. Adicione: `ANTHROPIC_API_KEY` = sua chave
7. Faça redeploy: `vercel --prod`

Pronto! Você terá uma URL como `https://lingua-app.vercel.app`

---

## 💰 Custos

| Serviço | Custo |
|---|---|
| Vercel (hospedagem) | **Gratuito** |
| Anthropic API (uso pessoal) | ~R$5–15/mês |
| Domínio próprio (opcional) | ~R$40/ano |

---

## 🔧 Estrutura do projeto

```
lingua-app/
├── pages/
│   ├── index.js          # Redireciona para onboarding ou app
│   ├── onboarding.js     # Fluxo inicial: nome, idioma, tema, teste de nível
│   ├── app.js            # Interface principal de conversação
│   └── api/
│       └── chat.js       # Backend: chama a API da Anthropic
├── lib/
│   ├── constants.js      # Idiomas, temas, fases, perguntas do teste
│   └── storage.js        # Salva/lê progresso no localStorage
└── styles/
    └── globals.css       # Estilos globais
```

---

## 🎯 Próximos passos (Fase 2)

- [ ] Login de usuários (Supabase)
- [ ] Progresso salvo na nuvem
- [ ] Planos gratuito/premium
- [ ] Exercícios específicos (vocabulário, gramática)
- [ ] Histórico de sessões
- [ ] Dashboard de evolução
