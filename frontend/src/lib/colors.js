export const COLORS = {
  bg: '#10151B',
  surface: '#19212A',
  elevated: '#222D38',
  border: '#303B46',
  text: '#E8EDF2',
  muted: '#929EAA',
  teal: '#55B9A6',
  blue: '#7199C7',
  amber: '#E5AE57',
  red: '#E47777',
  grid: '#263039',
};

export const SEVERITY_COLORS = {
  Critical: COLORS.red,
  High: COLORS.amber,
  Medium: COLORS.blue,
  Low: '#7C8896',
};

export const SERIES_COLORS = {
  attacks: COLORS.blue,
  blocked: COLORS.teal,
  detected: COLORS.amber,
};

export const CHART_TOOLTIP_STYLE = {
  background: '#222D38',
  border: '1px solid #3A4652',
  borderRadius: 8,
  padding: '10px 12px',
  boxShadow: '0 12px 32px rgba(0,0,0,.4)',
  fontSize: 12,
};
