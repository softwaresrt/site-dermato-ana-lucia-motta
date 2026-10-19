# Planejamento de migração para o stack solicitado

A versão publicada e imediatamente utilizável é independente de pacotes, para evitar que um build dependa de instalações externas.

Para implantação posterior em React com a stack solicitada:

```
npm create vite@latest ana-lucia-motta -- --template react
npm install three @react-three/fiber @react-three/drei gsap lenis framer-motion zustand
```

- Converter seções HTML em componentes React (`Hero`, `TreatmentMap`, `Treatments`, `Journey`, `Quiz`, `Contact`).
- Encapsular o busto procedural de `app.js` em componente `FaceScene` no Canvas de R3F. Preservar lógica de hit targets e painel acessível.
- Substituir `IntersectionObserver` por `GSAP ScrollTrigger`, com salvaguarda `prefers-reduced-motion`, e opcionalmente `Lenis`.
- Extrair estado do quiz / mapa em stores locais `Zustand`.
- Manter uma única cena 3D ativa, carregamento sob demanda e limites de pixel ratio para celulares.

Não converter a foto de uma pessoa real em simulações de resultados estéticos. Modelos de consultório devem ser aprovados pela médica e identificados como conceituais quando necessário.
