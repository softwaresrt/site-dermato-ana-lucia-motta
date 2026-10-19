# Versão React + React Three Fiber

Este subprojeto contém os fontes React/Vite e uma implementação de cena 3D com **@react-three/fiber + drei**, estados **Zustand**, animações **Framer Motion** e aprimoramentos de rolagem com **GSAP ScrollTrigger + Lenis**. Ele reutiliza a estrutura editorial da versão principal para manter o mesmo conteúdo acessível e fluxo de contato.

```bash
npm install
npm run dev
npm run build
```

No Vercel, escolha `react-src` como **Root Directory** e o preset **Vite**. A versão estática na pasta raiz é a alternativa pronta para publicar sem build.

**Nota de validação:** neste ambiente a rede de instalação de pacotes npm não estava disponível, então não foi possível executar nem testar o build deste subprojeto. Use a versão estática na raiz para entrega imediata; compile e teste o React antes da publicação final.
