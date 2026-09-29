/**
 * Static counterpart of the Inference Core (design evolution): the same object as an isometric
 * engineering drawing — substrate, frame, three die layers with routed traces, the optical sensor
 * and numbered callouts (01 sensor → 05 substrate, language-neutral). Server-rendered SVG, no JS.
 * It is what first paint, reduced motion, Save-Data and WebGL-less visitors see; when the scene
 * is ready it fades out as the manufactured object takes its place (drawing → machine).
 * Generated geometry (isometric projection, 30°); decorative (the stage is aria-hidden).
 */
export function StaticCore() {
  return (
    <svg className="cine-core" viewBox="0 0 600 520" fill="none" aria-hidden="true" focusable="false">
      <path d="M300.0 168.0 L559.8 318.0 L300.0 468.0 L40.2 318.0 Z" className="sc-face" />
      <path
        d="M40.2 318.0 L40.2 330.0 L300.0 480.0 L559.8 330.0 L559.8 318.0 M300.0 480.0 L300.0 468.0"
        className="sc-edge"
      />
      <path
        d="M59.3 337.0 L45.4 345.0 M540.7 337.0 L554.6 345.0 M74.0 345.5 L60.2 353.5 M526.0 345.5 L539.8 353.5 M88.8 354.1 L75.0 362.1 M511.2 354.1 L525.0 362.1 M103.6 362.6 L89.7 370.6 M496.4 362.6 L510.3 370.6 M118.4 371.1 L104.5 379.1 M481.6 371.1 L495.5 379.1 M133.2 379.7 L119.3 387.7 M466.8 379.7 L480.7 387.7 M147.9 388.2 L134.1 396.2 M452.1 388.2 L465.9 396.2 M162.7 396.7 L148.9 404.7 M437.3 396.7 L451.1 404.7 M177.5 405.3 L163.6 413.3 M422.5 405.3 L436.4 413.3 M192.3 413.8 L178.4 421.8 M407.7 413.8 L421.6 421.8 M207.0 422.3 L193.2 430.3 M393.0 422.3 L406.8 430.3 M221.8 430.9 L208.0 438.9 M378.2 430.9 L392.0 438.9 M236.6 439.4 L222.8 447.4 M363.4 439.4 L377.2 447.4 M251.4 447.9 L237.5 455.9 M348.6 447.9 L362.5 455.9 M266.2 456.5 L252.3 464.5 M333.8 456.5 L347.7 464.5 M280.9 465.0 L267.1 473.0 M319.1 465.0 L332.9 473.0"
        className="sc-pin"
      />
      <path d="M300.0 165.0 L504.4 283.0 L300.0 401.0 L95.6 283.0 Z" className="sc-face" />
      <path
        d="M95.6 283.0 L95.6 290.0 L300.0 408.0 L504.4 290.0 L504.4 283.0 M300.0 408.0 L300.0 401.0"
        className="sc-edge"
      />
      <path d="M300.0 177.0 L483.6 283.0 L300.0 389.0 L116.4 283.0 Z" className="sc-edge" />
      <path d="M300.0 143.0 L473.2 243.0 L300.0 343.0 L126.8 243.0 Z" className="sc-die" />
      <path
        d="M126.8 243.0 L126.8 248.0 L300.0 348.0 L473.2 248.0 L473.2 243.0 M300.0 348.0 L300.0 343.0"
        className="sc-edge"
      />
      <path d="M300.0 115.0 L435.1 193.0 L300.0 271.0 L164.9 193.0 Z" className="sc-die" />
      <path
        d="M164.9 193.0 L164.9 198.0 L300.0 276.0 L435.1 198.0 L435.1 193.0 M300.0 276.0 L300.0 271.0"
        className="sc-edge"
      />
      <path d="M300.0 86.0 L398.7 143.0 L300.0 200.0 L201.3 143.0 Z" className="sc-die" />
      <path
        d="M201.3 143.0 L201.3 148.0 L300.0 205.0 L398.7 148.0 L398.7 143.0 M300.0 205.0 L300.0 200.0"
        className="sc-edge"
      />
      <path
        d="M324.0 201.0 L280.9 176.1 L306.1 161.5 L300.0 158.0 M396.3 253.0 L411.0 261.4 L424.9 253.4 L386.8 231.4 M397.4 239.1 L375.8 226.6 L336.4 249.3 L323.5 241.9 M187.5 235.4 L176.7 229.2 L152.8 243.0 L152.8 243.0 M235.1 216.9 L216.5 206.2 L254.4 184.3 L254.4 184.3 M295.1 245.3 L344.5 273.8 L304.7 296.8 L276.2 280.3 M313.2 282.5 L335.9 295.5 L299.1 316.8 L309.3 322.7 M374.2 217.6 L338.1 196.7 L352.6 188.4 L409.9 221.4 M212.8 219.6 L261.6 247.8 L234.2 263.6 L274.4 286.9 M297.3 140.7 L286.5 134.5 L273.9 141.8 L308.1 161.6 M289.1 172.4 L254.9 152.7 L209.8 178.8 L209.8 178.8 M329.8 175.0 L308.8 162.9 L283.7 177.4 L297.1 185.1 M313.4 173.0 L328.8 181.9 L286.6 206.3 L323.0 227.4 M332.7 196.9 L313.8 186.0 L330.7 176.3 L296.0 156.2 M288.7 197.6 L268.7 186.0 L252.9 195.1 L285.8 214.1 M328.4 233.2 L299.0 216.2 L271.7 231.9 L296.8 246.4 M258.1 131.0 L247.4 124.9 L216.1 143.0 L230.4 151.3 M339.4 129.5 L315.3 115.6 L325.8 109.5 L313.7 102.5 M336.8 132.2 L353.3 141.7 L328.3 156.1 L341.7 163.8 M341.6 163.9 L319.5 151.2 L305.7 159.2 L330.8 173.7 M352.7 142.6 L363.7 148.9 L377.6 140.8 L382.6 143.7"
        className="sc-trace"
      />
      <ellipse cx="300.0" cy="98.0" rx="48" ry="26" className="sc-face" />
      <ellipse cx="300.0" cy="90.0" rx="44" ry="24" className="sc-die" />
      <ellipse cx="300.0" cy="86.0" rx="26" ry="14" className="sc-iris" />
      <path d="M300.0 330.0 L300.0 30.0" className="sc-axis" />
      <path d="M300.0 68.0 L430.0 70.0 L464.0 70.0" className="sc-lead" />
      <circle cx="300.0" cy="68.0" r="2.5" className="sc-dot" />
      <text x="470" y="74" className="sc-num">
        01
      </text>
      <path d="M398.7 143.0 L480.0 150.0 L514.0 150.0" className="sc-lead" />
      <circle cx="398.7" cy="143.0" r="2.5" className="sc-dot" />
      <text x="520" y="154" className="sc-num">
        02
      </text>
      <path d="M435.1 193.0 L500.0 215.0 L534.0 215.0" className="sc-lead" />
      <circle cx="435.1" cy="193.0" r="2.5" className="sc-dot" />
      <text x="540" y="219" className="sc-num">
        03
      </text>
      <path d="M473.2 243.0 L515.0 280.0 L549.0 280.0" className="sc-lead" />
      <circle cx="473.2" cy="243.0" r="2.5" className="sc-dot" />
      <text x="555" y="284" className="sc-num">
        04
      </text>
      <path d="M559.8 318.0 L520.0 345.0 L554.0 345.0" className="sc-lead" />
      <circle cx="559.8" cy="318.0" r="2.5" className="sc-dot" />
      <text x="560" y="349" className="sc-num">
        05
      </text>
    </svg>
  );
}
