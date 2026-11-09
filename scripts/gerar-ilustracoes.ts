/**
 * Desenha o conjunto de ilustrações do projeto.
 * Uso: deno run -A scripts/gerar-ilustracoes.ts
 * O resultado são ficheiros SVG estáticos em static/palavras/.
 */
const ink = '#1B2A4A';
const cobalt = '#2457E6';
const coral = '#F05A47';
const sun = '#F6C445';
const mint = '#8FD3C7';
const leaf = '#3E7C6A';
const rose = '#E86A92';
const violet = '#7A5AF8';
const skin = '#F2B98B';
const brown = '#8A5A3B';
const grey = '#B8C0D2';
const paper = '#FFFDF7';

const olho = (x: number, y: number, r = 3) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${ink}" stroke="none"/>`;

const brilho = (x: number, y: number, r = 3) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${paper}" stroke="none" opacity=".9"/>`;

const boca = (x: number, y: number, w = 16) =>
  `<path d="M${x - w / 2} ${y} Q${x} ${y + 9} ${x + w / 2} ${y}" fill="none" stroke="${ink}" stroke-width="4"/>`;

const desenhos: Record<string, string> = {
  menina: `
    <path d="M87 61 Q80 27 120 25 Q160 27 153 61 Q146 46 120 48 Q94 46 87 61Z" fill="${brown}"/>
    <circle cx="82" cy="70" r="13" fill="${brown}"/>
    <circle cx="158" cy="70" r="13" fill="${brown}"/>
    <circle cx="120" cy="68" r="32" fill="${skin}"/>
    <path d="M97 52 Q108 43 120 45 Q134 43 143 52" fill="none" stroke="${brown}" stroke-width="8"/>
    ${olho(108, 67)} ${olho(132, 67)} ${boca(120, 78, 15)}
    <path d="M120 95 L92 153 Q120 166 148 153Z" fill="${coral}"/>
    <path d="M108 99 L102 118 M132 99 L138 118" fill="none" stroke="${ink}" stroke-width="4"/>
    <path d="M104 153 L100 171 M136 153 L140 171" fill="none" stroke="${skin}" stroke-width="9"/>
    <path d="M92 171 Q100 165 108 171 M132 171 Q140 165 148 171" fill="${cobalt}" stroke-width="4"/>
    <path d="M94 111 L75 137 M146 111 L165 137" fill="none" stroke="${skin}" stroke-width="9"/>
  `,
  menino: `
    <path d="M89 56 Q88 28 120 26 Q152 28 151 56 Q143 45 120 46 Q97 45 89 56Z" fill="${brown}"/>
    <circle cx="120" cy="68" r="32" fill="${skin}"/>
    <path d="M91 58 Q95 39 120 38 Q145 39 149 58" fill="none" stroke="${brown}" stroke-width="10"/>
    ${olho(108, 67)} ${olho(132, 67)} ${boca(120, 80, 14)}
    <path d="M88 108 Q88 94 103 92 H137 Q152 94 152 108 L148 133 H92Z" fill="${cobalt}"/>
    <path d="M92 132 H148 L143 151 H97Z" fill="${sun}"/>
    <path d="M104 151 L102 171 M136 151 L138 171" fill="none" stroke="${skin}" stroke-width="9"/>
    <path d="M94 170 Q102 164 110 170 M130 170 Q138 164 146 170" fill="${ink}" stroke-width="4"/>
    <path d="M90 108 L72 129 M150 108 L168 129" fill="none" stroke="${skin}" stroke-width="9"/>
    <path d="M120 94 V128" fill="none" stroke="${ink}" stroke-width="3"/>
  `,
  uva: `
    <path d="M120 47 Q118 32 132 25" fill="none" stroke="${brown}" stroke-width="6"/>
    <path d="M122 45 Q143 22 165 35 Q151 55 124 51Z" fill="${leaf}"/>
    <g fill="${violet}">
      <circle cx="100" cy="69" r="15"/><circle cx="120" cy="67" r="15"/><circle cx="140" cy="69" r="15"/>
      <circle cx="91" cy="91" r="15"/><circle cx="111" cy="90" r="15"/><circle cx="131" cy="91" r="15"/><circle cx="149" cy="91" r="15"/>
      <circle cx="101" cy="113" r="15"/><circle cx="121" cy="112" r="15"/><circle cx="141" cy="113" r="15"/>
      <circle cx="111" cy="134" r="15"/><circle cx="131" cy="134" r="15"/>
      <circle cx="121" cy="154" r="15"/>
    </g>
    ${brilho(95, 64, 3)} ${brilho(116, 84, 3)} ${brilho(126, 128, 3)}
  `,
  sapato: `
    <path d="M41 121 Q39 96 63 91 L105 82 Q125 78 135 94 L146 111 Q166 114 187 119 Q204 123 203 139 L203 151 H40Z" fill="${cobalt}"/>
    <path d="M38 145 H205 V159 Q205 167 196 167 H48 Q38 167 38 158Z" fill="${paper}"/>
    <path d="M105 82 Q120 100 135 111 Q158 118 175 121" fill="none" stroke="${ink}" stroke-width="4"/>
    <path d="M83 105 L101 97 M89 116 L107 108 M96 126 L114 118" stroke="${paper}" stroke-width="5"/>
    <path d="M181 126 Q195 128 201 138" fill="none" stroke="${paper}" stroke-width="4"/>
    <path d="M57 92 Q47 112 50 139" fill="none" stroke="${ink}" stroke-width="4"/>
  `,
  bota: `
    <path d="M79 42 H150 L154 111 Q170 121 179 138 Q184 153 169 158 H83 Q70 156 73 140 L82 104Z" fill="${coral}"/>
    <path d="M73 143 H180 V158 Q180 167 166 167 H87 Q71 167 71 155Z" fill="${ink}"/>
    <path d="M79 61 H151" stroke="${sun}" stroke-width="12"/>
    <rect x="143" y="55" width="24" height="17" rx="4" fill="${sun}" stroke-width="4"/>
    <path d="M150 42 V158" stroke="${ink}" stroke-width="3" opacity=".35"/>
    <path d="M97 119 Q110 113 123 119" fill="none" stroke="${paper}" stroke-width="4"/>
  `,
  mama: `
    <path d="M91 61 Q88 28 120 27 Q152 28 149 61 Q141 47 120 48 Q99 47 91 61Z" fill="${brown}"/>
    <circle cx="120" cy="23" r="15" fill="${brown}"/>
    <circle cx="120" cy="68" r="32" fill="${skin}"/>
    <path d="M94 60 Q103 44 120 45 Q137 44 146 60" fill="none" stroke="${brown}" stroke-width="9"/>
    ${olho(108, 67)} ${olho(132, 67)} ${boca(120, 79, 14)}
    <circle cx="89" cy="77" r="3" fill="${sun}" stroke="none"/>
    <circle cx="151" cy="77" r="3" fill="${sun}" stroke="none"/>
    <path d="M84 112 Q84 96 102 94 H138 Q156 96 156 112 L151 156 H89Z" fill="${cobalt}"/>
    <path d="M101 94 Q108 113 120 113 Q132 113 139 94" fill="${rose}"/>
    <path d="M120 113 L109 137 M120 113 L131 137" fill="none" stroke="${paper}" stroke-width="4"/>
    <path d="M99 156 Q120 148 141 156" fill="none" stroke="${ink}" stroke-width="4"/>
  `,
  leque: `
    <path d="M120 151 L34 87 Q60 44 120 40 Q180 44 206 87Z" fill="${rose}"/>
    <path d="M120 151 L54 73 M120 151 L83 55 M120 151 L120 40 M120 151 L157 55 M120 151 L186 73" fill="none" stroke="${ink}" stroke-width="4"/>
    <path d="M34 87 Q60 44 120 40 Q180 44 206 87" fill="none" stroke-width="7"/>
    <circle cx="120" cy="151" r="9" fill="${sun}"/>
    <path d="M120 160 V174" stroke="${ink}" stroke-width="8"/>
    <path d="M70 91 Q92 61 120 58" fill="none" stroke="${paper}" stroke-width="4" opacity=".55"/>
  `,
  casa: `
    <path d="M51 84 L120 38 L189 84Z" fill="${coral}"/>
    <path d="M66 84 H174 V157 H66Z" fill="${sun}"/>
    <rect x="93" y="115" width="34" height="42" fill="${cobalt}" stroke-width="5"/>
    <circle cx="121" cy="137" r="3" fill="${sun}" stroke="none"/>
    <rect x="139" y="99" width="24" height="24" fill="${paper}" stroke-width="5"/>
    <path d="M151 99 V123 M139 111 H163" stroke="${ink}" stroke-width="3"/>
    <path d="M171 55 V82" stroke="${ink}" stroke-width="9"/>
    <path d="M160 55 H184 V72 H160Z" fill="${coral}" stroke-width="4"/>
    <path d="M120 38 V30" stroke="${ink}" stroke-width="5"/>
  `,
  janela: `
    <rect x="52" y="35" width="136" height="112" rx="4" fill="${paper}" stroke-width="7"/>
    <rect x="64" y="47" width="112" height="88" fill="${mint}" stroke-width="4"/>
    <path d="M120 47 V135 M64 91 H176" stroke-width="7"/>
    <path d="M52 147 H188" stroke-width="9"/>
    <path d="M46 35 Q34 61 44 94 M194 35 Q206 61 196 94" fill="${rose}" stroke-width="5"/>
    <path d="M87 47 Q91 66 83 88" fill="none" stroke="${paper}" stroke-width="4" opacity=".7"/>
  `,
  telhado: `
    <path d="M35 133 L120 43 L205 133Z" fill="${coral}"/>
    <path d="M60 108 L120 43 L180 108" fill="none" stroke="${ink}" stroke-width="4" opacity=".45"/>
    <path d="M47 122 L193 122" stroke="${ink}" stroke-width="4" opacity=".35"/>
    <path d="M71 88 H101 V61 L86 47 L71 61Z" fill="${sun}"/>
    <path d="M71 61 H101" stroke-width="4"/>
    <path d="M26 133 H214" stroke-width="9"/>
    <path d="M120 43 V32" stroke-width="5"/>
  `,
  escada: `
    <path d="M47 153 H89 V128 H116 V103 H143 V78 H170 V53 H193 V153Z" fill="${sun}"/>
    <path d="M47 153 H193" stroke-width="8"/>
    <path d="M47 153 L47 118 M89 128 L89 93 M116 103 L116 68 M143 78 L143 43 M170 53 L170 18" fill="none" stroke-width="6"/>
    <path d="M47 118 L89 93 L116 68 L143 43 L170 18 L193 18" fill="none" stroke-width="6"/>
    <path d="M55 106 V153 M63 106 V153 M77 106 V153" stroke="${coral}" stroke-width="4" opacity=".7"/>
  `,
  chave: `
    <circle cx="73" cy="89" r="34" fill="${sun}"/>
    <circle cx="73" cy="89" r="14" fill="${paper}" stroke-width="4"/>
    <path d="M105 89 H184 V109 H166 V124 H148 V109 H132 V124 H114 V109 H105Z" fill="${sun}"/>
    <path d="M129 89 V101 M149 89 V101" stroke-width="4"/>
    ${brilho(62, 74, 4)}
  `,
  galinha: `
    <path d="M92 76 Q76 53 99 44 Q116 37 124 58 Q139 43 154 61 Q169 81 148 96" fill="${paper}"/>
    <path d="M107 46 Q106 25 121 29 Q131 22 137 38 Q148 32 150 47" fill="${coral}" stroke-width="5"/>
    <circle cx="127" cy="70" r="31" fill="${paper}"/>
    <path d="M156 68 L178 78 L156 85Z" fill="${sun}" stroke-width="4"/>
    <path d="M151 60 Q158 66 155 72" fill="none" stroke="${coral}" stroke-width="5"/>
    ${olho(137, 64)} 
    <path d="M91 92 Q73 104 90 119 Q111 126 122 110" fill="${sun}" stroke-width="5"/>
    <path d="M108 112 L104 132 M115 112 L119 132" stroke="${ink}" stroke-width="6"/>
    <path d="M92 132 H112 M111 132 H127" stroke-width="4"/>
    <path d="M150 94 Q160 106 154 119" fill="none" stroke="${paper}" stroke-width="4"/>
  `,
  gema: `
    <path d="M36 112 H190 L204 147 Q207 158 195 158 H31 Q19 158 22 147Z" fill="${ink}"/>
    <path d="M62 112 Q62 76 120 74 Q178 76 178 112 Q178 139 120 139 Q62 139 62 112Z" fill="${paper}" stroke-width="5"/>
    <circle cx="121" cy="105" r="25" fill="${sun}"/>
    ${brilho(113, 97, 5)}
    <path d="M190 112 H211" stroke-width="8"/>
    <path d="M24 147 H200" stroke="${coral}" stroke-width="5" opacity=".7"/>
  `,
  rato: `
    <path d="M151 111 Q186 116 195 139 Q200 153 187 149 Q166 142 151 127" fill="none" stroke-width="6"/>
    <ellipse cx="118" cy="109" rx="55" ry="40" fill="${grey}"/>
    <circle cx="79" cy="77" r="24" fill="${grey}"/>
    <circle cx="79" cy="77" r="12" fill="${rose}" stroke-width="4"/>
    <circle cx="151" cy="77" r="24" fill="${grey}"/>
    <circle cx="151" cy="77" r="12" fill="${rose}" stroke-width="4"/>
    <circle cx="155" cy="111" r="29" fill="${grey}"/>
    <path d="M177 111 L196 118 L178 125Z" fill="${rose}" stroke-width="4"/>
    ${olho(166, 105)} ${olho(146, 102)}
    <path d="M180 121 Q188 121 189 128 M180 128 Q188 128 189 135" fill="none" stroke-width="3"/>
    <circle cx="188" cy="122" r="4" fill="${ink}" stroke="none"/>
  `,
  cenoura: `
    <path d="M120 71 Q169 81 174 113 Q178 151 122 166 Q68 150 70 113 Q74 83 120 71Z" fill="${coral}"/>
    <path d="M99 88 L106 151 M121 84 V161 M142 88 L136 151" fill="none" stroke="${sun}" stroke-width="4" opacity=".7"/>
    <path d="M101 69 Q83 30 105 26 Q115 47 120 66 M119 65 Q123 26 137 24 Q146 47 134 69 M133 70 Q153 38 165 52 Q157 72 141 78" fill="${leaf}" stroke-width="5"/>
    ${olho(107, 105)} ${olho(133, 105)} ${boca(120, 119, 14)}
  `,
  girafa: `
    <path d="M100 161 Q95 119 107 91 L126 45 L151 52 L135 95 Q131 126 142 161Z" fill="${sun}"/>
    <path d="M131 44 Q136 18 164 22 Q184 26 184 47 Q184 64 163 68 L132 68Z" fill="${sun}"/>
    <path d="M144 22 V9 M159 21 L163 8" stroke-width="5"/>
    <circle cx="144" cy="7" r="5" fill="${coral}" stroke-width="3"/>
    <circle cx="163" cy="6" r="5" fill="${coral}" stroke-width="3"/>
    <path d="M164 39 L180 39" stroke-width="4"/>
    ${olho(159, 36)}
    <circle cx="169" cy="53" r="4" fill="${coral}" stroke="none"/>
    <g fill="${coral}">
      <circle cx="116" cy="76" r="6"/><circle cx="124" cy="101" r="6"/><circle cx="119" cy="128" r="5"/>
      <circle cx="143" cy="84" r="5"/><circle cx="138" cy="112" r="5"/><circle cx="151" cy="139" r="6"/>
    </g>
    <path d="M100 161 H145" stroke-width="8"/>
  `,
  palhaco: `
    <path d="M79 69 Q78 31 120 29 Q162 31 161 69 Q161 111 120 119 Q79 111 79 69Z" fill="${paper}"/>
    <path d="M80 42 Q98 16 120 27 Q142 16 160 42 L154 55 Q137 41 120 50 Q103 41 86 55Z" fill="${cobalt}"/>
    <circle cx="120" cy="25" r="9" fill="${sun}"/>
    <path d="M79 67 Q60 60 58 80 Q58 98 78 96 M161 67 Q180 60 182 80 Q182 98 162 96" fill="${coral}" stroke-width="5"/>
    <path d="M94 58 Q104 49 114 58 M126 58 Q136 49 146 58" fill="none" stroke-width="4"/>
    <circle cx="120" cy="79" r="11" fill="${coral}"/>
    ${boca(120, 96, 30)}
    <path d="M86 119 Q120 139 154 119 L161 136 Q120 158 79 136Z" fill="${sun}" stroke-width="5"/>
  `,
  zebra: `
    <path d="M74 122 Q60 104 72 86 Q86 70 112 72 H150 L166 52 Q168 39 182 40 Q197 41 198 56 Q199 70 185 75 L175 98 Q188 110 184 126 Q179 141 158 141 H94 Q78 140 74 122Z" fill="${paper}"/>
    <path d="M151 73 Q156 54 168 47 M159 80 Q165 62 179 56" fill="none" stroke="${ink}" stroke-width="7"/>
    <path d="M168 45 L173 31 L184 41" fill="${ink}" stroke-width="3"/>
    <path d="M177 72 L166 80 M183 74 L174 84" stroke="${ink}" stroke-width="5"/>
    <path d="M86 85 L98 98 M76 99 L101 108 M73 115 L102 119 M84 130 L107 127 M145 96 L168 100 M143 111 L174 110 M147 126 L167 123" stroke="${ink}" stroke-width="7"/>
    ${olho(188, 55)}
    <path d="M198 63 L212 68 L198 73Z" fill="${ink}" stroke-width="3"/>
    <path d="M74 106 Q52 99 44 82" fill="none" stroke-width="6"/>
    <path d="M94 141 L90 159 M119 142 L117 160 M153 141 L158 159" stroke="${ink}" stroke-width="7"/>
    <path d="M80 160 H101 M108 160 H129 M147 160 H168" stroke-width="4"/>
  `,
  peixe: `
    <path d="M61 94 Q96 48 157 68 Q192 80 203 99 Q188 129 148 136 Q89 140 61 94Z" fill="${cobalt}"/>
    <path d="M56 93 L26 65 Q22 96 26 123Z" fill="${coral}"/>
    <path d="M118 62 Q139 39 158 63 Q141 74 118 62Z" fill="${sun}" stroke-width="5"/>
    <path d="M130 83 Q121 99 130 116 M150 82 Q141 99 150 117" fill="none" stroke="${mint}" stroke-width="5"/>
    ${olho(173, 91, 4)} ${brilho(179, 85, 2)}
    <circle cx="200" cy="53" r="7" fill="none" stroke-width="4"/>
    <circle cx="216" cy="36" r="5" fill="none" stroke-width="4"/>
    <path d="M165 134 Q180 151 195 144" fill="none" stroke="${coral}" stroke-width="6"/>
  `,
  bandeira: `
    <path d="M62 22 V166" stroke-width="8"/>
    <path d="M68 30 H190 V103 H68Z" fill="${leaf}"/>
    <path d="M128 30 H190 V103 H128Z" fill="${coral}" stroke-width="5"/>
    <circle cx="129" cy="66" r="24" fill="${sun}" stroke-width="5"/>
    <path d="M112 66 H146 V78 H112Z" fill="${paper}" stroke-width="3"/>
    <path d="M50 166 H84" stroke-width="8"/>
    <circle cx="62" cy="18" r="7" fill="${sun}" stroke-width="4"/>
  `,
  funil: `
    <path d="M54 35 H186 L135 97 V150 H166 M135 150 H104" fill="${cobalt}" stroke-width="7"/>
    <path d="M69 49 H171 L133 93 V145 H107 V93Z" fill="${cobalt}" stroke-width="3"/>
    <path d="M54 35 H186" stroke="${ink}" stroke-width="9"/>
    <path d="M147 145 Q158 155 147 167 Q136 157 147 145Z" fill="${mint}" stroke-width="4"/>
    <path d="M92 54 H148" stroke="${paper}" stroke-width="4" opacity=".55"/>
  `,
  arvore: `
    <path d="M111 157 Q108 119 96 102 Q84 86 102 73 Q91 52 116 44 Q126 20 149 35 Q174 29 177 55 Q196 74 179 93 Q190 116 164 124 Q151 145 131 137 Q121 151 111 157Z" fill="${leaf}"/>
    <path d="M107 157 Q111 128 120 104 Q128 86 144 72" fill="none" stroke="${brown}" stroke-width="13"/>
    <path d="M119 127 L94 111 M125 112 L101 95" stroke="${brown}" stroke-width="7"/>
    <path d="M98 157 H139" stroke-width="7"/>
    <circle cx="110" cy="63" r="6" fill="${sun}" stroke="none"/>
    <circle cx="158" cy="50" r="5" fill="${rose}" stroke="none"/>
    <circle cx="165" cy="94" r="5" fill="${sun}" stroke="none"/>
  `,
  quadro: `
    <path d="M57 30 H190 V130 H57Z" fill="${leaf}"/>
    <path d="M69 42 H178 V118 H69Z" fill="none" stroke="${paper}" stroke-width="4" opacity=".5"/>
    <path d="M87 74 Q97 60 107 74 Q117 60 127 74" fill="none" stroke="${paper}" stroke-width="5"/>
    <path d="M94 94 H124 M109 94 V112 M135 61 V112 M128 70 H142 M149 84 H171 M149 100 H165" stroke="${paper}" stroke-width="4"/>
    <path d="M79 130 L61 165 M168 130 L186 165" stroke="${brown}" stroke-width="10"/>
    <path d="M61 165 H92 M157 165 H186" stroke-width="7"/>
    <path d="M115 130 V165" stroke="${brown}" stroke-width="8"/>
  `,
  passarinho: `
    <path d="M54 139 Q76 120 107 121 H172 Q190 121 190 136 Q185 151 162 152 H91 Q67 152 54 139Z" fill="${brown}"/>
    <path d="M90 104 Q78 84 96 73 Q116 62 137 80 Q152 96 137 113 Q113 126 90 104Z" fill="${cobalt}"/>
    <path d="M88 103 L48 82 Q46 113 52 130Z" fill="${coral}" stroke-width="5"/>
    <circle cx="151" cy="77" r="27" fill="${cobalt}"/>
    <path d="M174 73 L198 82 L174 91Z" fill="${sun}" stroke-width="4"/>
    <path d="M106 92 Q127 78 147 96 Q129 112 106 104Z" fill="${coral}" stroke-width="4"/>
    ${olho(159, 71)} ${brilho(166, 65, 3)}
    <path d="M120 121 L116 137 M144 122 L149 138" stroke="${ink}" stroke-width="5"/>
    <path d="M108 138 H124 M141 139 H156" stroke-width="4"/>
    <path d="M178 94 Q195 99 197 112" fill="none" stroke="${cobalt}" stroke-width="6"/>
  `,
  cigarra: `
    <ellipse cx="120" cy="101" rx="26" ry="47" fill="${leaf}"/>
    <path d="M98 74 Q65 66 55 103 Q69 128 99 120 M142 74 Q175 66 185 103 Q171 128 141 120" fill="${mint}" opacity=".8" stroke-width="5"/>
    <path d="M108 56 Q94 38 82 35 M132 56 Q146 38 158 35" fill="none" stroke-width="4"/>
    <circle cx="82" cy="35" r="4" fill="${ink}" stroke="none"/>
    <circle cx="158" cy="35" r="4" fill="${ink}" stroke="none"/>
    <path d="M103 50 Q120 41 137 50" fill="${coral}" stroke-width="4"/>
    ${olho(106, 65)} ${olho(134, 65)}
    <path d="M120 78 V132" stroke-width="3" opacity=".45"/>
    <path d="M99 147 L95 160 M141 147 L145 160" stroke-width="6"/>
    <path d="M88 108 Q104 116 112 108 M152 108 Q136 116 128 108" fill="none" stroke-width="4"/>
  `,
  fogueira: `
    <path d="M62 145 L178 145" stroke="${brown}" stroke-width="14"/>
    <path d="M78 156 L162 128 M162 156 L78 128" stroke="${brown}" stroke-width="11"/>
    <path d="M120 39 Q139 67 153 83 Q174 109 158 131 Q146 149 120 150 Q94 149 82 131 Q66 109 87 83 Q101 67 120 39Z" fill="${coral}"/>
    <path d="M120 77 Q130 96 140 106 Q150 121 141 134 Q134 143 120 143 Q106 143 99 134 Q90 121 100 106 Q110 96 120 77Z" fill="${sun}"/>
    <path d="M113 119 Q120 111 127 119 Q132 128 120 135 Q108 128 113 119Z" fill="${paper}" stroke="none" opacity=".65"/>
    <path d="M66 113 L52 101 M174 108 L188 95" stroke="${sun}" stroke-width="5"/>
  `,
  flor: `
    <path d="M120 93 V164" stroke="${leaf}" stroke-width="9"/>
    <path d="M120 133 Q93 122 83 139 Q101 155 120 143" fill="${leaf}" stroke-width="5"/>
    <path d="M120 150 Q147 139 157 156 Q139 172 120 160" fill="${leaf}" stroke-width="5"/>
    <g fill="${sun}">
      <path d="M120 28 Q143 28 143 51 Q143 60 120 60 Q97 60 97 51 Q97 28 120 28Z"/>
      <path d="M120 57 Q143 57 143 80 Q143 89 120 89 Q97 89 97 80 Q97 57 120 57Z"/>
      <path d="M94 56 Q117 56 117 79 Q117 88 94 88 Q71 88 71 79 Q71 56 94 56Z"/>
      <path d="M146 56 Q169 56 169 79 Q169 88 146 88 Q123 88 123 79 Q123 56 146 56Z"/>
    </g>
    <circle cx="120" cy="72" r="18" fill="${coral}"/>
    <circle cx="114" cy="68" r="3" fill="${paper}" stroke="none"/>
  `,
  mesa: `
    <path d="M44 79 H196 V98 H44Z" fill="${brown}"/>
    <path d="M57 98 V158 M183 98 V158" stroke="${brown}" stroke-width="11"/>
    <path d="M44 79 H196" stroke-width="8"/>
    <path d="M72 98 L64 158 M168 98 L176 158" stroke="${brown}" stroke-width="7"/>
    <path d="M82 76 Q82 58 100 58 H140 Q158 58 158 76" fill="${sun}" stroke-width="5"/>
    <circle cx="103" cy="49" r="7" fill="${coral}" stroke-width="4"/>
    <circle cx="121" cy="45" r="7" fill="${coral}" stroke-width="4"/>
    <circle cx="139" cy="49" r="7" fill="${coral}" stroke-width="4"/>
  `,
  pato: `
    <path d="M56 131 Q78 117 110 120 H168 Q191 120 193 138 Q193 155 170 156 H96 Q68 154 56 131Z" fill="${sun}"/>
    <circle cx="155" cy="86" r="28" fill="${sun}"/>
    <path d="M178 82 L203 91 L178 100Z" fill="${coral}" stroke-width="4"/>
    ${olho(163, 79)} ${brilho(168, 73, 2)}
    <path d="M101 137 Q119 128 139 139 Q121 151 101 137Z" fill="${coral}" stroke-width="4"/>
    <path d="M52 158 Q71 149 91 158 M156 158 Q175 149 195 158" fill="none" stroke="${cobalt}" stroke-width="4"/>
  `,
  nave: `
    <path d="M120 31 Q160 44 167 87 L158 127 Q120 145 82 127 L73 87 Q80 44 120 31Z" fill="${paper}"/>
    <path d="M120 31 Q99 50 95 90 L103 127 Q120 136 137 127 L145 90 Q141 50 120 31Z" fill="${cobalt}" opacity=".18" stroke="none"/>
    <circle cx="120" cy="78" r="17" fill="${mint}"/>
    <path d="M73 92 L48 117 L78 120 M167 92 L192 117 L162 120" fill="${coral}" stroke-width="5"/>
    <path d="M104 134 Q120 166 136 134" fill="${sun}" stroke-width="5"/>
    <path d="M110 136 Q120 155 130 136" fill="${coral}" stroke="none"/>
    <circle cx="120" cy="52" r="5" fill="${sun}" stroke="none"/>
  `,
  bola: `
    <circle cx="120" cy="94" r="61" fill="${paper}"/>
    <path d="M120 51 L141 66 L133 91 H107 L99 66Z" fill="${cobalt}"/>
    <path d="M120 51 L120 33 M141 66 L159 55 M133 91 L152 109 M107 91 L88 109 M99 66 L81 55" fill="none" stroke="${ink}" stroke-width="4"/>
    <path d="M75 79 Q93 89 88 109 Q77 122 63 117 M165 79 Q147 89 152 109 Q163 122 177 117" fill="none" stroke="${ink}" stroke-width="4"/>
    <path d="M88 137 Q105 128 120 137 Q135 146 152 137" fill="none" stroke="${ink}" stroke-width="4"/>
    ${brilho(97, 57, 5)}
  `,
  gato: `
    <path d="M86 65 L76 35 L105 49 M154 65 L164 35 L135 49" fill="${sun}" stroke-width="5"/>
    <circle cx="120" cy="93" r="42" fill="${sun}"/>
    ${olho(105, 87)} ${olho(135, 87)}
    <path d="M114 101 L120 106 L126 101" fill="${coral}" stroke-width="3"/>
    <path d="M120 106 V112 M120 112 Q108 120 101 112 M120 112 Q132 120 139 112" fill="none" stroke-width="3"/>
    <path d="M91 106 L56 101 M91 114 L57 119 M149 106 L184 101 M149 114 L183 119" stroke-width="3"/>
    <path d="M96 132 Q86 154 105 158 Q120 160 120 140 Q120 160 135 158 Q154 154 144 132" fill="${sun}" stroke-width="5"/>
    <path d="M120 134 V158" stroke-width="3" opacity=".4"/>
  `,
  mala: `
    <rect x="53" y="61" width="134" height="91" rx="8" fill="${cobalt}"/>
    <path d="M93 61 V46 Q93 36 103 36 H137 Q147 36 147 46 V61" fill="none" stroke-width="8"/>
    <path d="M53 91 H187" stroke="${sun}" stroke-width="10"/>
    <rect x="108" y="83" width="24" height="16" rx="4" fill="${sun}" stroke-width="4"/>
    <path d="M76 61 V152 M164 61 V152" stroke-width="4" opacity=".4"/>
    <rect x="150" y="108" width="20" height="13" rx="3" fill="${paper}" stroke-width="4"/>
    <path d="M160 108 V121" stroke-width="3"/>
  `
};

const cabecalho = (corpo: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" fill="none" role="img" aria-hidden="true">
  <g stroke="${ink}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">
${corpo.trim().split('\n').map((linha) => `    ${linha.trim()}`).join('\n')}
  </g>
</svg>
`;

for (const [id, corpo] of Object.entries(desenhos)) {
  await Deno.writeTextFile(`static/palavras/${id}.svg`, cabecalho(corpo));
}

console.log(`Geradas ${Object.keys(desenhos).length} ilustrações em static/palavras/.`);
