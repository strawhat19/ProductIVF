const HeroMonolith = () => (
  <div id={`landing-hero-monolith`} className={`landingHeroMonolith`} aria-hidden={true}>
    <svg
      viewBox={`0 0 250 330`}
      id={`landing-hero-monolith-canvas`}
      xmlns={`http://www.w3.org/2000/svg`}
      className={`landingHeroMonolithCanvas`}
    >
      <defs id={`landing-monolith-definitions`} className={`landingMonolithDefinitions`}>
        <radialGradient id={`landing-monolith-ambient-gradient`} className={`landingMonolithAmbientGradient`}>
          <stop id={`landing-monolith-ambient-center`} className={`landingMonolithAmbientCenter`} offset={`0`} stopColor={`#00ddff`} stopOpacity={.5} />
          <stop id={`landing-monolith-ambient-middle`} className={`landingMonolithAmbientMiddle`} offset={`.5`} stopColor={`#00cfff`} stopOpacity={.16} />
          <stop id={`landing-monolith-ambient-edge`} className={`landingMonolithAmbientEdge`} offset={`1`} stopColor={`#00cfff`} stopOpacity={0} />
        </radialGradient>
        <linearGradient
          x1={`35`} y1={`70`} x2={`145`} y2={`300`}
          gradientUnits={`userSpaceOnUse`}
          id={`landing-monolith-front-gradient`}
          className={`landingMonolithFrontGradient`}
        >
          <stop id={`landing-monolith-front-top`} className={`landingMonolithFrontTop`} offset={`0`} stopColor={`#76eeff`} />
          <stop id={`landing-monolith-front-middle`} className={`landingMonolithFrontMiddle`} offset={`.48`} stopColor={`#17cde9`} />
          <stop id={`landing-monolith-front-bottom`} className={`landingMonolithFrontBottom`} offset={`1`} stopColor={`#009fbe`} />
        </linearGradient>
        <linearGradient
          x1={`135`} y1={`70`} x2={`205`} y2={`245`}
          gradientUnits={`userSpaceOnUse`}
          id={`landing-monolith-side-gradient`}
          className={`landingMonolithSideGradient`}
        >
          <stop id={`landing-monolith-side-top`} className={`landingMonolithSideTop`} offset={`0`} stopColor={`#0b1722`} />
          <stop id={`landing-monolith-side-bottom`} className={`landingMonolithSideBottom`} offset={`1`} stopColor={`#020811`} />
        </linearGradient>
        <linearGradient
          x1={`105`} y1={`20`} x2={`90`} y2={`70`}
          gradientUnits={`userSpaceOnUse`}
          id={`landing-monolith-top-gradient`}
          className={`landingMonolithTopGradient`}
        >
          <stop id={`landing-monolith-top-back`} className={`landingMonolithTopBack`} offset={`0`} stopColor={`#102a37`} />
          <stop id={`landing-monolith-top-front`} className={`landingMonolithTopFront`} offset={`1`} stopColor={`#a6f6ff`} />
        </linearGradient>
        <clipPath id={`landing-monolith-side-clip`} className={`landingMonolithSideClip`}>
          <path id={`landing-monolith-side-clip-shape`} className={`landingMonolithSideClipShape`} d={`M135 70 205 20V245L135 295Z`} />
        </clipPath>
        <filter
          x={`-40%`} y={`-100%`} width={`180%`} height={`300%`}
          id={`landing-monolith-shadow-filter`}
          className={`landingMonolithShadowFilter`}
        >
          <feGaussianBlur id={`landing-monolith-shadow-blur`} className={`landingMonolithShadowBlur`} stdDeviation={`12`} />
        </filter>
      </defs>
      <ellipse
        cx={`120`} cy={`289`} rx={`120`} ry={`39`}
        id={`landing-monolith-ambient-glow`}
        className={`landingMonolithAmbientGlow`}
        fill={`url(#landing-monolith-ambient-gradient)`}
      />
      <ellipse
        cx={`120`} cy={`298`} rx={`84`} ry={`9`}
        fill={`#001b25`} opacity={.8}
        id={`landing-monolith-ground-shadow`}
        className={`landingMonolithGroundShadow`}
        filter={`url(#landing-monolith-shadow-filter)`}
      />
      <path
        d={`M35 70 105 20H205L135 70Z`}
        id={`landing-monolith-top-face`}
        className={`landingMonolithTopFace`}
        fill={`url(#landing-monolith-top-gradient)`}
      />
      <path
        d={`M135 70 205 20V245L135 295Z`}
        id={`landing-monolith-side-face`}
        className={`landingMonolithSideFace`}
        fill={`url(#landing-monolith-side-gradient)`}
      />
      <g
        fill={`none`} stroke={`#3b7188`} strokeWidth={.55} opacity={.4}
        id={`landing-monolith-side-facets`}
        className={`landingMonolithSideFacets`}
        clipPath={`url(#landing-monolith-side-clip)`}
      >
        <path id={`landing-monolith-side-grid-forward`} className={`landingMonolithSideGridForward`} d={`M130 119 210 62M130 164 210 107M130 209 210 152M130 254 210 197M130 299 210 242`} />
        <path id={`landing-monolith-side-grid-cross`} className={`landingMonolithSideGridCross`} d={`M134 62 205 155M134 107 205 200M134 152 205 245M134 197 205 290M157 54V287M181 37V269`} />
      </g>
      <path
        d={`M35 70H135V295H35Z`}
        id={`landing-monolith-front-face`}
        className={`landingMonolithFrontFace`}
        fill={`url(#landing-monolith-front-gradient)`}
      />
      <path id={`landing-monolith-front-light-facet`} className={`landingMonolithFrontLightFacet`} d={`M35 70H135L35 199Z`} fill={`#d6fbff`} opacity={.08} />
      <path id={`landing-monolith-front-deep-facet`} className={`landingMonolithFrontDeepFacet`} d={`M135 135V295H35Z`} fill={`#00687e`} opacity={.08} />
      <path id={`landing-monolith-front-inner-facet`} className={`landingMonolithFrontInnerFacet`} d={`M35 199 135 135 76 243Z`} fill={`#c9fbff`} opacity={.045} />
      <path id={`landing-monolith-front-bevel`} className={`landingMonolithFrontBevel`} d={`M35 70H39V295H35Z`} fill={`#b0f8ff`} opacity={.25} />
      <path id={`landing-monolith-top-ledge`} className={`landingMonolithTopLedge`} d={`M35 70H135L205 20`} fill={`none`} stroke={`#c8fbff`} strokeWidth={1.8} strokeLinejoin={`round`} />
      <path id={`landing-monolith-front-rim`} className={`landingMonolithFrontRim`} d={`M135 71V295H35`} fill={`none`} stroke={`#56e6fa`} strokeWidth={.8} opacity={.7} />
    </svg>
  </div>
);

export default HeroMonolith;
