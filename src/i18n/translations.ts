/**
 * Traduções do site — PT (padrão), EN, ES.
 * Chaves em camelCase; uso: t('navHome')
 */
export type TranslationKey = keyof typeof pt;

const pt = {
  // Nav & hero
  navHome: "Início",
  navWork: "Work",
  navContact: "Contato",
  heroTagline: "imagine studio.",
  ctaTalkToTressde: "Falar com a TRESSDE®",

  // Aria-labels
  ariaGoHome: "Ir para o início",
  ariaMainNav: "Navegação principal",

  // Footer
  footerPartOf: "Parte do grupo MNNO®",
  footerRights: "Todos os direitos reservados.",
  footerLetsTalk: "Vamos conversar",
  footerTalkToTeam: "Fale com nosso time",

  // Cookie banner
  cookieMessage: "Este site utiliza cookies para garantir a melhor experiência em nosso site.",
  cookiePolicy: "Política de Cookies",
  cookieAccept: "Entendi",

  // Language selector
  languageChoose: "Escolher idioma",
  languageListLabel: "Idiomas",

  // Studio section (home)
  studioTheStudio: "O estúdio",
  studioCopy:
    "TRESSDE é um estúdio feito para imaginar. Nascido no Brasil e construído para o mundo. Nossas peças de motion combinam estética ousada, execução 3D precisa e uma perspectiva cultural que dá vida às histórias.",
  studioLearnMore: "Saiba mais",

  // Portfolio grid
  filterAll: "Todos",
  casesLoadError: "Não foi possível carregar os cases no momento.",
  casesEmptyFilter: "Nenhum case encontrado para essa categoria.",
  casesEmpty: "Nenhum case publicado ainda.",
  caseViewAria: "Ver case:",

  // Studio reveal (admin message)
  studioRevealConfigure: "Configure os slots do Studio reveal em Configurações do site.",

  // Contact form
  contactTitle: "Falar com a TRESSDE®",
  contactIntro:
    "Converse com a TRESSDE e tenha um plano completo para comunicar, lançar e evoluir com consistência.",
  contactCompany: "Empresa",
  contactCompanyPlaceholder: "Nome da empresa",
  contactName: "Nome",
  contactNamePlaceholder: "Seu nome",
  contactRole: "Cargo",
  contactRolePlaceholder: "Seu cargo",
  contactEmail: "E-mail",
  contactEmailPlaceholder: "voce@empresa.com",
  contactWhatsApp: "WhatsApp",
  contactWhatsAppPlaceholder: "(11) 99999-9999",
  contactChannelPreference: "Preferência de canal",
  contactChannelEmail: "E-mail",
  contactChannelWhatsApp: "WhatsApp",
  contactSubmit: "Agendar uma conversa",
  contactSubmitting: "Enviando...",
  contactFooterNote: "Resposta em até 1 dia útil. Sem spam.",
  contactToastFillRequired: "Preencha Empresa, Nome e E-mail.",
  contactToastWhatsAppRequired: "Informe seu WhatsApp para essa preferência.",
  contactToastSuccess: "Recebido. Vamos te chamar em até 1 dia útil.",
  contactToastError: "Não conseguimos enviar agora. Tente novamente em instantes.",

  // NotFound
  notFoundTitle: "Página não encontrada",
  notFoundMessage: "Oops! Página não encontrada",
  notFoundBack: "Voltar ao início",

  // Site meta (defaults when no CMS)
  metaTitleDefault: "TRESSDE® Imagine.",
  metaDescriptionDefault: "Agência full-service para marcas que lideram a evolução do mercado.",

  // Servicos page — hero
  servicosLabel: "Serviços",
  servicosHeroLine1: "3D orientado por design",
  servicosHeroLine2: "feito para o movimento",
  servicosHeroSub:
    "Nossas peças de 3D Motion combinam design limpo, composição ousada e execução de nível mundial. Criamos sistemas de motion que parecem premium, modernos e inesquecíveis.",
  servicosHeroTagline: "Aqui é onde branding encontra cinema.",

  // Servicos — 3D Motion block
  servicos3dTitle: "3D Motion",
  servicos3dBody1:
    "Nossas peças de 3D Motion combinam design limpo, composição ousada e execução de nível mundial. Criamos sistemas de motion que parecem premium, modernos e inesquecíveis.",
  servicos3dBestFor: "Brand films, Visuais de produto hero, Motion identities, Campanhas digital-first",
  servicos3dDeliverables:
    "Animação de produto, Mundos de marca abstratos, Sistemas de motion para times de design, Filmes full CGI",
  servicos3dCta: "Explorar 3D Motion",

  // Servicos — VFX block
  servicosVfxTitle: "VFX",
  servicosVfxSubtitle: "Efeitos cinematográficos para marcas que querem parecer irreais.",
  servicosVfxBody1:
    "Criamos efeitos visuais que elevam o storytelling além da realidade.",
  servicosVfxBody2:
    "De melhorias sutis a ambientes full CGI, nosso trabalho em VFX traz emoção, escala e intensidade a cada frame.",
  servicosVfxBestFor:
    "Campanhas em filme, Lançamentos de produto, Brand storytelling, Momentos visuais irreais",
  servicosVfxDeliverables:
    "Integração CGI, Simulações (água, fumaça, partículas), Compositing e finalização, Look development cinematográfico",
  servicosVfxCta: "Explorar projetos VFX",

  // Servicos — Container acima do bloco VFX (3 cards: principal + 2 verticais)
  servicosVfxLeadTitle: "VFX",
  servicosVfxLeadDesc:
    "Efeitos visuais que elevam o storytelling além da realidade. Do cinema à publicidade, criamos momentos visuais que emocionam e escalam.",
  servicosVfxLeadCard1: "Film & TV",
  servicosVfxLeadCard2: "Marcas & Ads",

  // Servicos — AI block
  servicosAiTitle: "AI Visual Systems",
  servicosAiSubtitle: "A próxima era da produção criativa",
  servicosAiBody1: "IA não é atalho. É uma nova camada criativa.",
  servicosAiBody2:
    "Usamos IA para expandir a imaginação, acelerar a ideação e criar sistemas visuais que seriam impossíveis apenas com workflows tradicionais.",
  servicosAiBody3: "Sempre curado. Sempre dirigido. Sempre premium.",
  servicosAiBestFor:
    "Campanhas experimentais, Prototipagem visual rápida, Sistemas de conteúdo estilizado, Mundos de conceito e iteração",
  servicosAiDeliverables:
    "Desenvolvimento visual assistido por IA, Workflows híbridos de VFX, Exploração de conteúdo em alto volume, Direção criativa e refinamento",
  servicosAiCta: "Explorar projetos AI",

  // Servicos — Why TRESSDE
  servicosWhyTitle: "Por que a TRESSDE®?",
  servicosWhySub:
    "Porque execução não basta. O mundo exige bom gosto, cultura e precisão.",
  servicosWhyPillar1: "Sensibilidade de design",
  servicosWhyPillar2: "Excelência técnica",
  servicosWhyPillar3: "Storytelling cultural",
  servicosWhyPillar4: "Ofício de nível global",
  servicosWhyTagline: "Nascido no Brasil. Feito para o mundo.",

  // Servicos — Process (5 etapas em círculos sobrepostos)
  servicosProcessTitle: "Nosso processo",
  servicosProcessSub: "Da imaginação ao frame final.",
  servicosProcessStep1: "Treatment",
  servicosProcessStep2: "Storyboard e Previz",
  servicosProcessStep3: "Descoberta e Desenvolvimento",
  servicosProcessStep4: "Refinamento",
  servicosProcessStep5: "Entrega",
  servicosProcessTagline: "Rápido. Colaborativo. Preciso.",

  // Servicos — CTA
  servicosCtaTitle: "Vamos construir algo icônico",
  servicosCtaSub:
    "Se a sua marca quer criar motion que pareça cinematográfico, ousado e culturalmente afiado, precisamos conversar.",
  servicosCtaButton: "Iniciar um projeto",

  // Case page
  caseOpenInfo: "Abrir informações do projeto",
  caseInfoDialogLabel: "Informações do projeto",
  caseLabelClient: "Cliente",
  caseLabelProject: "Projeto",
  caseLabelDescription: "Descrição",
  caseLabelYear: "Ano",
  caseEscToClose: "ESC para fechar",
  caseBack: "Voltar",
  caseBackAria: "Voltar aos cases",
  caseNotFound: "Case não encontrado (ou ainda não publicado).",
  caseNoMedia: "Esse case ainda não tem mídia.",
  caseTalkToUs: "Fale com a gente",
  caseNotFoundError: "Case não encontrado.",
} as const;

const enMap: Record<TranslationKey, string> = {
  ...pt,
  navHome: "Home",
  navWork: "Work",
  navContact: "Contact",
  heroTagline: "imagine studio.",
  ctaTalkToTressde: "Talk to TRESSDE®",

  ariaGoHome: "Go to home",
  ariaMainNav: "Main navigation",

  footerPartOf: "Part of MNNO® Group",
  footerRights: "All rights reserved.",
  footerLetsTalk: "Let's Talk",
  footerTalkToTeam: "Talk to our team",

  cookieMessage:
    "This site uses cookies to ensure the best experience on our site.",
  cookiePolicy: "Cookie Policy",
  cookieAccept: "Got it",
  languageChoose: "Choose language",
  languageListLabel: "Languages",

  studioTheStudio: "The studio",
  studioCopy:
    "TRESSDE is a studio built to imagine. Born in Brazil and built for the world. Our motion pieces combine bold aesthetics, precise 3D execution and a cultural perspective that brings stories to life.",
  studioLearnMore: "Learn more",

  filterAll: "All",
  casesLoadError: "We couldn't load the cases right now.",
  casesEmptyFilter: "No cases found for this category.",
  casesEmpty: "No published cases yet.",
  caseViewAria: "View case:",
  studioRevealConfigure:
    "Configure Studio reveal slots in Site settings.",

  contactTitle: "Talk to TRESSDE®",
  contactIntro:
    "Talk to TRESSDE and get a complete plan to communicate, launch, and evolve with consistency.",
  contactCompany: "Company",
  contactCompanyPlaceholder: "Company name",
  contactName: "Name",
  contactNamePlaceholder: "Your name",
  contactRole: "Role",
  contactRolePlaceholder: "Your role",
  contactEmail: "Email",
  contactEmailPlaceholder: "you@company.com",
  contactWhatsApp: "WhatsApp",
  contactWhatsAppPlaceholder: "+1 234 567 8900",
  contactChannelPreference: "Contact preference",
  contactChannelEmail: "Email",
  contactChannelWhatsApp: "WhatsApp",
  contactSubmit: "Schedule a conversation",
  contactSubmitting: "Sending...",
  contactFooterNote: "Reply within 1 business day. No spam.",
  contactToastFillRequired: "Please fill in Company, Name and Email.",
  contactToastWhatsAppRequired: "Please provide your WhatsApp for this preference.",
  contactToastSuccess: "Received. We'll get back to you within 1 business day.",
  contactToastError: "We couldn't send it right now. Please try again in a moment.",

  notFoundTitle: "Page not found",
  notFoundMessage: "Oops! Page not found",
  notFoundBack: "Return to Home",
  metaTitleDefault: "TRESSDE® Imagine.",
  metaDescriptionDefault:
    "Full-service agency for brands that lead market evolution.",

  servicosLabel: "Services",
  servicosHeroLine1: "Design-driven 3D",
  servicosHeroLine2: "made for movement",
  servicosHeroSub:
    "Our 3D Motion pieces combine clean design, bold composition, and world-class execution. We create motion systems that feel premium, modern, and unforgettable.",
  servicosHeroTagline: "This is where branding meets cinema.",

  servicos3dTitle: "3D Motion",
  servicos3dBody1:
    "Our 3D Motion pieces combine clean design, bold composition, and world-class execution. We create motion systems that feel premium, modern, and unforgettable.",
  servicos3dBestFor:
    "Brand films, Hero product visuals, Motion identities, Digital-first campaigns",
  servicos3dDeliverables:
    "Product animation, Abstract brand worlds, Motion systems for design teams, Full CGI films",
  servicos3dCta: "Explore 3D Motion",

  servicosVfxTitle: "VFX",
  servicosVfxSubtitle: "Cinematic effects for brands that want to feel unreal.",
  servicosVfxBody1:
    "We craft visual effects that elevate storytelling beyond reality.",
  servicosVfxBody2:
    "From subtle enhancements to full CGI environments, our VFX work brings emotion, scale, and intensity to every frame.",
  servicosVfxBestFor:
    "Campaign films, Product launches, Brand storytelling, Unreal visual moments",
  servicosVfxDeliverables:
    "CGI integration, Simulations (water, smoke, particles), Compositing & finishing, Cinematic look development",
  servicosVfxCta: "Explore VFX Projects",

  servicosVfxLeadTitle: "VFX",
  servicosVfxLeadDesc:
    "Visual effects that take storytelling beyond reality. From film to advertising, we create moments that move and scale.",
  servicosVfxLeadCard1: "Film & TV",
  servicosVfxLeadCard2: "Brands & Ads",

  servicosAiTitle: "AI Visual Systems",
  servicosAiSubtitle: "The next era of creative production",
  servicosAiBody1: "AI is not a shortcut. It's a new creative layer.",
  servicosAiBody2:
    "We use AI to expand imagination, accelerate ideation, and create visual systems that would be impossible with traditional workflows alone.",
  servicosAiBody3: "Always curated. Always directed. Always premium.",
  servicosAiBestFor:
    "Experimental campaigns, Fast visual prototyping, Stylized content systems, Concept worlds & iteration",
  servicosAiDeliverables:
    "AI-assisted visual development, Hybrid VFX workflows, High-volume content exploration, Creative direction + refinement",
  servicosAiCta: "Explore AI Projects",

  servicosWhyTitle: "Why TRESSDE®?",
  servicosWhySub:
    "Because execution is not enough. The world demands taste, culture, and precision.",
  servicosWhyPillar1: "Design sensibility",
  servicosWhyPillar2: "Technical excellence",
  servicosWhyPillar3: "Cultural storytelling",
  servicosWhyPillar4: "Global-level craft",
  servicosWhyTagline: "Born in Brazil. Built for the world.",

  servicosProcessTitle: "Our process",
  servicosProcessSub: "From imagination to final frame.",
  servicosProcessStep1: "Treatment",
  servicosProcessStep2: "Storyboard & Previz",
  servicosProcessStep3: "Discovery & Development",
  servicosProcessStep4: "Refinement",
  servicosProcessStep5: "Delivery",
  servicosProcessTagline: "Fast. Collaborative. Precise.",

  servicosCtaTitle: "Let's build something iconic",
  servicosCtaSub:
    "If your brand wants to create motion that feels cinematic, bold, and culturally sharp, we should talk.",
  servicosCtaButton: "Start a Project",

  caseOpenInfo: "Open project info",
  caseInfoDialogLabel: "Project info",
  caseLabelClient: "Client",
  caseLabelProject: "Project",
  caseLabelDescription: "Description",
  caseLabelYear: "Year",
  caseEscToClose: "ESC to close",
  caseBack: "Back",
  caseBackAria: "Back to cases",
  caseNotFound: "Case not found (or not published yet).",
  caseNoMedia: "This case has no media yet.",
  caseTalkToUs: "Talk to us",
  caseNotFoundError: "Case not found.",
};

const esMap: Record<TranslationKey, string> = {
  ...pt,
  navHome: "Inicio",
  navWork: "Work",
  navContact: "Contacto",
  heroTagline: "imagine studio.",
  ctaTalkToTressde: "Hablar con TRESSDE®",

  ariaGoHome: "Ir al inicio",
  ariaMainNav: "Navegación principal",

  footerPartOf: "Parte del grupo MNNO®",
  footerRights: "Todos los derechos reservados.",
  footerLetsTalk: "Hablemos",
  footerTalkToTeam: "Habla con nuestro equipo",

  cookieMessage:
    "Este sitio utiliza cookies para garantizar la mejor experiencia.",
  cookiePolicy: "Política de cookies",
  cookieAccept: "Entendido",
  languageChoose: "Elegir idioma",
  languageListLabel: "Idiomas",

  studioTheStudio: "El estudio",
  studioCopy:
    "TRESSDE es un estudio hecho para imaginar. Nacido en Brasil y construido para el mundo. Nuestras piezas de motion combinan estética audaz, ejecución 3D precisa y una perspectiva cultural que da vida a las historias.",
  studioLearnMore: "Saber más",

  filterAll: "Todos",
  casesLoadError: "No pudimos cargar los cases en este momento.",
  casesEmptyFilter: "Ningún case encontrado en esta categoría.",
  casesEmpty: "Aún no hay cases publicados.",
  caseViewAria: "Ver case:",
  studioRevealConfigure:
    "Configura los slots del Studio reveal en Configuración del sitio.",

  contactTitle: "Hablar con TRESSDE®",
  contactIntro:
    "Habla con TRESSDE y obtén un plan completo para comunicar, lanzar y evolucionar con consistencia.",
  contactCompany: "Empresa",
  contactCompanyPlaceholder: "Nombre de la empresa",
  contactName: "Nombre",
  contactNamePlaceholder: "Tu nombre",
  contactRole: "Cargo",
  contactRolePlaceholder: "Tu cargo",
  contactEmail: "E-mail",
  contactEmailPlaceholder: "tu@empresa.com",
  contactWhatsApp: "WhatsApp",
  contactWhatsAppPlaceholder: "+34 612 345 678",
  contactChannelPreference: "Preferencia de canal",
  contactChannelEmail: "E-mail",
  contactChannelWhatsApp: "WhatsApp",
  contactSubmit: "Agendar una conversación",
  contactSubmitting: "Enviando...",
  contactFooterNote: "Respuesta en hasta 1 día hábil. Sin spam.",
  contactToastFillRequired: "Completa Empresa, Nombre y E-mail.",
  contactToastWhatsAppRequired: "Indica tu WhatsApp para esta preferencia.",
  contactToastSuccess: "Recibido. Te contactaremos en hasta 1 día hábil.",
  contactToastError:
    "No pudimos enviar ahora. Intenta de nuevo en un momento.",

  notFoundTitle: "Página no encontrada",
  notFoundMessage: "¡Ups! Página no encontrada",
  notFoundBack: "Volver al inicio",
  metaTitleDefault: "TRESSDE® Imagine.",
  metaDescriptionDefault:
    "Agencia full-service para marcas que lideran la evolución del mercado.",

  servicosLabel: "Servicios",
  servicosHeroLine1: "3D orientado por diseño",
  servicosHeroLine2: "hecho para el movimiento",
  servicosHeroSub:
    "Nuestras piezas de 3D Motion combinan diseño limpio, composición audaz y ejecución de nivel mundial. Creamos sistemas de motion que se sienten premium, modernos e inolvidables.",
  servicosHeroTagline: "Aquí es donde la marca se encuentra con el cine.",

  servicos3dTitle: "3D Motion",
  servicos3dBody1:
    "Nuestras piezas de 3D Motion combinan diseño limpio, composición audaz y ejecución de nivel mundial. Creamos sistemas de motion premium, modernos e inolvidables.",
  servicos3dBestFor:
    "Brand films, Hero product visuals, Motion identities, Campañas digital-first",
  servicos3dDeliverables:
    "Animación de producto, Mundos de marca abstractos, Sistemas de motion para equipos de diseño, Films full CGI",
  servicos3dCta: "Explorar 3D Motion",

  servicosVfxTitle: "VFX",
  servicosVfxSubtitle: "Efectos cinematográficos para marcas que quieren sentirse irreales.",
  servicosVfxBody1:
    "Creamos efectos visuales que elevan el storytelling más allá de la realidad.",
  servicosVfxBody2:
    "Desde mejoras sutiles hasta entornos full CGI, nuestro trabajo en VFX aporta emoción, escala e intensidad a cada frame.",
  servicosVfxBestFor:
    "Campañas en cine, Lanzamientos de producto, Brand storytelling, Momentos visuales irreales",
  servicosVfxDeliverables:
    "Integración CGI, Simulaciones (agua, humo, partículas), Compositing y acabado, Look development cinematográfico",
  servicosVfxCta: "Explorar proyectos VFX",

  servicosVfxLeadTitle: "VFX",
  servicosVfxLeadDesc:
    "Efectos visuales que llevan el storytelling más allá de la realidad. Del cine a la publicidad, creamos momentos que emocionan y escalan.",
  servicosVfxLeadCard1: "Cine y TV",
  servicosVfxLeadCard2: "Marcas y Ads",

  servicosAiTitle: "AI Visual Systems",
  servicosAiSubtitle: "La próxima era de la producción creativa",
  servicosAiBody1: "La IA no es un atajo. Es una nueva capa creativa.",
  servicosAiBody2:
    "Usamos IA para expandir la imaginación, acelerar la ideación y crear sistemas visuales imposibles solo con flujos tradicionales.",
  servicosAiBody3: "Siempre curado. Siempre dirigido. Siempre premium.",
  servicosAiBestFor:
    "Campañas experimentales, Prototipado visual rápido, Sistemas de contenido estilizados, Mundos de concepto e iteración",
  servicosAiDeliverables:
    "Desarrollo visual asistido por IA, Flujos VFX híbridos, Exploración de contenido de alto volumen, Dirección creativa y refinamiento",
  servicosAiCta: "Explorar proyectos AI",

  servicosWhyTitle: "¿Por qué TRESSDE®?",
  servicosWhySub:
    "Porque la ejecución no basta. El mundo exige gusto, cultura y precisión.",
  servicosWhyPillar1: "Sensibilidad de diseño",
  servicosWhyPillar2: "Excelencia técnica",
  servicosWhyPillar3: "Storytelling cultural",
  servicosWhyPillar4: "Oficio de nivel global",
  servicosWhyTagline: "Nacido en Brasil. Hecho para el mundo.",

  servicosProcessTitle: "Nuestro proceso",
  servicosProcessSub: "De la imaginación al frame final.",
  servicosProcessStep1: "Treatment",
  servicosProcessStep2: "Storyboard y Previz",
  servicosProcessStep3: "Descubrimiento y Desarrollo",
  servicosProcessStep4: "Refinamiento",
  servicosProcessStep5: "Entrega",
  servicosProcessTagline: "Rápido. Colaborativo. Preciso.",

  servicosCtaTitle: "Construyamos algo icónico",
  servicosCtaSub:
    "Si tu marca quiere crear motion que se sienta cinematográfico, audaz y culturalmente afilado, hablemos.",
  servicosCtaButton: "Iniciar un proyecto",

  caseOpenInfo: "Abrir información del proyecto",
  caseInfoDialogLabel: "Información del proyecto",
  caseLabelClient: "Cliente",
  caseLabelProject: "Proyecto",
  caseLabelDescription: "Descripción",
  caseLabelYear: "Año",
  caseEscToClose: "ESC para cerrar",
  caseBack: "Volver",
  caseBackAria: "Volver a los cases",
  caseNotFound: "Case no encontrado (o aún no publicado).",
  caseNoMedia: "Este case aún no tiene medios.",
  caseTalkToUs: "Habla con nosotros",
  caseNotFoundError: "Case no encontrado.",
};

export const translations = {
  pt,
  en: enMap,
  es: esMap,
} as const;

export type Locale = keyof typeof translations;
