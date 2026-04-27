---
data: 2026-04-27
horario: 17:42
origem: Antigravity / Gemini 3 Flash
---

# DOCUMENTAÇÃO TÉCNICA: EDIÇÃO DE SUBTÍTULO E LINK DO PORTFÓLIO NA CL.HTML

## PROBLEMA
O subtítulo da página de Cover Letter (`cl.html`) era gerado dinamicamente concatenando o cargo e a empresa do formulário de aplicação, impossibilitando uma edição personalizada direta do texto que fica sob o nome "Felipe Conceição". Além disso, o link do portfólio no menu lateral precisava ser atualizado.

## SOLUÇÃO
Implementamos um campo dedicado para o subtítulo no sistema de conteúdo unificado e no painel administrativo.

### 1. Camada de Dados (`site-content.json`)
- Adicionadas chaves `subtitle` e `subtitle_pt` ao objeto `coverLetter`.
- Atualizado `curriculum.contactWebsite` para `https://pelimotion.vercel.app`.

### 2. Painel Administrativo (`admin/admin.js`)
- **Interface:** Adicionados campos de input "Hero Subtitle (EN/PT)" na seção de edição da Cover Letter.
- **Lógica:** Atualizada a função `saveCoverLetterToMem` para capturar e salvar esses novos campos.

### 3. Frontend (`Curriculum/private/cl.html`)
- **Link do Menu:** O link estático do portfólio foi alterado para `https://pelimotion.vercel.app`.
- **Injeção Dinâmica:** O script de carregamento agora prioriza o campo `CL.subtitle`. Se estiver presente, ele substitui o comportamento antigo de concatenação automática, suportando também a troca de idioma (EN/PT).

## COMO TESTAR
1. Acesse o Admin.
2. Vá em "Cover Letter".
3. Altere o "Hero Subtitle".
4. Salve e verifique na página `cl.html` (o texto abaixo de Felipe Conceição deve refletir a mudança).
5. Verifique se o link "Portfolio" no menu lateral aponta para `pelimotion.vercel.app`.
