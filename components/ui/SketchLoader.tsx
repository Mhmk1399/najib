"use client";

import {
  createContext,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

type BrandSketchLoaderProps = {
  open: boolean;
  label?: string;
  brand?: string;
  tagline?: string;
  lockScroll?: boolean;
  closeDelayMs?: number;
  zIndex?: number;
  className?: string;
};

type GlobalLoaderContextValue = {
  visible: boolean;
  show: (label?: string) => void;
  hide: () => void;
  setLabel: (label: string) => void;
};

type SketchTone = "ghost" | "detail" | "main";

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(
  null,
);

// main: 51
const NATURAL_MAIN_PATHS = [
  "M390 267Q388 261 368.5 229.0Q349 197 338.0 174.5Q327 152 321.5 137.0Q316 122 322.0 122.5L328 123",
  "M399 235Q404 229 407.0 215.5Q410 202 412.5 194.5Q415 187 419.5 165.5Q424 144 428.5 117.0Q433 90 433.0 84.5L433 79",
  "M399 235Q395 231 393.0 221.0Q391 211 390.0 209.5Q389 208 385.0 192.0Q381 176 374.5 140.0L368 104",
  "M452 437Q457 440 459.0 442.0Q461 444 464.0 445.5Q467 447 471.5 446.5Q476 446 480.0 441.5Q484 437 487.0 430.5Q490 424 491.0 423.0Q492 422 492.0 421.0Q492 420 496.0 412.0Q500 404 501.5 399.5L503 395",
  "M458 182Q459 177 466.5 161.5Q474 146 474.0 145.0Q474 144 475.0 142.5Q476 141 476.5 138.5Q477 136 480.0 129.0Q483 122 482.5 121.5Q482 121 476.0 121.5L470 122",
  "M404 630Q403 629 403.0 627.0Q403 625 403.5 624.5Q404 624 404.0 613.0Q404 602 404.5 601.5Q405 601 405.0 599.5Q405 598 404.5 597.5Q404 597 404.0 594.0Q404 591 404.5 590.5Q405 590 405.0 570.5L405 551",
  "M419 805Q420 799 425.0 789.5Q430 780 430.0 779.0Q430 778 436.0 766.5Q442 755 442.0 754.0Q442 753 444.5 748.0L447 743",
  "M448 200Q434 225 428.5 233.0Q423 241 423.0 242.0L423 243",
  "M540 227Q543 236 543.0 237.5Q543 239 544.5 242.5Q546 246 547.0 252.5Q548 259 548.5 259.5Q549 260 549.0 264.5Q549 269 549.5 269.5Q550 270 550.0 272.0Q550 274 549.5 274.5L549 275",
  "M396 484Q398 486 398.5 489.5Q399 493 400.0 495.5Q401 498 401.0 501.5Q401 505 402.0 507.5Q403 510 404.0 517.5L405 525",
  "M481 272Q481 270 482.5 267.0Q484 264 484.0 262.5Q484 261 486.0 256.5Q488 252 489.0 246.5Q490 241 491.5 240.0L493 239",
  "M394 485L388 521",
  "M394 270Q397 267 397.0 265.5Q397 264 398.0 261.5Q399 259 399.0 247.0L399 235",
  "M501 266Q501 288 500.5 288.5Q500 289 500.0 291.0Q500 293 501.5 295.5L503 298",
  "M401 669Q400 668 400.0 662.5Q400 657 399.5 656.5Q399 656 399.0 650.0Q399 644 400.0 641.0L401 638",
  "M515 407Q517 405 517.0 400.0Q517 395 514.0 389.0Q511 383 509.0 381.5L507 380",
  "M414 379Q419 386 424.0 395.5L429 405",
  "M342 99Q352 92 355.0 89.0Q358 86 360.5 82.0L363 78",
  "M493 239Q495 243 495.0 246.5Q495 250 496.5 255.0Q498 260 498.0 262.0Q498 264 499.0 264.5L500 265",
  "M401 354Q405 358 405.5 360.0Q406 362 408.5 366.5Q411 371 412.0 374.5L413 378",
  "M401 354Q397 357 397.0 358.5Q397 360 396.0 362.5Q395 365 395.0 367.5Q395 370 394.0 372.5Q393 375 393.0 377.0L393 379",
  "M497 214Q496 215 496.0 217.5Q496 220 495.0 223.0Q494 226 493.5 232.5L493 239",
  "M555 301Q557 297 553.5 290.5Q550 284 550.0 282.5Q550 281 549.5 280.5L549 280",
  "M504 315Q499 332 499.0 335.0L499 338",
  "M458 101Q458 103 463.0 110.0Q468 117 468.5 119.0L469 121",
  "M545 339Q547 337 547.0 336.0Q547 335 548.5 332.5Q550 330 550.5 323.5L551 317",
  "M368 102Q367 101 367.0 98.0Q367 95 366.5 94.5Q366 94 366.0 86.5L366 79",
  "M515 407Q513 405 512.5 400.5Q512 396 510.5 393.0Q509 390 507.5 389.5L506 389",
  "M502 434Q501 448 500.0 451.5L499 455",
  "M401 354Q401 351 400.5 350.5Q400 350 400.0 343.0Q400 336 399.0 334.5L398 333",
  "M405 527L405 549",
  "M393 313Q393 310 392.5 309.5Q392 309 392.0 301.5Q392 294 392.5 293.5L393 293",
  "M458 182Q455 185 452.0 192.0L449 199",
  "M505 395Q507 400 507.0 406.5Q507 413 507.5 413.5L508 414",
  "M395 483Q395 477 395.5 476.5Q396 476 395.5 472.0Q395 468 395.5 467.0L396 466",
  "M480 293L481 276",
  "M519 411Q518 412 518.0 414.0Q518 416 516.5 417.5Q515 419 512.0 419.0Q509 419 508.5 418.5L508 418",
  "M502 433L507 418",
  "M504 299Q504 304 503.0 306.0Q502 308 502.0 309.5Q502 311 503.0 312.5L504 314",
  "M437 417Q436 414 433.0 410.0L430 406",
  "M492 343L490 330",
  "M394 284Q393 283 393.5 277.0L394 271",
  "M396 464L397 451",
  "M406 293Q402 288 399.0 288.5L396 289",
  "M443 427Q451 434 451.0 435.0L451 436",
  "M398 300Q402 300 403.5 298.5Q405 297 405.5 295.5L406 294",
  "M509 414Q511 413 512.5 411.0L514 409",
  "M484 356Q487 353 487.5 351.5L488 350",
  "M438 418Q441 421 441.5 422.5L442 424",
  "M506 381Q505 382 505.0 385.0L505 388",
  "M397 299Q396 295 395.0 294.0L394 293",
] as const;

// detail: 42
const NATURAL_DETAIL_PATHS = [
  "M384 804Q428 680 437.5 599.0Q447 518 449.0 477.5L451 437",
  "M472 604Q475 593 475.0 589.5Q475 586 477.5 571.5Q480 557 487.0 524.5Q494 492 496.5 478.0Q499 464 499.0 460.5L499 457",
  "M461 713Q462 721 458.0 745.0Q454 769 445.0 810.5L436 852",
  "M517 121Q519 121 520.5 123.0Q522 125 522.5 128.0Q523 131 525.5 137.0Q528 143 529.0 149.0Q530 155 531.0 157.5Q532 160 533.0 169.0Q534 178 534.5 178.5Q535 179 535.0 182.5Q535 186 535.5 186.5Q536 187 536.0 192.5Q536 198 536.5 198.5Q537 199 537.0 202.0Q537 205 537.5 205.5Q538 206 538.0 208.5Q538 211 538.5 211.5Q539 212 539.0 214.5Q539 217 540.0 220.5Q541 224 540.5 225.0L540 226",
  "M392 380Q390 382 388.5 385.5Q387 389 385.0 396.0Q383 403 382.0 404.5Q381 406 377.0 417.0Q373 428 370.5 432.5Q368 437 368.0 438.0Q368 439 363.5 446.5Q359 454 354.5 458.0Q350 462 348.5 462.5Q347 463 341.5 463.0L336 463",
  "M497 213Q501 186 503.0 179.0Q505 172 505.0 170.0Q505 168 505.5 167.5Q506 167 506.5 162.5Q507 158 508.0 155.5Q509 153 510.0 146.0Q511 139 513.5 130.5L516 122",
  "M458 182Q459 183 462.5 183.0Q466 183 466.5 182.5Q467 182 471.0 182.0Q475 182 475.5 181.5Q476 181 480.5 181.0Q485 181 488.5 180.0Q492 179 492.5 179.5Q493 180 493.0 181.5Q493 183 492.0 186.0Q491 189 491.0 191.5Q491 194 486.0 195.5Q481 197 470.0 198.0Q459 199 458.5 199.5Q458 200 454.0 200.0L450 200",
  "M461 713Q461 710 462.0 708.0Q463 706 463.5 700.5Q464 695 465.5 690.0Q467 685 467.5 679.5Q468 674 468.5 673.5Q469 673 469.5 665.0Q470 657 470.5 656.5Q471 656 471.0 650.5Q471 645 471.5 644.5Q472 644 472.0 636.0L472 628",
  "M449 744Q449 747 447.5 751.5Q446 756 444.5 758.5Q443 761 443.0 762.0Q443 763 439.0 771.5Q435 780 435.0 781.0Q435 782 432.5 786.0Q430 790 430.0 791.0Q430 792 428.5 794.0Q427 796 425.0 800.5Q423 805 422.0 806.0L421 807",
  "M393 380Q394 381 394.0 400.0Q394 419 394.5 419.5Q395 420 395.0 428.0Q395 436 395.5 436.5Q396 437 396.0 443.0Q396 449 396.5 449.5L397 450",
  "M385 877Q392 861 392.5 858.5Q393 856 398.0 846.5Q403 837 403.0 836.0Q403 835 404.0 834.0Q405 833 405.0 832.0Q405 831 408.0 826.0L411 821",
  "M430 67Q416 62 405.0 61.5Q394 61 393.5 61.5Q393 62 386.5 62.5Q380 63 374.5 65.5L369 68",
  "M545 341Q545 350 544.5 351.5Q544 353 541.5 355.0Q539 357 538.0 358.5Q537 360 537.0 362.5Q537 365 535.5 368.5Q534 372 534.0 373.5Q534 375 529.5 385.5L525 396",
  "M420 620Q420 624 415.0 635.5Q410 647 409.0 651.0Q408 655 406.5 657.5Q405 660 404.5 663.5Q404 667 403.0 668.0L402 669",
  "M388 581Q388 537 388.5 536.5Q389 536 389.0 531.5L389 527",
  "M498 214Q499 215 499.5 221.5Q500 228 500.5 228.5Q501 229 501.0 232.0Q501 235 501.5 235.5Q502 236 502.0 250.0Q502 264 501.5 264.5L501 265",
  "M367 103Q364 104 363.0 106.0Q362 108 354.5 117.0Q347 126 342.0 125.5Q337 125 333.5 124.0L330 123",
  "M305 234Q305 226 304.5 225.5Q304 225 300.0 207.5L296 190",
  "M293 452Q286 450 279.5 450.5Q273 451 265.5 453.5Q258 456 254.5 458.0L251 460",
  "M476 107L516 121",
  "M417 250Q407 264 407.0 265.0Q407 266 405.0 268.5Q403 271 400.5 276.5Q398 282 397.0 283.0L396 284",
  "M468 122Q462 124 460.0 124.0Q458 124 457.5 124.5Q457 125 454.0 125.0Q451 125 444.0 116.0L437 107",
  "M263 161Q266 152 266.0 150.0Q266 148 268.0 142.0Q270 136 271.0 134.5L272 133",
  "M553 301Q550 301 549.5 300.5Q549 300 546.0 300.0Q543 300 542.5 300.5Q542 301 542.0 302.0Q542 303 544.0 305.5Q546 308 547.0 311.0Q548 314 549.0 315.0L550 316",
  "M342 100Q342 102 335.5 111.0Q329 120 329.0 121.0L329 122",
  "M292 389Q287 410 286.5 410.5L286 411",
  "M516 292Q520 292 522.0 291.0Q524 290 526.5 290.0Q529 290 529.5 289.5Q530 289 532.5 289.0L535 289",
  "M420 619L430 603",
  "M424 286Q420 287 415.0 290.0Q410 293 408.5 293.0L407 293",
  "M411 440Q408 441 403.0 445.5L398 450",
  "M408 629L419 619",
  "M517 306L505 314",
  "M480 293Q478 295 478.0 296.5Q478 298 476.5 302.0L475 306",
  "M411 539Q410 531 408.0 528.5L406 526",
  "M554 302Q554 305 552.5 307.0Q551 309 551.0 312.0L551 315",
  "M525 399L520 410",
  "M466 141Q459 143 456.5 143.0L454 143",
  "M478 273L472 281",
  "M496 345Q498 348 498.5 350.5L499 353",
  "M507 306Q512 304 513.5 304.0L515 304",
  "M307 238Q309 241 309.0 243.5L309 246",
  "M481 353Q484 350 485.5 349.5L487 349",
] as const;

// ghost: 53
const NATURAL_GHOST_PATHS = [
  "M178 221Q153 247 140.5 264.5Q128 282 117.0 303.0Q106 324 99.5 342.0Q93 360 87.5 390.0Q82 420 82.0 443.5Q82 467 84.0 482.5Q86 498 97.0 533.5Q108 569 127.5 602.0Q147 635 157.0 647.0Q167 659 185.5 676.5Q204 694 219.0 705.0Q234 716 250.0 725.0L266 734",
  "M547 733Q596 704 620.0 682.5Q644 661 662.5 637.0Q681 613 692.5 591.5Q704 570 712.0 547.5Q720 525 725.0 497.5Q730 470 730.0 440.0Q730 410 726.5 388.0L723 366",
  "M717 340Q715 338 712.5 329.5Q710 321 707.5 316.0Q705 311 705.0 310.0Q705 309 698.0 295.0Q691 281 681.5 266.0L672 251",
  "M465 366Q459 366 458.5 365.5Q458 365 456.0 365.0Q454 365 451.0 364.0Q448 363 443.0 360.5Q438 358 434.0 355.0Q430 352 424.0 345.5Q418 339 415.0 334.0Q412 329 410.5 327.5Q409 326 404.0 315.5L399 305",
  "M335 464Q336 518 336.5 518.5Q337 519 337.5 529.5Q338 540 338.5 540.5Q339 541 339.0 544.0Q339 547 339.5 547.5L340 548",
  "M395 747Q396 720 396.5 719.5Q397 719 397.0 714.0Q397 709 397.5 708.5Q398 708 398.0 698.0Q398 688 398.5 687.5Q399 687 399.0 684.0Q399 681 400.0 678.0Q401 675 401.0 672.5L401 670",
  "M454 689Q454 686 455.0 684.0Q456 682 456.0 680.5Q456 679 458.0 672.5Q460 666 460.0 664.0Q460 662 460.5 661.5Q461 661 464.0 644.0L467 627",
  "M246 409Q247 420 247.5 420.5Q248 421 248.0 426.0Q248 431 248.5 431.5Q249 432 249.5 445.5L250 459",
  "M417 507Q404 481 402.0 474.5Q400 468 398.5 466.5L397 465",
  "M314 331Q311 332 308.5 337.5Q306 343 303.5 350.5Q301 358 301.0 361.5Q301 365 299.5 369.0L298 373",
  "M482 395Q482 389 483.0 386.0Q484 383 491.0 369.0L498 355",
  "M318 275Q319 277 319.0 280.5Q319 284 320.0 286.0Q321 288 321.0 291.5Q321 295 323.5 301.0Q326 307 327.0 311.0L328 315",
  "M385 527Q383 534 383.0 536.0Q383 538 382.5 538.5Q382 539 382.0 541.0Q382 543 381.0 545.5Q380 548 380.0 550.0Q380 552 378.0 559.0L376 566",
  "M530 243Q536 260 538.5 265.0Q541 270 543.5 273.5L546 277",
  "M341 310Q342 311 344.5 311.0Q347 311 348.0 312.0Q349 313 354.5 312.5Q360 312 368.5 308.5L377 305",
  "M251 292Q247 304 245.0 307.5Q243 311 243.0 315.5Q243 320 243.5 320.5Q244 321 244.0 323.5Q244 326 244.5 327.0L245 328",
  "M437 418Q434 421 424.5 426.0Q415 431 410.5 435.0L406 439",
  "M458 293Q457 306 459.5 311.5Q462 317 462.0 323.0L462 329",
  "M298 312Q298 299 299.5 295.5Q301 292 301.5 287.5Q302 283 303.0 280.5L304 278",
  "M480 293Q482 298 483.0 304.0Q484 310 486.5 317.5L489 325",
  "M457 99Q449 93 444.5 88.5Q440 84 437.5 80.5L435 77",
  "M539 226Q537 224 535.0 218.0Q533 212 531.5 205.0L530 198",
  "M339 635Q341 637 341.0 638.0Q341 639 343.5 643.5Q346 648 346.0 649.0Q346 650 348.5 654.5Q351 659 351.0 660.0L351 661",
  "M342 293Q341 292 340.5 285.5Q340 279 339.0 276.5Q338 274 337.5 269.5L337 265",
  "M267 196Q262 219 261.0 221.0L260 223",
  "M498 374Q498 376 493.5 384.0Q489 392 487.0 394.0Q485 396 484.0 396.0L483 396",
  "M506 379Q505 366 504.0 362.5Q503 359 501.5 356.5L500 354",
  "M539 284Q537 282 533.0 280.5Q529 279 524.5 279.0Q520 279 517.5 280.5L515 282",
  "M319 305L312 329",
  "M319 270Q318 264 314.0 255.5L310 247",
  "M294 118L317 110",
  "M273 130Q273 128 275.0 125.0Q277 122 279.5 122.0Q282 122 285.5 120.5Q289 119 290.5 119.0L292 119",
  "M461 713Q458 715 455.5 723.5L453 732",
  "M254 250Q255 249 255.0 247.0Q255 245 255.5 244.5Q256 244 256.0 242.0Q256 240 257.0 237.0Q258 234 258.0 231.5L258 229",
  "M324 559Q320 545 318.5 542.5L317 540",
  "M314 529Q312 524 311.5 519.0Q311 514 310.0 512.0L309 510",
  "M459 291L461 271",
  "M336 330Q336 321 338.0 316.0L340 311",
  "M341 99L324 107",
  "M332 289Q330 285 328.0 283.0Q326 281 324.0 277.0L322 273",
  "M337 631Q335 623 333.5 620.0Q332 617 332.0 615.0L332 613",
  "M339 309Q333 304 330.5 299.5L328 295",
  "M415 554Q413 542 412.0 540.5L411 539",
  "M479 358Q476 362 473.0 363.5Q470 365 468.5 365.0L467 365",
  "M472 605Q473 606 473.0 613.0L473 620",
  "M472 105L460 99",
  "M524 284Q534 284 534.5 284.5Q535 285 536.5 285.0L538 285",
  "M540 285L551 292",
  "M471 606Q470 613 469.5 613.5Q469 614 469.0 616.5L469 619",
  "M549 295Q546 295 541.5 293.5L537 292",
  "M408 564L408 551",
  "M432 872L434 860",
  "M342 296Q342 307 341.5 307.5L341 308",
] as const;

function stopLenis() {
  if (typeof window === "undefined") return;

  const win = window as typeof window & {
    __lenis?: { stop?: () => void };
    lenis?: { stop?: () => void };
  };

  (win.__lenis ?? win.lenis)?.stop?.();
}

function startLenis() {
  if (typeof window === "undefined") return;

  const win = window as typeof window & {
    __lenis?: { start?: () => void };
    lenis?: { start?: () => void };
  };

  (win.__lenis ?? win.lenis)?.start?.();
}

function strokeStyle(
  tone: SketchTone,
  index: number,
  passOffset = 0,
): CSSProperties {
  const baseDelay = tone === "ghost" ? 0.06 : tone === "main" ? 0.48 : 1.02;
  const duration = tone === "ghost" ? 1.4 : tone === "main" ? 1.78 : 1.36;
  const cluster = index % 12;
  const wave = Math.floor(index / 12) * 0.05;
  const micro = (index % 3) * 0.008;
  const stagger = cluster * 0.03 + wave + micro;
  const easing =
    tone === "ghost"
      ? "cubic-bezier(.32,.08,.28,1)"
      : tone === "main"
        ? "cubic-bezier(.22,1,.36,1)"
        : "cubic-bezier(.3,.88,.35,1)";

  return {
    "--najib-draw-delay": `${baseDelay + stagger + passOffset}s`,
    "--najib-draw-duration": `${duration}s`,
    "--najib-draw-ease": easing,
  } as CSSProperties;
}

function SketchStroke({
  d,
  tone,
  index,
  passOffset = 0,
  className = "",
}: {
  d: string;
  tone: SketchTone;
  index: number;
  passOffset?: number;
  className?: string;
}) {
  return (
    <path
      d={d}
      pathLength={1}
      style={strokeStyle(tone, index, passOffset)}
      className={`najib-loader-line najib-loader-line--${tone} ${className}`}
    />
  );
}

function CoutureSketch({ uid }: { uid: string }) {
  const pencilFilterId = `najib-pencil-${uid}`;
  const lineShadowId = `najib-line-shadow-${uid}`;
  const groundShadowId = `najib-ground-shadow-${uid}`;
  const jacketWashId = `najib-jacket-wash-${uid}`;
  const trouserWashId = `najib-trouser-wash-${uid}`;

  return (
    <svg
      viewBox="0 0 790 880"
      role="img"
      aria-label="طراحی دستی و طبیعی کت‌وشلوار نجیب‌زاده"
      className="block h-auto w-full overflow-visible"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id={pencilFilterId}
          x="-6%"
          y="-6%"
          width="112%"
          height="112%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0048 0.0085"
            numOctaves="2"
            seed="29"
            result="paperNoise"
          >
            <animate
              attributeName="baseFrequency"
              dur="7.2s"
              values="0.0048 0.0085;0.0052 0.0080;0.0048 0.0085"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="paperNoise"
            scale="0.46"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>

        <filter
          id={lineShadowId}
          x="-18%"
          y="-18%"
          width="136%"
          height="142%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="3.8"
            dy="7.5"
            stdDeviation="5.8"
            floodColor="#342d26"
            floodOpacity="0.16"
          />
        </filter>

        <filter
          id={groundShadowId}
          x="-50%"
          y="-300%"
          width="200%"
          height="700%"
        >
          <feGaussianBlur stdDeviation="10" />
        </filter>

        <linearGradient id={jacketWashId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#292521" stopOpacity="0.015" />
          <stop offset="0.56" stopColor="#292521" stopOpacity="0.09" />
          <stop offset="1" stopColor="#292521" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={trouserWashId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#312b25" stopOpacity="0" />
          <stop offset="0.74" stopColor="#312b25" stopOpacity="0.07" />
          <stop offset="1" stopColor="#312b25" stopOpacity="0.015" />
        </linearGradient>
      </defs>

      {/* A soft grounding shadow prevents the garment from floating. */}
      <ellipse
        aria-hidden="true"
        cx="408"
        cy="844"
        rx="92"
        ry="9"
        fill="#29231d"
        opacity="0.14"
        filter={`url(#${groundShadowId})`}
        className="najib-loader-ground-shadow"
      />

      {/* Low-opacity tonal washes add tailoring depth without becoming an illustration fill. */}
      <g aria-hidden="true" className="najib-loader-volume-pass">
        <path
          d="M398 72C448 66 504 82 534 123C558 156 566 209 558 269C552 324 533 388 495 447C469 484 443 478 420 449C399 420 390 381 391 330C392 273 404 214 428 163Z"
          fill={`url(#${jacketWashId})`}
        />
        <path
          d="M405 431C434 442 469 445 501 430C498 503 489 580 475 657C464 721 448 784 421 849C419 716 415 574 405 431Z"
          fill={`url(#${trouserWashId})`}
        />
      </g>

      <g filter={`url(#${lineShadowId})`}>
        <g
          filter={`url(#${pencilFilterId})`}
          className="najib-loader-pencil-jitter"
        >
          {/* Pass 1 — construction and fading gesture marks. */}
          <g className="najib-loader-pass najib-loader-pass--ghost">
            {NATURAL_GHOST_PATHS.map((d, index) => (
              <SketchStroke
                key={`ghost-${index}`}
                d={d}
                tone="ghost"
                index={index}
              />
            ))}
          </g>

          {/* Pass 2 — a tiny displaced graphite under-stroke creates a multi-pass hand. */}
          <g className="najib-loader-pass najib-loader-pass--under">
            {NATURAL_MAIN_PATHS.map((d, index) => (
              <SketchStroke
                key={`under-${index}`}
                d={d}
                tone="main"
                index={index}
                passOffset={-0.11}
                className="najib-loader-line--under"
              />
            ))}
          </g>

          {/* Pass 3 — confident final tailoring contour. */}
          <g className="najib-loader-pass najib-loader-pass--main">
            {NATURAL_MAIN_PATHS.map((d, index) => (
              <SketchStroke
                key={`main-${index}`}
                d={d}
                tone="main"
                index={index}
              />
            ))}
          </g>

          {/* Pass 4 — pockets, hand, folds, lapel and trouser details. */}
          <g className="najib-loader-pass najib-loader-pass--detail">
            {NATURAL_DETAIL_PATHS.map((d, index) => (
              <SketchStroke
                key={`detail-${index}`}
                d={d}
                tone="detail"
                index={index}
              />
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
}

export function BrandSketchLoader({
  open,
  label = "در حال آماده‌سازی",
  brand = "NAJIBZADEH",
  tagline = "DRESS A HIGHER STANDARD",
  lockScroll = true,
  closeDelayMs = 320,
  zIndex = 2147483000,
  className = "",
}: BrandSketchLoaderProps) {
  const [rendered, setRendered] = useState(open);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setPortalTarget(document.body);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    let animationFrame: number | null = null;
    let timer: number | null = null;

    if (open) {
      animationFrame = window.requestAnimationFrame(() => setRendered(true));
    } else {
      timer = window.setTimeout(() => setRendered(false), closeDelayMs);
    }

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [closeDelayMs, open]);

  useEffect(() => {
    if (!open || !lockScroll) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    stopLenis();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      startLenis();
    };
  }, [lockScroll, open]);

  const overlayStyle = useMemo<CSSProperties>(() => ({ zIndex }), [zIndex]);

  if (!rendered) return null;

  const loader = (
    <div
      role="status"
      aria-live="polite"
      aria-busy={open}
      aria-label={label}
      style={overlayStyle}
      className={`fixed inset-0 grid place-items-center overflow-hidden transition-opacity duration-300 ease-out ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#fbf8f2]"
      />

      <div className="relative z-10 flex min-h-[100dvh] w-full items-center justify-center px-5 py-8 sm:px-6 sm:py-10">
        <div className="flex w-full max-w-[268px] flex-col items-center justify-center md:max-w-[286px] lg:max-w-[304px] xl:max-w-[316px]">
          <div className="w-[min(44vw,166px)] min-w-[132px] sm:w-[162px] md:w-[174px] lg:w-[198px] xl:w-[208px]">
            <CoutureSketch uid={uid} />
          </div>

          <div
            aria-hidden="true"
            className="relative mt-1 h-px w-[min(40vw,148px)] overflow-hidden bg-[#2f2b27]/16 sm:w-[162px] md:w-[174px] lg:w-[182px]"
          >
            <span className="najib-loader-progress absolute inset-y-0 left-0 block w-[34%] bg-[#26231f]" />
          </div>

          <div className="mt-5 text-center sm:mt-6">
            <p
              className="whitespace-nowrap text-[clamp(1.02rem,4vw,1.78rem)] font-normal leading-none tracking-[0.28em] text-[#24211e] sm:tracking-[0.34em]"
              style={{
                fontFamily:
                  '"Bodoni Moda", "Cormorant Garamond", "Times New Roman", serif',
                transform: "translateX(0.14em)",
              }}
            >
              {brand}
            </p>

            <span className="mx-auto mt-4 block h-px w-8 bg-[#3c3833]/70 sm:w-9" />

            <p className="mt-3 whitespace-nowrap text-[6.5px] font-medium uppercase tracking-[0.34em] text-[#615c55] sm:text-[7px] sm:tracking-[0.44em]">
              {tagline}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .najib-loader-line {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: najib-loader-draw var(--najib-draw-duration, 1.65s)
              var(--najib-draw-ease, cubic-bezier(.22, 1, .36, 1)) var(--najib-draw-delay, 0s) forwards,
            najib-loader-settle 5.8s ease-in-out calc(var(--najib-draw-delay, 0s) + var(--najib-draw-duration, 1.65s)) infinite;
          will-change: stroke-dashoffset, opacity, transform;
        }

        .najib-loader-line--ghost {
          stroke: rgba(82, 75, 67, .34);
          stroke-width: .8;
        }

        .najib-loader-line--main {
          stroke: rgba(31, 29, 27, .94);
          stroke-width: 1.42;
        }

        .najib-loader-line--detail {
          stroke: rgba(49, 45, 41, .68);
          stroke-width: .98;
        }

        .najib-loader-line--under {
          stroke: rgba(82, 73, 64, .18);
          stroke-width: 1.95;
          filter: blur(.14px);
        }

        .najib-loader-pass--under {
          transform: translate(.54px, -.26px);
          opacity: .68;
        }

        .najib-loader-pass--ghost { opacity: .78; }
        .najib-loader-pass--main { opacity: 1; }
        .najib-loader-pass--detail { opacity: .95; }

        .najib-loader-pencil-jitter {
          transform-origin: 51% 45%;
          animation: najib-loader-jitter 5.6s steps(3, end) 1.8s infinite;
          will-change: transform;
        }

        .najib-loader-volume-pass {
          opacity: 0;
          animation: najib-loader-volume-in 1.35s cubic-bezier(.22, 1, .36, 1) 1.1s forwards;
        }

        .najib-loader-ground-shadow {
          transform-origin: center;
          animation: najib-loader-shadow-in 1.05s ease .74s both,
            najib-loader-shadow-breathe 4.2s ease-in-out 2s infinite;
        }

        .najib-loader-progress {
          transform-origin: left center;
          animation: najib-loader-sweep 1.95s cubic-bezier(.58, .08, .34, 1) infinite;
          will-change: transform, opacity;
        }

        @keyframes najib-loader-draw {
          0% { stroke-dashoffset: 1; opacity: 0; }
          12% { opacity: .2; }
          32% { opacity: .9; }
          72% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }

        @keyframes najib-loader-settle {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(.08px, -.05px, 0); }
        }

        @keyframes najib-loader-jitter {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          20% { transform: translate3d(.12px, -.08px, 0) rotate(.008deg); }
          40% { transform: translate3d(-.10px, .10px, 0) rotate(-.009deg); }
          60% { transform: translate3d(.08px, .06px, 0) rotate(.007deg); }
          80% { transform: translate3d(-.06px, -.05px, 0) rotate(-.006deg); }
        }

        @keyframes najib-loader-volume-in {
          from { opacity: 0; transform: translateY(1px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes najib-loader-shadow-in {
          from { opacity: 0; transform: scaleX(.45); }
          to { opacity: 1; transform: scaleX(1); }
        }

        @keyframes najib-loader-shadow-breathe {
          0%, 100% { opacity: .8; transform: scaleX(.97); }
          50% { opacity: 1; transform: scaleX(1.03); }
        }

        @keyframes najib-loader-sweep {
          0% { transform: translateX(-140%) scaleX(.32); opacity: .12; }
          18% { opacity: .34; }
          50% { transform: translateX(38%) scaleX(.82); opacity: 1; }
          82% { opacity: .48; }
          100% { transform: translateX(238%) scaleX(.46); opacity: .12; }
        }

        @media (max-width: 767px) {
          .najib-loader-pencil-jitter { animation-duration: 6s; }
        }

        @media (min-width: 768px) and (max-width: 1199px) {
          .najib-loader-pencil-jitter { animation-duration: 5.8s; }
        }

        @media (prefers-reduced-motion: reduce) {
          .najib-loader-line {
            animation: none;
            stroke-dashoffset: 0;
            opacity: 1;
          }

          .najib-loader-pencil-jitter,
          .najib-loader-volume-pass,
          .najib-loader-ground-shadow {
            animation: none;
            opacity: 1;
          }

          .najib-loader-progress {
            width: 50%;
            transform: translateX(54%);
            animation: najib-loader-reduced-pulse 1.2s ease-in-out infinite;
          }

          @keyframes najib-loader-reduced-pulse {
            0%, 100% { opacity: .35; }
            50% { opacity: .95; }
          }
        }
      `}</style>
    </div>
  );

  return portalTarget ? createPortal(loader, portalTarget) : loader;
}

type GlobalSketchLoaderProviderProps = {
  children: ReactNode;
  brand?: string;
  tagline?: string;
};

export function GlobalSketchLoaderProvider({
  children,
  brand,
  tagline,
}: GlobalSketchLoaderProviderProps) {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("در حال آماده‌سازی");

  const show = useCallback((nextLabel?: string) => {
    if (nextLabel) setLabel(nextLabel);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const value = useMemo<GlobalLoaderContextValue>(
    () => ({ visible, show, hide, setLabel }),
    [hide, show, visible],
  );

  return (
    <GlobalLoaderContext.Provider value={value}>
      {children}
      <BrandSketchLoader
        open={visible}
        label={label}
        brand={brand}
        tagline={tagline}
      />
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalSketchLoader() {
  const context = useContext(GlobalLoaderContext);

  if (!context) {
    throw new Error(
      "useGlobalSketchLoader must be used inside GlobalSketchLoaderProvider.",
    );
  }

  return context;
}
