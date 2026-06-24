export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(formatDate(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function calculateStreak(logs: { date: string; completed: boolean }[]): number {
  const completed = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  let streak = 0;
  const cur = new Date();

  // si hoy no está completado, empieza desde ayer
  const todayStr = formatDate(cur);
  if (!completed.has(todayStr)) {
    cur.setDate(cur.getDate() - 1);
  }

  while (completed.has(formatDate(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  return streak;
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    days.push(formatDate(dd));
  }
  return days;
}

export function getLast30Days(): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 29; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    days.push(formatDate(dd));
  }
  return days;
}

export const CATEGORIES = [
  { value: "SALUD", label: "Salud", emoji: "·" },
  { value: "MENTE", label: "Mente", emoji: "·" },
  { value: "TRABAJO", label: "Trabajo", emoji: "·" },
  { value: "RELACIONES", label: "Relaciones", emoji: "·" },
  { value: "FINANZAS", label: "Finanzas", emoji: "·" },
  { value: "OTROS", label: "Otros", emoji: "·" },
];

export const TIME_OF_DAY = [
  { value: "MORNING", label: "Mañana", emoji: "○" },
  { value: "AFTERNOON", label: "Tarde", emoji: "◐" },
  { value: "EVENING", label: "Noche", emoji: "●" },
  { value: "ANYTIME", label: "Cualquier hora", emoji: "◇" },
];

export const FREQUENCY = [
  { value: "DAILY", label: "Todos los días" },
  { value: "WEEKDAYS", label: "Lunes a Viernes" },
  { value: "WEEKENDS", label: "Sábado y Domingo" },
  { value: "CUSTOM", label: "Días específicos" },
  { value: "INTERVAL", label: "Frecuencia personalizada" },
];

export const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const COLORS = [
  "#ffffff", "#e8e8e8", "#d0d0d0", "#b8b8b8",
  "#a0a0a0", "#888888", "#686868", "#484848",
  "#303030", "#1c1c1c",
];

export const ICONS = [
  "○", "●", "◆", "◇", "▲", "△", "■", "□",
  "✦", "✧", "✱", "◉", "⊕", "⬡", "◐", "◑",
  "▸", "◈", "—", "×",
];

export const QUOTES = [
  "La disciplina es elegir entre lo que quieres ahora y lo que quieres más.",
  "Cada acción es un voto hacia la persona que quieres ser.",
  "No hace falta ser perfecto. Solo consistente.",
  "El comienzo siempre es hoy.",
  "Los pequeños pasos diarios construyen resultados extraordinarios.",
  "Gana la mañana, gana el día.",
  "El carácter se revela en los momentos que nadie observa.",
  "La motivación te arranca. La disciplina te mantiene.",
  "Un día o el día uno. Tú decides.",
  "Lo que haces cada día importa más que lo que haces de vez en cuando.",
  "El dolor de la disciplina es menor que el del arrepentimiento.",
  "Sé el arquitecto de tu propia vida.",
  "La constancia es la forma más alta de inteligencia.",
  "Cada día es una nueva oportunidad de construirte.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No se trata de tiempo. Se trata de energía y enfoque.",
  "Haz hoy lo que otros no harán. Tendrás mañana lo que otros no tendrán.",
  "La excelencia no es un acto, es un hábito.",
  "Tu futuro es creado por lo que haces hoy, no mañana.",
  "El progreso, no la perfección, es la meta.",
  "Transforma tus intenciones en acciones. Tus acciones en hábitos.",
  "La vida que quieres vive al otro lado de la incomodidad.",
  "Cada esfuerzo que haces hoy es un regalo para tu yo futuro.",
  "Sé tan bueno que no puedan ignorarte.",
  "La claridad de propósito es la raíz de toda fortaleza.",
  "La versión más poderosa de ti ya existe. Solo necesitas encontrarla.",
  "No esperes el momento perfecto. Toma el momento y hazlo perfecto.",
  "El enfoque es saber a qué decirle no.",
  "Tu energía fluye hacia donde va tu atención.",
  "Los grandes resultados requieren grandes ambiciones.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
